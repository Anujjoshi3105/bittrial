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

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  workspaceOwner: uuid("workspace_owner").notNull(),
  emoji: jsonb("emoji"),
  title: text("title"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isDeleted: boolean("is_deleted"),
});

export const pages = pgTable("pages", {
  id: uuid("id").notNull().defaultRandom(),
  userId: uuid("user_id").notNull(),
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
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
      onDelete: "cascade",
    }),
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
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
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
