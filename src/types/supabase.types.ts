import { users } from "@/lib/supabase/migrations/schema";
import { pages } from "@/lib/supabase/schema";
import { InferSelectModel } from "drizzle-orm";

export type Page = InferSelectModel<typeof pages>;
export type User = InferSelectModel<typeof users>;
