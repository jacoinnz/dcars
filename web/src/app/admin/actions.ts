"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { appUsers, siteUserPermissions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";

async function requireSuperAdmin() {
  const s = await getServerSession(authOptions);
  if (!s?.user?.id || !s.user.isSuperAdmin) redirect("/");
  return s.user;
}

export async function adminCreateSite(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!name || !code) {
    throw new Error("Name and code are required.");
  }
  const db = getDb();
  const id = crypto.randomUUID();
  try {
    await db.insert(sites).values({
      id,
      name,
      code,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    throw new Error("Could not create site (code may already exist).");
  }
  revalidatePath("/admin/sites");
  revalidatePath("/entry");
}

export async function adminUpdateSite(siteId: string, formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!name || !code) {
    throw new Error("Name and code are required.");
  }
  const db = getDb();
  try {
    await db.update(sites).set({ name, code }).where(eq(sites.id, siteId));
  } catch (e) {
    console.error(e);
    throw new Error("Could not update site (code may already exist).");
  }
  revalidatePath("/admin/sites");
  revalidatePath("/entry");
}

export async function adminDeleteSite(siteId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  try {
    await db.delete(sites).where(eq(sites.id, siteId));
  } catch (e) {
    console.error(e);
    throw new Error("Could not delete site.");
  }
  revalidatePath("/admin/sites");
  revalidatePath("/entry");
}

export async function adminCreateUser(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const isSuperAdmin = formData.get("isSuperAdmin") === "on";
  if (!email || !name || password.length < 8) {
    throw new Error("Email, name, and password (min 8 characters) are required.");
  }
  const db = getDb();
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await db.insert(appUsers).values({
      id,
      email,
      name,
      passwordHash,
      isSuperAdmin,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    throw new Error("Could not create user (email may exist).");
  }
  revalidatePath("/admin/users");
  redirect(`/admin/users/${id}`);
}

export async function adminUpdateUser(userId: string, formData: FormData): Promise<void> {
  const admin = await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const isSuperAdmin = formData.get("isSuperAdmin") === "on";
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!email || !name) {
    throw new Error("Email and name are required.");
  }
  const db = getDb();
  const [existing] = await db.select().from(appUsers).where(eq(appUsers.id, userId)).limit(1);
  if (!existing) {
    throw new Error("User not found.");
  }
  if (userId === admin.id && existing.isSuperAdmin && !isSuperAdmin) {
    throw new Error("You cannot remove your own super-admin access.");
  }

  const updates: {
    name: string;
    email: string;
    isSuperAdmin: boolean;
    passwordHash?: string;
  } = { name, email, isSuperAdmin };
  if (newPassword.length > 0) {
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }
  try {
    await db.update(appUsers).set(updates).where(eq(appUsers.id, userId));
  } catch (e) {
    console.error(e);
    throw new Error("Could not update user (email may exist).");
  }

  if (isSuperAdmin) {
    await db.delete(siteUserPermissions).where(eq(siteUserPermissions.userId, userId));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const admin = await requireSuperAdmin();
  if (userId === admin.id) {
    throw new Error("You cannot delete your own account.");
  }
  const db = getDb();
  try {
    await db.delete(appUsers).where(eq(appUsers.id, userId));
  } catch (e) {
    console.error(e);
    throw new Error("Could not delete user.");
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function adminSaveUserSitePermissions(
  userId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  const [target] = await db
    .select({ isSuperAdmin: appUsers.isSuperAdmin })
    .from(appUsers)
    .where(eq(appUsers.id, userId))
    .limit(1);
  if (!target) throw new Error("User not found.");
  if (target.isSuperAdmin) {
    throw new Error("Site permissions do not apply to super admins.");
  }

  const allSites = await db.select({ id: sites.id }).from(sites);
  for (const s of allSites) {
    const view = formData.get(`site_${s.id}_view`) === "on";
    const create = formData.get(`site_${s.id}_create`) === "on";
    const update = formData.get(`site_${s.id}_update`) === "on";
    const del = formData.get(`site_${s.id}_delete`) === "on";

    const existing = await db
      .select({ id: siteUserPermissions.id })
      .from(siteUserPermissions)
      .where(
        and(eq(siteUserPermissions.userId, userId), eq(siteUserPermissions.siteId, s.id)),
      )
      .limit(1);

    const anyPerm = view || create || update || del;
    if (!anyPerm) {
      if (existing[0]) {
        await db.delete(siteUserPermissions).where(eq(siteUserPermissions.id, existing[0].id));
      }
      continue;
    }

    if (existing[0]) {
      await db
        .update(siteUserPermissions)
        .set({
          canView: view,
          canCreate: create,
          canUpdate: update,
          canDelete: del,
        })
        .where(eq(siteUserPermissions.id, existing[0].id));
    } else {
      await db.insert(siteUserPermissions).values({
        id: crypto.randomUUID(),
        userId,
        siteId: s.id,
        canView: view,
        canCreate: create,
        canUpdate: update,
        canDelete: del,
      });
    }
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/entry");
}
