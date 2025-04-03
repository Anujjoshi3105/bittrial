"use server";

import db from "@/lib/supabase/db";
import { users, pages } from "@/lib/supabase/migrations/schema";
import { notExists, and, eq, desc } from "drizzle-orm";
import { collaborators } from "@/lib/supabase/schema";
import { validate } from "uuid";
import { createClient } from "../supabase/utils/server";
import { Page } from "@/types/supabase.types";

/** Get page by user id */
export async function getPagesByUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return null;

  const userPages = await db
    .select()
    .from(pages)
    .where(eq(pages.owner, userId));

  return userPages;
}

/** Get page details by page ID */
export async function getPageDetails(id: string) {
  if (!validate(id)) {
    return { error: "Error: Invalid page ID" };
  }

  try {
    const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    return { data: page[0] ?? null, error: null };
  } catch (error) {
    return { error: `Error: ${error}` };
  }
}

/** Create a new page */
export async function createPage(page: Page) {
  try {
    const response = await db.insert(pages).values(page).returning();
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
}

/** Get only private pages */
export async function getPrivatePages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return [];

  const privatePages = await db
    .select({
      id: pages.id,
      title: pages.title,
      description: pages.description,
      content: pages.content,
      emoji: pages.emoji,
      image_url: pages.imageUrl,
      is_deleted: pages.isDeleted,
      is_favorite: pages.isFavorite,
      is_published: pages.isPublished,
      parent_id: pages.parentId,
      updated_at: pages.updatedAt,
      created_at: pages.createdAt,
      owner: pages.owner,
    })
    .from(pages)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.pageId, pages.id))
        ),
        eq(pages.owner, userId)
      )
    )
    .orderBy(desc(pages.createdAt));

  return privatePages;
}

/** Get only collaborating pages */
export async function getCollaboratingPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return [];

  const collaboratingPages = await db
    .select({
      id: pages.id,
      createdAt: pages.createdAt,
      owner: pages.owner,
      title: pages.title,
      description: pages.description,
      emoji: pages.emoji,
      isDeleted: pages.isDeleted,
      imageUrl: pages.imageUrl,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(pages, eq(collaborators.pageId, pages.id))
    .where(eq(users.id, userId));

  return collaboratingPages;
}

/** Get only shared pages */
export async function getSharedPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) return [];

  const sharedPages = await db
    .selectDistinct({
      id: pages.id,
      createdAt: pages.createdAt,
      owner: pages.owner,
      title: pages.title,
      description: pages.description,
      emoji: pages.emoji,
      isDeleted: pages.isDeleted,
      imageUrl: pages.imageUrl,
    })
    .from(pages)
    .orderBy(pages.createdAt)
    .innerJoin(collaborators, eq(pages.id, collaborators.pageId))
    .where(eq(pages.owner, userId));

  return sharedPages;
}

/** Delete page by page ID */
export async function deletePage(pageId: string) {
  if (!pageId) return { error: "Page ID not provided" };

  await db.delete(pages).where(eq(pages.id, pageId));

  return { data: null, error: null };
}

/** Update page */
export async function updatePage(page: Partial<Page>, pageId: string) {
  if (!pageId) return { data: null, error: "Page ID not provided" };

  try {
    const data = await db.update(pages).set(page).where(eq(pages.id, pageId));

    return { data, error: null };
  } catch (error) {
    console.log("Error updating page: ", error);
    return { data: null, error: `Error: ${error}` };
  }
}
