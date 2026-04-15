import { isNull } from "drizzle-orm";
import { students } from "@/db/schema";

/** Drizzle fragment: student row is not soft-deleted (use inside `and(...)`). */
export const studentIsActive = isNull(students.deletedAt);
