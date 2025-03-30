import { useForm } from "react-hook-form";
import { ProfileSchema, profileSchema } from "../_schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/lib/store/use-user-store";
import { useRef } from "react";
import { uploadImage } from "@/lib/queries/storage";
import { toast } from "sonner";

export const useChangeProfile = () => {
  const { updateProfileAsync, fullname, username, bio, avatar } =
    useUserStore();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: fullname ?? "",
      username: username ?? "",
      bio: bio ?? "",
      avatar: avatar ?? "",
    },
  });

  const submitHandler = form.handleSubmit(
    async ({ fullname, username, bio, avatarFile }) => {
      let avatar = null;
      if (avatarFile) {
        avatar = await uploadImage(avatarFile, "avatars");
        if (!avatar) {
          toast.error("Avatar upload failed", {
            description: "Failed to upload image. Please try again later.",
          });
        }
      }

      const res = await updateProfileAsync({
        username,
        fullname,
        bio: bio ?? null,
        image_url: avatar ?? null,
      });
      if (res?.error) form.setError("root.apiError", { message: res.error });
      else closeButtonRef.current?.click();
    }
  );

  const resetFormHandler = () => {
    form.reset();
    form.clearErrors(["fullname", "username"]);
  };

  return {
    errors: form.formState.errors,
    isLoadingSubmit: form.formState.isSubmitting,
    resetFormHandler,
    submitHandler,
    form,
    closeButtonRef,
  };
};
