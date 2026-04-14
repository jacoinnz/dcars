import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const db = getDb();
        const rows = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);
        const user = rows[0];
        if (!user) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = Boolean(
          (user as { isSuperAdmin?: boolean }).isSuperAdmin,
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};

/** When `SKIP_AUTH=true`, returns a synthetic session (dev/smoke tests only). Never enable in production. */
export async function getServerSessionWithBypass(): Promise<Session | null> {
  if (process.env.SKIP_AUTH === "true") {
    const userId =
      process.env.SKIP_AUTH_USER_ID?.trim() || "00000000-0000-4000-8000-000000000001";
    return {
      expires: new Date(Date.now() + 86400000 * 365).toISOString(),
      user: {
        id: userId,
        email: process.env.SKIP_AUTH_EMAIL ?? "skip-auth@localhost",
        name: "Skip auth (dev)",
        isSuperAdmin: process.env.SKIP_AUTH_SUPER_ADMIN !== "false",
      },
    };
  }
  return getServerSession(authOptions);
}
