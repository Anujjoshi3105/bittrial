import { Database } from "@/types/database.types";

export type Page = Database["public"]["Tables"]["pages"]["Row"];

export const getSidebarTreeData = (
  list: Map<string, Page> | null,
  id: string | undefined
) => {
  return list
    ? Array.from(list ?? [])
        .filter(([, item]) => (id ? item.parent_id === id : !item.parent_id))
        .sort(([, a], [, b]) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateA - dateB;
        })
    : [];
};
