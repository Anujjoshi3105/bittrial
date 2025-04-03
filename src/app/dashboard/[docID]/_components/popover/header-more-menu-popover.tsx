import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDocStore } from "@/lib/store/use-doc-store";
import {
  CopyIcon,
  GlobeIcon,
  RedoIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
  UndoIcon,
  UnlockIcon,
} from "lucide-react";
import { PropsWithChildren, useRef } from "react";
import MoveToTrashDialog from "@/components/dialog/move-trash-dialog";
import { useCopyToClipboard } from "usehooks-ts";
import { timeAgo } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export default function HeaderMoreMenuPopover({ children }: PropsWithChildren) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copy] = useCopyToClipboard();

  const ref = useRef<HTMLButtonElement | null>(null);
  const { doc, isPublished, togglePublish, isFavorite, toggleFavorite } =
    useDocStore();

  const createdAt = doc
    ? timeAgo(doc.created_at as unknown as Date, { withAgo: true })
    : null;

  const updatedAt = doc
    ? timeAgo(doc.updated_at as unknown as Date, { withAgo: true })
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="max-w-[200px] overflow-hidden p-0 pt-1"
        align="end">
        <div>
          <section className="border-b px-1 pb-1">
            <div className="w-full ">
              <label
                className="flex h-8 w-full cursor-pointer items-center justify-between px-2 text-xs font-normal"
                htmlFor="toggle-publish">
                <span className="flex">
                  {isPublished ? (
                    <UnlockIcon className="mr-2" size={16} />
                  ) : (
                    <GlobeIcon className="mr-2" size={16} />
                  )}
                  {isPublished ? "Private page" : "Publish page"}
                </span>

                <Switch
                  checked={isPublished}
                  id="toggle-lock"
                  onClick={() => {
                    togglePublish();
                  }}
                />
              </label>
            </div>
          </section>

          <section className="border-b px-1 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => {
                ref.current?.click();
                copy(`${window.origin}/${doc?.id}`);
              }}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="flex h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={toggleFavorite}>
              {isFavorite ? (
                <>
                  <StarOffIcon className="mr-2 h-4 w-4" />
                  Remove from favorite
                </>
              ) : (
                <>
                  <StarIcon className="mr-2 h-4 w-4" />
                  Add to favorite
                </>
              )}
            </Button>

            {doc && !doc.is_deleted && (
              <MoveToTrashDialog id={doc?.id}>
                <Button
                  variant="ghost"
                  className="h-8 w-full items-center justify-start px-2 text-xs font-normal">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Move to trash
                </Button>
              </MoveToTrashDialog>
            )}
          </section>

          <section className="border-b px-1 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal">
              <UndoIcon className="mr-2 h-4 w-4" />
              Undo
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal">
              <RedoIcon className="mr-2 h-4 w-4" />
              Redo
            </Button>
          </section>

          <section className="p-3">
            <p className="mb-2 flex flex-col text-muted-foreground">
              <span className="text-[10px]">Created {createdAt}</span>
            </p>
            <p className="flex flex-col text-muted-foreground">
              <span className="text-[10px]">Last updated {updatedAt}</span>
            </p>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  );
}
