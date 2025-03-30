"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderIcon, PlusCircleIcon, SmilePlusIcon } from "lucide-react";
import { type PropsWithChildren } from "react";
import useNewDoc from "../../_hooks/use-new-doc";
import EmojiPickerPopover from "@/components/popover/emoji-picker-popover";
import { type EmitActionStatus } from "@/types";
import { Textarea } from "@/components/ui/textarea";

type Props = PropsWithChildren & {
  id?: string;
  emitActionStatus?: EmitActionStatus;
};

export default function NewDocDialog({
  children,
  id,
  emitActionStatus,
}: Props) {
  const {
    closeButtonRef,
    form,
    isDisableSubmit,
    isLoadingSubmit,
    submitHandler,
    openDialogHandler,
  } = useNewDoc({ id, emitActionStatus });

  return (
    <Dialog onOpenChange={openDialogHandler}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle />

      <DialogContent className="top-[5%] flex w-[90%] translate-y-[0] flex-col gap-0 rounded-lg bg-background p-0 md:!max-w-xl">
        <NewDocDialog.Title />

        <Form {...form}>
          <form className="space-y-2 px-3 pb-3" onSubmit={submitHandler}>
            <div className="flex w-full gap-x-2">
              <EmojiPickerPopover
                onEmojiSelect={(emoji) => form.setValue("emoji", emoji)}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-11 shrink-0 rounded-lg p-0">
                  {form.getValues("emoji.native") ? (
                    <span className="text-xl">
                      {form.getValues("emoji.native")}
                    </span>
                  ) : (
                    <SmilePlusIcon className="w-5" />
                  )}
                </Button>
              </EmojiPickerPopover>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter page title..."
                        className="rounded-lg"
                        autoFocus
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="m-0 p-3 pt-0" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      placeholder="Enter page description..."
                      className="rounded-lg"
                      autoFocus
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="m-0 px-3 pb-3 pt-0" />
                </FormItem>
              )}
            />

            <Button
              size="lg"
              className="w-20 rounded-lg "
              type="submit"
              disabled={isDisableSubmit}>
              {isLoadingSubmit ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>

        <DialogClose asChild>
          <Button className="hidden" ref={closeButtonRef}>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

NewDocDialog.Title = function Title() {
  return (
    <div className="mb-4 flex items-center justify-start border-b-[1px] p-3">
      <PlusCircleIcon className="mr-2 size-4" />
      <h4 className="text-base font-medium leading-none">New page</h4>
    </div>
  );
};
