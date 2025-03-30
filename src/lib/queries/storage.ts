import { client as supabaseClient } from "@/lib/supabase/utils/client";

export function getImage(
  path: string | null | undefined,
  folder: "covers" | "avatars" = "covers"
): string | null {
  try {
    if (!path) return null;
    const { publicUrl } = supabaseClient.storage
      .from(folder)
      .getPublicUrl(path).data;
    return publicUrl || null;
  } catch (error) {
    console.error("Get image error:", error);
    return null;
  }
}

export async function uploadImage(
  file: File,
  folder: "covers" | "avatars" = "covers"
): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error("User not authenticated to upload image");
      return "";
    }

    const ext = file.type.split("/")[1];
    const filePath = `/${user.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabaseClient.storage
      .from(folder)
      .upload(filePath, file);
    console.log(`Upload image: ${data}`);

    if (error) {
      console.log("Upload image error:", error);
      return "";
    }

    return filePath;
  } catch (error) {
    console.error("Upload image error:", error);
    return "";
  }
}
