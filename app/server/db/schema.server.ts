import {
  pgTable,
  pgEnum,
  text,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const backgroundColorMap = ["RED", "BLUE", "YELLOW", "GREEN"] as const;
export const backgroundColorEnum = pgEnum(
  "background_color",
  backgroundColorMap,
);

export const emojisMap = ["THUMBS_UP", "SMILING", "APPREACIATED"] as const;
export const emojisType = pgEnum("emojis_type", emojisMap);

export const kudos = pgTable("kudos", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => users.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  backgroundColor: backgroundColorEnum().default("RED"),
  emojisType: emojisType().default("THUMBS_UP"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});
