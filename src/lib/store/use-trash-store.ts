import { getErrorMessage } from "@/lib/helper/error.helper";
import { client } from "@/lib/supabase/utils/client";
import { type Database } from "@/types/database.types";
import { toastError } from "@/lib/helper/toast";
import { create } from "zustand";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type List = Pick<
  Page,
  | "title"
  | "description"
  | "emoji"
  | "created_at"
  | "updated_at"
  | "id"
  | "is_deleted"
>;

type TrashState = {
  list: List[] | null;
  loading: boolean;

  prevKeyword: string | null;
  nextPage: number;
  size: number;
  more: boolean;
};

type TrashAction = {
  getTrashAsync(workspaceId: string, keyword?: string | null): Promise<void>;
  nextPageAsync(workspaceId: string): Promise<void>;
  deletePagePermanent(id: string): Promise<void>;
  restorePageAsync(id: string): Promise<void>;
};

const initialState: TrashState = {
  list: null,
  loading: false,
  prevKeyword: null,

  nextPage: 1,
  size: 10 as const,
  more: false,
};

export const useTrashStore = create<TrashAction & TrashState>()((set, get) => ({
  ...initialState,
  async nextPageAsync(workspaceId) {
    try {
      const size = get().size;
      const page = get().nextPage;

      const start = page * size - size;
      const end = page * size - 1;
      set({ loading: true });

      let query = client
        .from("pages")
        .select(
          "title, emoji, description, created_at, updated_at, id, is_deleted"
        )
        .eq("is_deleted", true)
        .eq("workspace_id", workspaceId);

      if (get().prevKeyword)
        query = query.ilike("title", `%${get().prevKeyword}%`);

      const { data, error } = await query
        .range(start, end)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      const prevList = get().list;

      set({
        loading: false,
        more: data.length === size,
        list: prevList ? [...prevList, ...data] : [...data],
        nextPage: page + 1,
      });
    } catch (error) {
      set({ loading: false });

      toastError({ description: getErrorMessage(error as Error) });
    }
  },
  async getTrashAsync(workspaceId, keyword) {
    const prevKeyword = get().prevKeyword;
    const isNewKeyword = keyword
      ? prevKeyword !== keyword.trim().toLowerCase()
      : true;

    if (!isNewKeyword) return;

    const page = 1;
    const size = get().size;
    const start = page * size - size;
    const end = page * size - 1;

    set({ loading: true, list: null });

    try {
      let query = client
        .from("pages")
        .select(
          "title,  description, emoji, created_at, updated_at, id, is_deleted"
        )
        .eq("is_deleted", true)
        .eq("workspace_id", workspaceId);

      if (keyword) query = query.ilike("title", `%${keyword}%`);

      const { data, error } = await query
        .range(start, end)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      set({
        loading: false,
        list: [...data],
        more: data.length === size,
        prevKeyword: keyword ? keyword.trim().toLowerCase() : null,
        nextPage: page + 1,
      });
    } catch (error) {
      set({ loading: false });
      toastError({ description: getErrorMessage(error as Error) });
    }
  },
  async deletePagePermanent(id) {
    try {
      const { error } = await client.from("pages").delete().eq("id", id);
      if (error) throw new Error(error.message);

      const list = get().list;
      set({ list: list ? list?.filter((i) => i.id !== id) : null });
    } catch (error) {
      toastError({ description: getErrorMessage(error as Error) });
    }
  },
  async restorePageAsync(id) {
    try {
      const { error } = await client
        .from("pages")
        .update({ is_deleted: null, parent_id: null })
        .eq("id", id);

      if (error) throw new Error(error.message);
    } catch (error) {
      toastError({ description: getErrorMessage(error as Error) });
    }
  },
}));
