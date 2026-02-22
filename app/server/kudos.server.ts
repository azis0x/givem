// app/server/kudos.server.ts
import { db } from "./db/drizzle.server";
import { kudos as kudosTable, users } from "./db/schema.server";
import { eq, desc, and, sql } from "drizzle-orm";

export type BgColor = "RED" | "BLUE" | "YELLOW" | "GREEN";
export type EmojiType = "THUMBS_UP" | "SMILING" | "APPREACIATED";

export type CreateKudosInput = {
  authorId: string;
  recipientId: string;
  content: string;
  backgroundColor?: BgColor;
  emojisType?: EmojiType;
};

const VALID_BG_COLORS = new Set<string>(["RED", "BLUE", "YELLOW", "GREEN"]);
const VALID_EMOJI_TYPES = new Set<string>([
  "THUMBS_UP",
  "SMILING",
  "APPREACIATED",
]);

export function parseBgColor(value: unknown): BgColor {
  const s = String(value ?? "");
  return VALID_BG_COLORS.has(s) ? (s as BgColor) : "RED";
}

export function parseEmojiType(value: unknown): EmojiType {
  const s = String(value ?? "");
  return VALID_EMOJI_TYPES.has(s) ? (s as EmojiType) : "THUMBS_UP";
}

export type KudosFeedItem = {
  id: string;
  content: string;
  backgroundColor: BgColor | null;
  emojisType: EmojiType | null;
  createdAt: Date;
  authorId: string;
  recipientId: string;
  authorName: string | null;
  authorEmail: string | null;
};

export async function createKudos(input: CreateKudosInput) {
  const [row] = await db
    .insert(kudosTable)
    .values({
      authorId: input.authorId,
      recipientId: input.recipientId,
      content: input.content.trim(),
      backgroundColor: input.backgroundColor ?? "RED",
      emojisType: input.emojisType ?? "THUMBS_UP",
    })
    .returning({ id: kudosTable.id, createdAt: kudosTable.createdAt });
  return row;
}

export async function getLatestKudos(limit = 30): Promise<KudosFeedItem[]> {
  return db
    .select({
      id: kudosTable.id,
      content: kudosTable.content,
      backgroundColor: kudosTable.backgroundColor,
      emojisType: kudosTable.emojisType,
      createdAt: kudosTable.createdAt,
      authorId: kudosTable.authorId,
      recipientId: kudosTable.recipientId,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(kudosTable)
    .leftJoin(users, eq(users.id, kudosTable.authorId))
    .orderBy(desc(kudosTable.createdAt))
    .limit(limit) as unknown as KudosFeedItem[];
}

export type Notification = {
  id: string;
  content: string;
  authorId: string;
  authorName: string | null;
  isRead: boolean;
  createdAt: Date;
};

export async function getNotificationsForUser(
  userId: string,
  limit = 30,
): Promise<Notification[]> {
  return db
    .select({
      id: kudosTable.id,
      content: kudosTable.content,
      authorId: kudosTable.authorId,
      isRead: kudosTable.isRead,
      createdAt: kudosTable.createdAt,
      authorName: users.name,
    })
    .from(kudosTable)
    .leftJoin(users, eq(users.id, kudosTable.authorId))
    .where(eq(kudosTable.recipientId, userId))
    .orderBy(desc(kudosTable.createdAt))
    .limit(limit) as unknown as Notification[];
}

export async function markNotificationsReadForUser(userId: string) {
  await db
    .update(kudosTable)
    .set({ isRead: true })
    .where(
      and(eq(kudosTable.recipientId, userId), eq(kudosTable.isRead, false)),
    );
}

export async function deleteKudos(kudosId: string, actorId: string) {
  const [deleted] = await db
    .delete(kudosTable)
    .where(and(eq(kudosTable.id, kudosId), eq(kudosTable.authorId, actorId)))
    .returning({ id: kudosTable.id });
  return deleted ?? null;
}

export async function updateKudos(
  kudosId: string,
  actorId: string,
  patch: Partial<
    Pick<CreateKudosInput, "content" | "backgroundColor" | "emojisType">
  >,
) {
  const set: Record<string, unknown> = { updatedAt: sql`now()` };
  if ("content" in patch) set.content = patch.content;
  if ("backgroundColor" in patch) set.backgroundColor = patch.backgroundColor;
  if ("emojisType" in patch) set.emojisType = patch.emojisType;

  return db
    .update(kudosTable)
    .set(set)
    .where(and(eq(kudosTable.id, kudosId), eq(kudosTable.authorId, actorId)))
    .returning();
}

export async function unreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kudosTable)
    .where(
      and(eq(kudosTable.recipientId, userId), eq(kudosTable.isRead, false)),
    );
  return row?.count ?? 0;
}
