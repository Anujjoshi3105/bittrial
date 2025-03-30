import { client } from "@/lib/supabase/utils/client";
import { type Database } from "@/types/database.types";
import { toastError } from "@/lib/helper/toast";
import { EditorCollaborator } from "@/types/global.type";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { create } from "zustand";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type Status = "start" | "success" | "failed" | null;

type DocState = {
  saveStatus: Status;
  failedSaveData: Partial<
    Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">
  >;
  loadingDoc: boolean;
  doc: Page | null;
  isPublished: boolean;
  isFavorite: boolean;
  collaborators: EditorCollaborator[];
};

type DocAction = {
  setSaveStatus(status: Status): void;
  getDocAsync(
    id: string
  ): Promise<{ id: string; parent_id: string | null } | void>;
  updateDocAsync(
    id: string,
    doc: Partial<
      Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">
    >
  ): Promise<void>;
  docRealtimeHandler(opt: {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`;
    doc: Page;
    old: { id?: string };
  }): void;
  _updateDoc(doc: Page): void;
  _deleteDoc(id?: string): void;
  togglePublish: () => void;
  toggleFavorite: () => void;
  setCollaborators: (collaborators: EditorCollaborator[]) => void;
};

const initialState: DocState = {
  saveStatus: null,
  loadingDoc: true,
  doc: null,
  failedSaveData: {},
  isPublished: false,
  isFavorite: false,
  collaborators: [],
};

export const useDocStore = create<DocState & DocAction>()((set, get) => ({
  ...initialState,
  // Add new collaborator-related actions
  setCollaborators(collaborators) {
    set({ collaborators });
  },
  async togglePublish() {
    const oldDoc = get().doc;
    if (!oldDoc) return;

    try {
      const { error } = await client
        .from("pages")
        .update({
          is_published: !oldDoc.is_published,
        })
        .eq("id", oldDoc.id);

      if (error) throw new Error(error.message);
      set({
        doc: { ...oldDoc, is_published: !oldDoc.is_published },
        isPublished: !oldDoc.is_published,
      });
    } catch (error) {
      console.log("Toggle publish failed", error);
      toastError({
        title: "Lock failed",
        description:
          "Something went wrong. Please check your internet connection & try again.",
      });
    }
  },
  async toggleFavorite() {
    const oldDoc = get().doc;
    if (!oldDoc) return;

    try {
      const { error } = await client
        .from("pages")
        .update({
          is_favorite: !oldDoc.is_favorite,
        })
        .eq("id", oldDoc.id);

      if (error) throw new Error(error.message);
      set({
        doc: { ...oldDoc, is_favorite: !oldDoc.is_favorite },
        isFavorite: !oldDoc.is_favorite,
      });
    } catch (error) {
      console.log("Toggle favorite failed", error);
      toastError({
        title: "Lock failed",
        description:
          "Something went wrong. Please check your internet connection & try again.",
      });
    }
  },

  setSaveStatus(status) {
    set({ saveStatus: status });
  },
  docRealtimeHandler({ eventType, doc, old }) {
    if (eventType === "DELETE") return get()._deleteDoc(old.id);
    if (eventType === "UPDATE") return get()._updateDoc(doc);
  },
  _deleteDoc(id) {
    const oldDoc = get().doc;
    if (oldDoc && id && oldDoc.id === id) {
      // permanently delete opened page, reset doc state
      set({ ...initialState });
    }
  },
  _updateDoc(doc) {
    const oldDoc = get().doc;
    if (!oldDoc || oldDoc.id !== doc.id) return;

    // Todo: handle CDRT, https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
    console.log("saved to db =>", doc);
    set({ doc });
  },
  async getDocAsync(id) {
    set({ ...initialState });

    try {
      const { data, error } = await client
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      set({
        loadingDoc: false,
        doc: data,
        isPublished: !!data.is_published,
        isFavorite: !!data.is_favorite,
      });
      return { id: data.id, parent_id: data.parent_id };
    } catch (error) {
      console.log("Get doc failed", error);
      toastError({
        description:
          "Something went wrong. Broken link or poor internet connection.",
      });
    }
  },

  async updateDocAsync(id, doc) {
    try {
      set({
        saveStatus: "start",
        // optimistic update
        doc: {
          ...get().doc,
          ...(doc as Page),
        },
      });

      const { error } = await client
        .from("pages")
        .update({
          ...get().failedSaveData,
          ...doc,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      set({
        loadingDoc: false,
        saveStatus: "success",
        failedSaveData: {},
      });
    } catch (error) {
      console.log("Update failed", error);
      set({
        saveStatus: "failed",
        failedSaveData: { ...get().failedSaveData, ...doc },
      });
      toastError({
        title: "Save failed",
        description:
          "Something went wrong. Please check your internet connection & try again.",
      });
    }
  },
}));
