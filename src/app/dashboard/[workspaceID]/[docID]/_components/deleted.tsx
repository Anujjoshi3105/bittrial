import { Button } from "@/components/ui/button";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useTrashStore } from "@/lib/store/use-trash-store";
import { Trash2Icon, Undo2Icon } from "lucide-react";
import React from "react";
import DeleteDialog from "../../_components/dialog/delete-dialog";

export default function Deleted() {
  const { doc } = useDocStore();
  const { restorePageAsync } = useTrashStore();

  if (!doc?.is_deleted) return null;

  return (
    <div className="flex w-full items-center justify-start gap-x-2 bg-destructive px-4 py-2 md:justify-center">
      <p className="hidden text-sm text-destructive-foreground md:block">
        This page is in the trash.
      </p>
      <div>
        <Button
          size="sm"
          className="mr-2 h-7 gap-x-2 px-2 text-xs"
          variant="secondary"
          onClick={() => restorePageAsync(doc.id)}>
          <Undo2Icon size={16} />
          Restore page
        </Button>

        <DeleteDialog id={doc.id} redirectTo="/dashboard">
          <Button
            size="sm"
            className="h-7 gap-x-2 px-2 text-xs"
            variant="secondary">
            <Trash2Icon size={16} />
            Delete permanently
          </Button>
        </DeleteDialog>
      </div>
    </div>
  );
}
