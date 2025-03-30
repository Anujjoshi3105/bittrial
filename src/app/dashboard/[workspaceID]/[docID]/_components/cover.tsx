import React, { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import EmojiPickerPopover, {
  type Emoji,
} from "@/components/popover/emoji-picker-popover";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useParams } from "next/navigation";
import CoverDialog from "./dialog/cover-dialog/dialog";
import { getImage } from "@/lib/queries/storage";

export default function Cover() {
  const params = useParams();
  const id = params?.docID as string;
  const { loadingDoc, doc, updateDocAsync } = useDocStore();
  const emoji = doc?.emoji ? (doc.emoji as Emoji) : null;
  const [cover, setCover] = React.useState<string | null>(null);
  useMemo(() => {
    const cover = getImage(doc?.image_url, "covers");
    setCover(cover);
  }, [doc?.image_url]);
  return (
    <div
      className={cn(
        "group/cover peer/cover relative mx-auto mb-4",
        emoji && !cover && "mb-32 mt-20",
        emoji && cover && "mb-12"
      )}>
      {/* Show Skeleton Loader While Loading */}
      {loadingDoc && (
        <Skeleton className="h-40 w-full rounded-none bg-primary/5" />
      )}

      {!loadingDoc && (
        <>
          {cover && (
            <div className="relative h-40 w-full dark:brightness-90 md:h-64">
              <Image
                src={cover}
                alt="Cover"
                layout="fill"
                objectFit="cover"
                priority
                className="rounded-none"
              />
            </div>
          )}

          {/* Container for Emoji & Buttons */}
          <div
            className={cn(
              "relative mx-auto h-auto w-auto max-w-3xl",
              !cover && !emoji && "hidden"
            )}>
            {/* Emoji Selection */}
            {emoji && (
              <div className="absolute bottom-[-24px] left-5 rounded-full md:bottom-[-30px] md:left-0">
                <EmojiPickerPopover
                  onEmojiSelect={(emoji) => updateDocAsync(id, { emoji })}
                  onClickRemove={() => updateDocAsync(id, { emoji: null })}>
                  <button
                    role="button"
                    className="block rounded-md py-2 text-5xl hover:bg-primary/10 md:text-6xl">
                    {emoji.native}
                  </button>
                </EmojiPickerPopover>
              </div>
            )}

            {/* Cover Actions (Change & Remove) */}
            {cover && (
              <div className="absolute bottom-4 right-4 flex gap-x-2">
                {/* Change Cover Button */}
                <CoverDialog>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-auto p-[6px] text-xs font-normal transition md:opacity-0 md:group-hover/cover:opacity-100">
                    <ImagePlusIcon className="mr-2 h-4 w-4" />
                    Change cover
                  </Button>
                </CoverDialog>

                {/* Remove Cover Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-auto p-[6px] text-xs font-normal transition md:opacity-0 md:group-hover/cover:opacity-100"
                  onClick={() => updateDocAsync(id, { image_url: null })}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
