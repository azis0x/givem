// app/server/users.server.ts
import { eq } from "drizzle-orm";
import { db } from "./db/drizzle.server";
import { users } from "./db/schema.server";
import { generateSalt, hashPassword } from "./utils.server";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function createUser({
  name,
  email,
  password,
}: CreateUserInput): Promise<string | null> {
  // Single query: try insert, catch unique violation instead of pre-check race
  try {
    const salt = generateSalt();
    const hashed = await hashPassword(password, salt);
    const [user] = await db
      .insert(users)
      .values({ name, email, password: hashed })
      .returning({ id: users.id });
    return user.id;
  } catch (err: unknown) {
    // Postgres unique violation code
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return null;
    }
    throw err;
  }
}

export async function getAllUsers(limit = 200) {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name)
    .limit(limit);
}
