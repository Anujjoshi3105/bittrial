import { client } from "@/lib/supabase/utils/client";
import { toastError, toastLoading, toastSuccess } from "@/lib/helper/toast";
import { toast } from "sonner";
import { create } from "zustand";

export type Item = {
  error: string | null;
  path: string | null;
  signedUrl: string;
};

type GalleryState = {
  loadPictures: boolean;
  loadGradients: boolean;
  pictures: Item[] | null;
  gradients: Item[] | null;
};

type GalleryAction = {
  getPicturesAsync(idUser: string): Promise<void>;
  getGradientsAsync(): Promise<void>;
  uploadImageAsync(opt: { idUser: string; file: File }): Promise<void>;
  deleteImageAsync(opt: { path: string | null }): Promise<void>;
};

const defaultState = {
  loadPictures: false,
  loadGradients: false,
  pictures: null,
  gradients: null,
};

export const useGalleryStore = create<GalleryState & GalleryAction>()(
  (set, get) => ({
    ...defaultState,
    async getGradientsAsync() {
      set({ loadGradients: true });
      try {
        const { data, error } = await client.storage
          .from("covers")
          .list("app_preset", { limit: 10 });

        if (error) throw new Error(error.message);

        const paths = data.map((d) => "app_preset/" + d.name);

        if (paths.length === 0) set({ gradients: [], loadGradients: false });
        else {
          const { data, error } = await client.storage
            .from("covers")
            .createSignedUrls(paths, 3600);

          if (error) throw new Error(error.message);
          set({ gradients: data, loadGradients: false });
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getPicturesAsync(idUser) {
      set({ loadPictures: true });
      try {
        const { data, error } = await client.storage
          .from("covers")
          .list(idUser);
        if (error) throw new Error(error.message);

        const paths = data.map((d) => idUser + "/" + d.name);

        if (!paths.length) set({ pictures: [], loadPictures: false });
        else {
          const { data, error } = await client.storage
            .from("covers")
            .createSignedUrls(paths, 60);

          if (error) throw new Error(error.message);
          set({ pictures: data, loadPictures: false });
        }
      } catch (error) {
        console.log(error);
      }
    },
    async uploadImageAsync({ file, idUser }) {
      try {
        const ext = file.type.split("/")[1];

        const { error } = await client.storage
          .from("covers")
          .upload(`/${idUser}/${Date.now()}.${ext}`, file);

        if (error) throw new Error(error.message);
        toastSuccess({ description: "Successfully add image to gallery." });
      } catch (error) {
        console.log(error);
        toastError({ description: "Failed to upload image!" });
      }
    },
    async deleteImageAsync({ path }) {
      if (!path) return;
      const id = toast(path);
      toastLoading({ description: "Deleting delete image from gallery.", id });

      try {
        const { error } = await client.storage.from("covers").remove([path]);
        if (error) throw new Error(error.message);

        let pictures = get().pictures ?? [];
        pictures = pictures.filter((item) => item.path && item.path !== path);

        set({ pictures });
        toastSuccess({
          description: "Successfully delete image from gallery.",
          id,
        });
      } catch (error) {
        console.log(error);
        toastError({ description: "Failed to delete image from gallery!", id });
      }
    },
  })
);
