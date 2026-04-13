import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { sites } from "@/db/schema";

export async function getAllSites() {
  const db = getDb();
  return db.select().from(sites).orderBy(asc(sites.name));
}
