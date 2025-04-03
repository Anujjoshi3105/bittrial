"use client";

import type React from "react";
import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteWorkspace } from "@/lib/queries/workspace";
import { toast } from "sonner";
import { Workspace } from "@/types/supabase.types";
import { useUserStore } from "@/lib/store/use-user-store";

export default function DeleteWorkspaceDialog({
  children,
  workspace,
}: {
  children: React.ReactNode;
  workspace?: Workspace;
}) {
  const { currentUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  if (!workspace) return;
  const handleDeleteWorkspace = async () => {
    try {
      setIsLoading(true);
      if (workspace.workspaceOwner !== currentUser?.id) {
        toast.error("Unauthorised Action", {
          description: "You are not allowed to delete shared workspace",
        });
      } else {
        await deleteWorkspace(workspace.id);
        toast.success("Workspace deleted successfully!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
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
            <AlertTriangleIcon className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Delete Workspace</DialogTitle>
          <DialogDescription className="text-center">
            This action cannot be undone. This will permanently delete your
            workspace and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Enter
              <span className="font-semibold text-destructive">
                {workspace.title?.toLowerCase().trim()}
              </span>
              to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="delete my account"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteWorkspace}
            isLoading={isLoading}
            disabled={
              confirmation !== workspace.title?.toLowerCase().trim() ||
              isLoading
            }
            className="sm:w-auto w-full">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
