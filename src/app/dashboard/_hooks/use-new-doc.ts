import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type NewDocSchema, newDocSchema } from "../_schema";
import { useRef } from "react";
import { type Emoji } from "@/components/popover/emoji-picker-popover";
import { type EmitActionStatus } from "@/types";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";

type Props = {
  id?: string;
  emitActionStatus?: EmitActionStatus;
};

export default function useNewDoc({ emitActionStatus, id }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { sidebarTreeCollapseHandler, createDocAsync } = useSidebarStore();
  const router = useRouter();
  const form = useForm<NewDocSchema>({
    resolver: zodResolver(newDocSchema),
    defaultValues: {
      title: "",
      description: "",
      emoji: null,
    },
  });

  const submitHandler = form.handleSubmit(
    async ({ title, description, emoji }) => {
      const res = await createDocAsync({
        title,
        id: id,
        description,
        emoji: emoji as Emoji,
      });
      if (res?.id) {
        sidebarTreeCollapseHandler(
          { id: res.id, parent_id: res.parent_id },
          "new"
        );
        emitActionStatus?.("success");

        closeButtonRef.current?.click();
        router.push(`/dashboard/${res.id}`);
      }
    }
  );

  const openDialogHandler = (open: boolean) => {
    if (open) form.reset();
  };

  const { title: formTitle } = form.watch();

  return {
    form,
    errors: form.formState.errors,
    isLoadingSubmit: form.formState.isSubmitting,
    isDisableSubmit: form.formState.isSubmitting || !formTitle,
    submitHandler,
    closeButtonRef,
    openDialogHandler,
  };
}
