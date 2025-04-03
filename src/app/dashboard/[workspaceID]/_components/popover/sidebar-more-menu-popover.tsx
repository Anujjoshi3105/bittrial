import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AppWindowIcon,
  CopyIcon,
  FormInputIcon,
  LockIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import React, { PropsWithChildren, useRef } from "react";
import MoveToTrashDialog from "@/components/dialog/move-trash-dialog";
import NewDocDialog from "../dialog/new-doc-dialog";
import RenameDialog from "../dialog/rename-dialog";
import { type EmitActionStatus } from "@/types";
import { useCopyToClipboard } from "usehooks-ts";
import { timeAgo } from "@/lib/utils";
import { Page } from "@/lib/helper/data.helper";

export default function SidebarMoreMenuPopover({
  children,
  item,
}: PropsWithChildren & {
  item: Page;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copy] = useCopyToClipboard();
  const ref = useRef<HTMLButtonElement | null>(null);

  const emitActionStatusHandler: EmitActionStatus = (v) => {
    if (v === "success") ref.current?.click();
  };

  const createdAt = item.created_at
    ? timeAgo(item.created_at as unknown as Date, { withAgo: true })
    : null;

  const updatedAt = item.updated_at
    ? timeAgo(item.updated_at as unknown as Date, { withAgo: true })
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="max-w-[200px] overflow-hidden p-0 pt-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            return;
          }}>
          <section className="border-b px-1 pb-1 ">
            <NewDocDialog
              id={item.id}
              emitActionStatus={emitActionStatusHandler}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-full items-center justify-start px-2 text-xs font-normal">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Add new page
              </Button>
            </NewDocDialog>

            {/* <Button
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
            >
              <StarIcon className="mr-2 h-4 w-4" />
              Add to favorite
            </Button> */}

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => {
                ref.current?.click();
                copy(
                  `${window.origin}/dashboard/${item.workspace_id}/${item.id}`
                );
              }}>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy link
            </Button>

            <MoveToTrashDialog
              id={item.id}
              emitActionStatus={emitActionStatusHandler}>
              <Button
                variant="ghost"
                className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
                disabled={!!item.is_published}>
                <Trash2Icon className="mr-2 h-4 w-4" />
                Move to trash
              </Button>
            </MoveToTrashDialog>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
              onClick={() => {
                ref.current?.click();
                window.open(
                  new URL(
                    `/dashboard/${item.workspace_id}/${item.id}`,
                    window.origin
                  )
                );
              }}>
              <AppWindowIcon className="mr-2 h-4 w-4" />
              Open in new tab
            </Button>

            {!item.is_published && (
              <RenameDialog
                id={item.id}
                emitActionStatus={emitActionStatusHandler}>
                <Button
                  variant="ghost"
                  className="h-8 w-full items-center justify-start px-2 text-xs font-normal">
                  <FormInputIcon className="mr-2 h-4 w-4" />
                  Rename
                </Button>
              </RenameDialog>
            )}

            {item.is_published && (
              <Button
                variant="ghost"
                className="h-8 w-full items-center justify-start px-2 text-xs font-normal"
                disabled>
                <FormInputIcon className="mr-2 h-4 w-4" />
                Rename
              </Button>
            )}
          </section>

          {item.is_published && (
            <section className="border-b p-3">
              <p className="flex items-center justify-between gap-x-2 text-xs text-sky-800 dark:text-sky-600">
                Page is published
                <LockIcon size={14} />
              </p>
            </section>
          )}

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
