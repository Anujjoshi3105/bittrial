"use client";

import type React from "react";
import { useState } from "react";
import { LogOutIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Workspace } from "@/types/supabase.types";
import { useUserStore } from "@/lib/store/use-user-store";
import { removeCollaborator } from "@/lib/queries/collaborator";
import { getUser } from "@/lib/queries/auth";

export default function LeaveWorkspaceDialog({
  children,
  workspace,
}: {
  children: React.ReactNode;
  workspace?: Workspace;
}) {
  const { currentUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!workspace) return null;

  const handleLeaveWorkspace = async () => {
    try {
      setIsLoading(true);
      if (currentUser) {
        const profile = await getUser(currentUser?.id);

        if (profile) {
          await removeCollaborator([profile], workspace.id);
          toast.success("Workspace left successfully!");
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to leave workspace:", error);
      toast.error("Failed to leave workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
            <LogOutIcon className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Leave Workspace</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to leave {workspace.title}? You will lose
            access to all resources in this workspace.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeaveWorkspace}
            disabled={isLoading}
            className="sm:w-auto w-full">
            {isLoading ? "Leaving..." : "Leave Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
