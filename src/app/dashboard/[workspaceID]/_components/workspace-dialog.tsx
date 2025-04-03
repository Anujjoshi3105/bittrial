"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Workspace } from "@/types/supabase.types";
import {
  ChevronsUpDown,
  Search,
  Settings,
  Users,
  Lock,
  Share2,
  LoaderIcon,
  FileIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SidebarButton from "./sidebar-button";
import { getImage } from "@/lib/queries/storage";
import AvatarComponent from "@/components/avatar-component";
import { useParams, useRouter } from "next/navigation";
import EditWorkspaceDialog from "../../_components/dialog/edit-workspace-dialog";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";
import {
  getWorkspaceDetails,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getCollaboratingWorkspaces,
} from "@/lib/queries/workspace";

interface WorkspaceDialogProps {
  defaultValue?: Workspace;
}

const WorkspaceDialog: React.FC<WorkspaceDialogProps> = ({ defaultValue }) => {
  const params = useParams();
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { delayedCallback } = useDebounceCallback(300);

  const [selectedOption, setSelectedOption] = useState<Workspace | undefined>(
    defaultValue
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceBanner, setWorkspaceBanner] = useState<string | null>(null);
  const [privateWorkspaces, setPrivateWorkspaces] = useState<Workspace[]>([]);
  const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
  const [collaboratingWorkspaces, setCollaboratingWorkspaces] = useState<
    Workspace[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadWorkspaceDetails = async () => {
      if (params?.workspaceID && typeof params.workspaceID === "string") {
        try {
          const { data } = await getWorkspaceDetails(params.workspaceID);
          setSelectedOption(data);

          if (data?.imageUrl) {
            const bannerUrl = getImage(data.imageUrl);
            setWorkspaceBanner(bannerUrl);
          }
        } catch (error) {
          console.error("Failed to load workspace details:", error);
        }
      }
    };

    loadWorkspaceDetails();
  }, [params?.workspaceID]);

  const loadAllWorkspaces = async () => {
    setIsLoading(true);
    try {
      const [
        privateWorkspacesData,
        sharedWorkspacesData,
        collaboratingWorkspacesData,
      ] = await Promise.all([
        getPrivateWorkspaces(),
        getSharedWorkspaces(),
        getCollaboratingWorkspaces(),
      ]);

      setPrivateWorkspaces(privateWorkspacesData || []);
      setSharedWorkspaces(sharedWorkspacesData || []);
      setCollaboratingWorkspaces(collaboratingWorkspacesData || []);
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    delayedCallback(() => {
      setSearchQuery(value);
    });
  };

  const onSelectWorkspace = (workspace: Workspace) => {
    setSelectedOption(workspace);
    closeButtonRef.current?.click();
    router.push(`/dashboard/${workspace.id}`);
  };

  const filterWorkspaces = (workspaces: Workspace[]) => {
    if (!searchQuery) return workspaces;
    return workspaces.filter((workspace) =>
      workspace?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderWorkspaceCategory = (
    label: string,
    icon: React.ReactNode,
    workspaces: Workspace[]
  ) => {
    const filteredWorkspaces = filterWorkspaces(workspaces);

    if (filteredWorkspaces.length === 0 && searchQuery) {
      return null;
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-3 text-sm font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        {filteredWorkspaces.length > 0 ? (
          filteredWorkspaces.map((workspace) => {
            const bannerUrl = workspace.imageUrl
              ? getImage(workspace.imageUrl)
              : null;

            return (
              <div
                key={workspace.id}
                role="button"
                onClick={() => onSelectWorkspace(workspace)}
                className="group flex items-center justify-between px-3 py-1 transition hover:bg-secondary rounded-md mx-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AvatarComponent
                    src={bannerUrl}
                    alt={workspace.title || ""}
                    className="size-6"
                  />
                  <span className="truncate text-sm">{workspace.title}</span>
                </div>
                <EditWorkspaceDialog workspace={workspace}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}>
                    <Settings size={16} />
                  </Button>
                </EditWorkspaceDialog>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-center py-2 text-muted-foreground">
            No workspaces
          </p>
        )}
      </div>
    );
  };

  const hasWorkspaces = () => {
    return (
      privateWorkspaces.length > 0 ||
      sharedWorkspaces.length > 0 ||
      collaboratingWorkspaces.length > 0
    );
  };

  const hasSearchResults = () => {
    return (
      filterWorkspaces(privateWorkspaces).length > 0 ||
      filterWorkspaces(sharedWorkspaces).length > 0 ||
      filterWorkspaces(collaboratingWorkspaces).length > 0
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          loadAllWorkspaces();
          setSearchQuery("");
        }
      }}>
      <DialogTrigger asChild>
        <SidebarButton className="h-10 justify-between">
          {selectedOption ? (
            <div className="flex items-center truncate">
              <AvatarComponent
                src={workspaceBanner}
                alt={selectedOption.title || ""}
                className="size-8 mr-2"
              />
              <span className="truncate">{selectedOption.title}</span>
            </div>
          ) : (
            <span>Select Workspace</span>
          )}
          <ChevronsUpDown className="size-4" />
        </SidebarButton>
      </DialogTrigger>
      <DialogContent className="top-[5%] flex w-[90%] translate-y-0 flex-col gap-0 rounded-xl p-0 md:max-w-md">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-base flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Search Workspace
          </DialogTitle>
        </DialogHeader>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-9 pr-4 py-2 rounded-xl h-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoaderIcon className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : hasWorkspaces() ? (
          searchQuery && !hasSearchResults() ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for{" "}
                <span className="font-medium italic">{searchQuery}</span>
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="py-2">
                {searchQuery && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">
                    Showing search results for{" "}
                    <i className="font-medium">{searchQuery}</i>
                  </p>
                )}

                {renderWorkspaceCategory(
                  "Private",
                  <Lock size={16} />,
                  privateWorkspaces
                )}

                <Separator className="my-2" />

                {renderWorkspaceCategory(
                  "Shared",
                  <Share2 size={16} />,
                  sharedWorkspaces
                )}

                <Separator className="my-2" />
                {renderWorkspaceCategory(
                  "Collaborating",
                  <Users size={16} />,
                  collaboratingWorkspaces
                )}
              </div>
            </ScrollArea>
          )
        ) : (
          <div className="py-12 text-center">
            <FileIcon className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No workspaces found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a workspace to get started
            </p>
          </div>
        )}

        <DialogClose asChild>
          <Button className="hidden" ref={closeButtonRef}>
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceDialog;
