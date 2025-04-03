import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const feedbackFeelEnum = pgEnum("FEEDBACK_FEEL", [
  "TERRIBLE",
  "BAD",
  "OKAY",
  "GOOD",
  "AMAZING",
]);

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  feel: feedbackFeelEnum("feel").notNull(),
  isContacted: boolean("is_contacted"),
  message: text("message"),
  userId: uuid("user_id").notNull(),
});

export const pages = pgTable("pages", {
  id: uuid("id").notNull().defaultRandom(),
  title: text("title"),
  description: text("description"),
  content: jsonb("content"),
  emoji: jsonb("emoji"),
  imageUrl: varchar("image_url"),
  isDeleted: boolean("is_deleted"),
  isFavorite: boolean("is_favorite"),
  isPublished: boolean("is_published"),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  owner: uuid("owner").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  username: text("username").unique(),
  fullname: text("fullname"),
  bio: text("bio"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collaborators = pgTable("collaborators", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
