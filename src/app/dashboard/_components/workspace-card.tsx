"use client";

import { EditIcon, Trash2Icon, FolderIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EditWorkspaceDialog from "./dialog/edit-workspace-dialog";
import DeleteWorkspaceDialog from "./dialog/delete-workspace-dialog";
import { timeAgo } from "@/lib/utils";
import { User, type Workspace } from "@/types/supabase.types";
import AvatarComponent from "@/components/avatar-component";
import { getImage } from "@/lib/queries/storage";
import { getCollaborators } from "@/lib/queries/collaborator";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/queries/auth";
import LeaveWorkspaceDialog from "./dialog/leave-workspace-dialog";
import { ExitIcon } from "@radix-ui/react-icons";

export function WorkspaceCard({
  workspace,
  isOwner,
}: {
  workspace: Workspace;
  isOwner: boolean;
}) {
  const {
    id,
    title = "Untitled Workspace",
    description = "No description provided",
    imageUrl,
    createdAt,
  } = workspace;
  const [collaborators, setCollaborators] = useState<User[] | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const imageSrc = imageUrl ? getImage(imageUrl) : null;
  const formattedDate = createdAt
    ? timeAgo(createdAt as unknown as Date, { withAgo: true })
    : null;

  useEffect(() => {
    async function fetchCollaborators() {
      const collaborators = await getCollaborators(id);
      const owner = await getUser(workspace.workspaceOwner);
      setCollaborators(collaborators);
      if (owner) setOwner(owner);
    }
    fetchCollaborators();
  }, [id, workspace]);

  return (
    <Card className="group relative h-full w-full max-w-sm mx-auto overflow-hidden rounded-xl p-0">
      <Link href={`/dashboard/${id}`} className="block h-full">
        {/* Workspace Image or Placeholder */}
        <div className="relative h-40 w-full overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={title!}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <FolderIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardHeader className="space-y-3 p-4">
          <div>
            <CardTitle className="capitalize text-lg font-bold line-clamp-1 mb-1">
              {title}
            </CardTitle>
            <CardDescription className="capitalize line-clamp-2 text-muted-foreground">
              {description}
            </CardDescription>
          </div>

          {/* Collaborators Section */}
          <div className="flex items-center gap-2 text-sm">
            {collaborators && collaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {collaborators.length} Collaborator
                  {collaborators.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardFooter className="flex items-center justify-between px-4 pb-4 text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          {owner && (
            <AvatarComponent
              src={owner.imageUrl}
              alt={owner.username}
              className="h-6 w-6"
            />
          )}
        </CardFooter>
      </Link>

      {/* Action Buttons */}
      {isOwner ? (
        <div className="absolute right-4 top-4 z-10 flex gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-sm group-hover:opacity-100 opacity-0">
          <EditWorkspaceDialog workspace={workspace}>
            <Button
              size="smIcon"
              variant="ghost"
              className="hover:bg-primary/10">
              <EditIcon className="h-4 w-4" />
              <span className="sr-only">Edit workspace</span>
            </Button>
          </EditWorkspaceDialog>
          <DeleteWorkspaceDialog workspace={workspace}>
            <Button
              size="smIcon"
              variant="ghost"
              className="hover:bg-destructive/10 hover:text-destructive">
              <Trash2Icon className="h-4 w-4" />
              <span className="sr-only">Delete workspace</span>
            </Button>
          </DeleteWorkspaceDialog>
        </div>
      ) : (
        <div className="absolute right-4 top-4 z-10 flex gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-sm group-hover:opacity-100 opacity-0">
          <LeaveWorkspaceDialog workspace={workspace}>
            <Button
              size="smIcon"
              variant="ghost"
              className="hover:bg-primary/10">
              <ExitIcon className="h-4 w-4" />
              <span className="sr-only">Leave workspace</span>
            </Button>
          </LeaveWorkspaceDialog>
        </div>
      )}
    </Card>
  );
}
