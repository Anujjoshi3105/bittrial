"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";
import { type EmitActionStatus } from "@/types";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useRef } from "react";

type Props = PropsWithChildren & {
  id: string;
  emitActionStatus?: EmitActionStatus;
};

export default function MoveToTrashDialog({
  children,
  id,
  emitActionStatus,
}: Props) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { deleteDocAsync } = useSidebarStore();
  const { doc } = useDocStore();

  const deleteDocHandler = async () => {
    closeButtonRef.current?.click();
    emitActionStatus?.("success");

    deleteDocAsync(id);
    if (doc && doc.id === id) router.push("/dashboard");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle />
      <DialogContent className="w-[90%] gap-0 rounded-xl p-0 md:max-w-sm">
        <DialogHeader className="p-4">
          <DialogDescription className="leading-1 text-left text-primary">
            Are you sure, do you want to move this page to trash?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full flex-row gap-0 border-t">
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="flex-1 rounded-none rounded-bl-xl text-destructive hover:text-destructive"
            onClick={deleteDocHandler}>
            Yes
          </Button>
          <div className="!m-0 box-border h-full w-[1px] border-r p-0" />
          <DialogClose asChild className="!m-0">
            <Button
              type="button"
              size="lg"
              className="flex-1 rounded-none rounded-br-xl"
              variant="ghost"
              ref={closeButtonRef}>
              No
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
