import { Emoji } from "@/components/popover/emoji-picker-popover";
import { client } from "@/lib/supabase/utils/client";
import { type Database } from "@/types/database.types";
import { toastError, toastLoading } from "@/lib/helper/toast";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { toast } from "sonner";
import { create } from "zustand";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type SidebarAction = {
  childExistInSidebarTree(id: string): boolean;
  sidebarTreeCollapseHandler(
    v: { id: string; parent_id: string | null },
    flag?: "new"
  ): void;
  sidebarTreeRealtimeHandler(opt: {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
    doc: Page & { is_deleted: boolean | null };
  }): void;
  _insertIntoSidebarTree(doc: Page & { is_deleted: boolean | null }): void;
  _deleteFromSidebarTree(doc: Page & { is_deleted: boolean | null }): void;
  _updateSidebarTree(doc: Page & { is_deleted: boolean | null }): void;
  getSidebarTreeAsync: (id?: string) => void;
  renameDocAsync(opt: {
    id: string;
    title: string;
    description: string;
    emoji: Emoji | null;
  }): Promise<void>;
  deleteDocAsync(id: string): Promise<{ id: string } | void>;
  createDocAsync(opt: {
    id?: string;
    title?: string;
    description?: string;
    emoji?: Emoji;
  }): Promise<{ id: string; parent_id: string | null } | void>;
};

type SidebarState = {
  loading: Record<string, boolean>;
  sidebarTree: Map<string, Page> | null;
  sidebarTreeCollapsed: Map<string, { id: string; parent_id: string | null }>;
};

const initialState: SidebarState = {
  loading: { root: true },
  sidebarTree: null,
  sidebarTreeCollapsed: new Map(),
};

export const useSidebarStore = create<SidebarState & SidebarAction>()(
  (set, get) => ({
    ...initialState,
    childExistInSidebarTree(id) {
      const oldTree = get().sidebarTree;
      return oldTree
        ? [...oldTree.values()].some(({ parent_id }) => parent_id === id)
        : false;
    },
    sidebarTreeRealtimeHandler({ eventType, doc }) {
      if (eventType === "INSERT") return get()._insertIntoSidebarTree(doc);
      if (eventType === "DELETE") return get()._deleteFromSidebarTree(doc);
      if (eventType === "UPDATE") return get()._updateSidebarTree(doc);
    },
    async getSidebarTreeAsync(id) {
      if (id && get().childExistInSidebarTree(id)) return;

      const loading = get().loading;
      set({ loading: { ...loading, [id ?? "root"]: true } });

      try {
        let query = client.from("pages").select("*");

        if (id) query = query.eq("parent_id", id);
        else query = query.is("parent_id", null);

        const { data, error } = await query
          .or("is_deleted.is.null,is_deleted.is.false")
          .order("created_at", { ascending: true });

        if (error) throw new Error(error.message);

        const oldTree = get().sidebarTree;
        const newTree = new Map(data.map((item) => [item.id, item]));
        const mergedTree = new Map(
          oldTree ? [...oldTree, ...newTree] : [...newTree]
        );

        set({
          sidebarTree: mergedTree,
          loading: { ...loading, [id ?? "root"]: false },
        });
      } catch {
        toastError({
          description:
            "Failed to load sidebar tree. Please check your internet connection & try again.",
        });
      }
    },
    _insertIntoSidebarTree(doc) {
      const oldTree = get().sidebarTree;
      const mergedTree = new Map(
        oldTree ? [...oldTree, [doc.id, { ...doc }]] : [[doc.id, { ...doc }]]
      );

      set({ sidebarTree: mergedTree });
    },
    _deleteFromSidebarTree(doc) {
      const oldTree = get().sidebarTree;
      if (!oldTree) return;

      oldTree.delete(doc.id);
      set({ sidebarTree: new Map([...oldTree]) });
    },
    _updateSidebarTree(doc) {
      const oldTree = get().sidebarTree;
      if (!oldTree) return;

      // restore from trash
      if (!oldTree.has(doc.id) && !doc.is_deleted) {
        get()._insertIntoSidebarTree(doc);
      }

      // move to trash
      if (oldTree.has(doc.id) && doc.is_deleted) {
        get()._deleteFromSidebarTree(doc);
      }

      // normal update
      if (oldTree.has(doc.id) && !doc.is_deleted) {
        const mergedTree = new Map([...oldTree, [doc.id, { ...doc }]]);
        set({ sidebarTree: mergedTree });
      }
    },
    async renameDocAsync({ id, title, description, emoji }) {
      const oldTree = get().sidebarTree;
      if (!oldTree) return;

      const item = oldTree.has(id) ? oldTree.get(id) : null;
      if (item) {
        // optimistic sidebar tree update
        oldTree.set(id, { ...item, title, description, emoji });
        set({ sidebarTree: new Map(oldTree) });
      }

      try {
        const { error } = await client
          .from("pages")
          .update({ title: title ?? null, emoji: emoji ?? null })
          .eq("id", id);

        if (error) throw new Error(error.message);
      } catch {
        if (item) {
          // restore if error
          oldTree.set(id, { ...item });
          set({ sidebarTree: new Map(oldTree) });
        }

        toastError({
          description:
            "Failed to rename selected doc. Please check your internet connection & try again.",
        });
      }
    },

    async deleteDocAsync(id) {
      console.log("Delete id: ", id);
      const oldTree = get().sidebarTree;
      if (!oldTree) return;

      const item = oldTree.has(id) ? oldTree.get(id) : null;

      if (item) {
        // optimistic update
        oldTree.delete(id);
        set({ sidebarTree: new Map(oldTree) });
      }

      try {
        const { error } = await client
          .from("pages")
          .update({ is_deleted: true, parent_id: null })
          .eq("id", id);
        console.log("Delete error: ", error);

        if (error) throw new Error(error.message);

        return { id };
      } catch (error) {
        if (item) {
          // restore if error
          oldTree.set(id, { ...item });
          set({ sidebarTree: new Map(oldTree) });
        }
        console.log("Deleting eror: ", error);
        toastError({
          description:
            "Move to trash failed. Please check your internet connection & try again.",
        });
      }
    },

    async createDocAsync({ id, title, description, emoji }) {
      const cid = id ?? "create";
      const tid = toastLoading({
        description: "Creating new page...",
        id: cid,
      });
      try {
        const { data, error } = await client
          .from("pages")
          .insert({
            parent_id: id,
            title: title ?? "untitled",
            description: description ?? "",
            emoji: emoji ?? null,
          })
          .select("id, parent_id")
          .single();

        if (error) throw new Error(error.message);

        toast.dismiss(tid);
        return { id: data.id, parent_id: data.parent_id, error: null };
      } catch (error) {
        console.log("Error to create new page: ", error);
        toastError({
          description:
            "Failed to create new page. Please check your internet connection & try again.",
          id,
        });
      }
    },
    sidebarTreeCollapseHandler({ id, parent_id }, flag) {
      const oldCollapsedList = get().sidebarTreeCollapsed;

      if (flag === "new") {
        const oldTree = get().sidebarTree;

        if (oldTree && parent_id) {
          const item = oldTree.get(parent_id);

          if (item) {
            oldCollapsedList.set(item.id, {
              id: item.id,
              parent_id: item.parent_id,
            });
            set({ sidebarTreeCollapsed: new Map([...oldCollapsedList]) });

            get().sidebarTreeCollapseHandler(
              { id: parent_id, parent_id: item.parent_id },
              "new"
            );
          }
        }
      } else {
        if (oldCollapsedList.has(id)) oldCollapsedList.delete(id);
        else oldCollapsedList.set(id, { id, parent_id });

        set({ sidebarTreeCollapsed: new Map([...oldCollapsedList]) });
      }
    },
  })
);
