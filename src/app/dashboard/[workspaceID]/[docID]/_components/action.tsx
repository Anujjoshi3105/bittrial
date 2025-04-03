import EmojiPickerPopover from "@/components/popover/emoji-picker-popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, SmilePlusIcon } from "lucide-react";
import React from "react";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useParams } from "next/navigation";
import CoverDialog from "./dialog/cover-dialog/dialog";

export default function Action() {
  const params = useParams();
  const id = params?.docID as string;
  const { loadingDoc, doc, updateDocAsync } = useDocStore();
  if (loadingDoc || (doc?.emoji && doc.image_url)) return null;

  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl gap-x-2 px-4 md:px-0">
      {!doc?.emoji && (
        <EmojiPickerPopover
          onEmojiSelect={(emoji) => updateDocAsync(id, { emoji })}>
          <Button
            variant="secondary"
            size="sm"
            className="h-auto p-[6px] text-xs font-normal">
            <SmilePlusIcon className="mr-2 h-4 w-4" />
            Add icon
          </Button>
        </EmojiPickerPopover>
      )}

      {!doc?.image_url && (
        <CoverDialog>
          <Button
            variant="secondary"
            size="sm"
            className={cn("h-auto p-[6px] text-xs font-normal")}>
            <ImagePlusIcon className="mr-2 h-4 w-4" />
            Add cover
          </Button>
        </CoverDialog>
      )}
    </div>
  );
}
