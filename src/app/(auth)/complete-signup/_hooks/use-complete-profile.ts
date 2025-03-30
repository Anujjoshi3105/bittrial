import { useForm } from "react-hook-form";
import { ProfileSchema, profileSchema } from "../_schema/_index";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/lib/store/use-user-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadImage } from "@/lib/queries/storage";

export const useCompleteProfile = () => {
  const { updateProfileAsync, fullname, username, bio, avatar } =
    useUserStore();
  const router = useRouter();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    values: {
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
      else router.replace("/dashboard");
    }
  );

  return {
    errors: form.formState.errors,
    isLoadingSubmit: form.formState.isSubmitting,
    isSubmitSuccessful: form.formState.isSubmitSuccessful,
    submitHandler,
    form,
  };
};
