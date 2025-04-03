import React, { useEffect, useState, useMemo } from "react";
import { User } from "@/types/supabase.types";
import {
  addCollaborators,
  getCollaborators,
  removeCollaborator,
} from "@/lib/queries/collaborator";
import { getUser, searchUser } from "@/lib/queries/auth";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarComponent from "@/components/avatar-component";
import { Crown, Search, TrashIcon } from "lucide-react";
import { useUserStore } from "@/lib/store/use-user-store";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";
import { getWorkspaceDetails } from "@/lib/queries/workspace";

export default function Invite({ id }: { id: string }) {
  const { currentUser } = useUserStore();
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [owner, setOwner] = useState<User | null>(null);
  const { delayedCallback } = useDebounceCallback(300);

  // Load existing collaborators and owner on mount
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const [collabResponse, pageDetails] = await Promise.all([
          getCollaborators(id),
          getWorkspaceDetails(id),
        ]);

        if (collabResponse.length) {
          setCollaborators(collabResponse);
        }

        if (pageDetails?.error) {
          toast.error("No such page available");
          return;
        }

        if (pageDetails.data?.workspaceOwner) {
          const ownerDetails = await getUser(pageDetails.data.workspaceOwner);
          if (ownerDetails) {
            setOwner(ownerDetails);
          }
        }
      } catch (error) {
        console.error("Error loading page data:", error);
        toast.error("Failed to load page information");
      }
    };

    loadDetails();
  }, [id]);

  // Filter out current user and owner from search results
  const filteredResults = useMemo(
    () =>
      searchResults.filter(
        (user) =>
          user.id !== currentUser?.id &&
          user.id !== owner?.id &&
          !collaborators.some((c) => c.id === user.id)
      ),
    [searchResults, currentUser, owner, collaborators]
  );

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    delayedCallback(async () => {
      try {
        const results = await searchUser(query);
        setSearchResults(results);
      } catch (error) {
        toast.error("Failed to search users");
        console.log("Collaborator Search Error", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Add collaborator
  const handleAddCollaborator = async (user: User) => {
    try {
      await addCollaborators([user], id);
      setCollaborators((prev) => [...prev, user]);
      setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.fullname || user.email} added as collaborator`);
    } catch (error) {
      toast.error("Failed to add collaborator");
      console.log("Collaborator Add Error", error);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (user: User) => {
    try {
      await removeCollaborator([user], id);
      setCollaborators((prev) => prev.filter((c) => c.id !== user.id));
      toast.success(
        `${user.fullname || user.email} removed from collaborators`
      );
    } catch (error) {
      toast.error("Failed to remove collaborator");
      console.log("Collaborator Removal Error", error);
    }
  };

  // User item component to avoid repetition
  const UserItem = ({
    user,
    isOwner = false,
    actionButton,
  }: {
    user: User;
    isOwner?: boolean;
    onAction?: () => void;
    actionButton?: React.ReactNode;
  }) => (
    <div
      className={`p-3 flex items-center justify-between ${
        isOwner ? "bg-muted/50" : ""
      }`}>
      <div className="flex items-center gap-2">
        <AvatarComponent
          className="size-8"
          src={user.imageUrl}
          alt={user.fullname || ""}
        />
        <div className="overflow-hidden">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium truncate">{user.fullname}</p>
            {isOwner && <Crown className="size-3 text-amber-500" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      {isOwner ? (
        <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
          Owner
        </div>
      ) : (
        actionButton
      )}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          Invite
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Manage Collaborators</SheetTitle>
          <SheetDescription>
            Add or remove people who can access this document
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 flex-1 flex flex-col overflow-hidden ml-2">
          {/* Search input */}
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by email or name"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {/* Search results */}
            {(filteredResults.length > 0 || (searchQuery && isLoading)) && (
              <div className="mb-4">
                <Label className="text-sm mb-2">Search Results</Label>
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-1 space-y-2">
                    {isLoading ? (
                      Array(3)
                        .fill(null)
                        .map((_, i) => (
                          <Skeleton key={i} className="w-full h-16" />
                        ))
                    ) : filteredResults.length > 0 ? (
                      filteredResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-4 border animate-in fade-in bg-card/30 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AvatarComponent
                              className="size-8"
                              src={user.imageUrl}
                              alt={user.fullname || ""}
                            />
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">
                                {user.fullname}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => handleAddCollaborator(user)}
                            size="sm">
                            Add
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="w-full animate-in fade-in text-sm text-muted-foreground p-4 text-center">
                        No users found.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Current collaborators */}
            <div>
              <Label className="text-sm mb-2">
                Current Collaborators ({collaborators.length})
              </Label>
              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="h-[200px]">
                  {/* Owner */}
                  {owner && <UserItem user={owner} isOwner={true} />}
                  {/* Collaborators */}
                  {collaborators.length > 0 ? (
                    <div className="divide-y">
                      {collaborators.map((collaborator) => (
                        <UserItem
                          key={collaborator.id}
                          user={collaborator}
                          actionButton={
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleRemoveCollaborator(collaborator)
                              }>
                              <TrashIcon className="size-4" />
                            </Button>
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
                      No collaborators yet
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
