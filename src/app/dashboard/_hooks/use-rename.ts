import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { type RenameDocSchema, renameDocSchema } from "../_schema";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";
import { type Emoji } from "@/components/popover/emoji-picker-popover";
import { EmitActionStatus } from "@/types";

type Props = {
  id: string;
  title: string | null;
  description: string | null;
  emoji: Emoji | null;
  emitActionStatus?: EmitActionStatus;
};

export default function useRename({
  id,
  title,
  description,
  emoji,
  emitActionStatus,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { renameDocAsync } = useSidebarStore();
  const form = useForm<RenameDocSchema>({
    resolver: zodResolver(renameDocSchema),
    values: {
      title: title ?? "",
      description: description ?? "",
      emoji: emoji ?? null,
    },
  });

  const submitHandler = form.handleSubmit(({ title, description, emoji }) => {
    renameDocAsync({ id, title, description, emoji: emoji as Emoji });
    closeButtonRef.current?.click();
    emitActionStatus?.("success");
  });

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
