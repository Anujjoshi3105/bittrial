import { users, workspaces } from "@/lib/supabase/migrations/schema";
import { InferSelectModel } from "drizzle-orm";

export type Workspace = InferSelectModel<typeof workspaces>;
export type User = InferSelectModel<typeof users>;
