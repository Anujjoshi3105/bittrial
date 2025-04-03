"use client";

import React, { useState, useMemo } from "react";
import { User } from "@/types/supabase.types";
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
import { Crown, PlusIcon, Search, TrashIcon } from "lucide-react";
import { useUserStore } from "@/lib/store/use-user-store";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";
import { searchUser } from "@/lib/queries/auth";
import { toast } from "sonner";

interface CollaboratorSearchProps {
  existingCollaborators: User[];
  owner?: User | null;
  getCollaborator: (collaborator: User) => void;
  removeCollaborator: (collaborator: User) => void;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  existingCollaborators,
  owner = null,
  getCollaborator,
  removeCollaborator,
}) => {
  const { currentUser } = useUserStore();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { delayedCallback } = useDebounceCallback(3000);

  // Filter out current user, owner, and existing collaborators from search results
  const filteredResults = useMemo(
    () =>
      searchResults.filter(
        (result) =>
          result.id !== currentUser?.id &&
          result.id !== owner?.id &&
          !existingCollaborators.some((c) => c.id === result.id)
      ),
    [searchResults, currentUser, owner, existingCollaborators]
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
        console.error("Collaborator Search Error", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // User item component with design from the Invite component
  const UserItem = ({
    user,
    isOwner = false,
    actionButton,
  }: {
    user: User;
    isOwner?: boolean;
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
    <div className="space-y-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full">
            <PlusIcon className="size-4 mr-2" /> Add collaborators
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Add Collaborators</SheetTitle>
            <SheetDescription>
              Search and add people who can access this workspace
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 flex-1 flex flex-col overflow-hidden mt-4">
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
                              onClick={() => getCollaborator(user)}
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
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-2">
        <Label>Collaborators ({existingCollaborators.length})</Label>
        <div className="rounded-md border overflow-hidden">
          {/* Owner display (if provided) */}
          {owner && <UserItem user={owner} isOwner={true} />}

          {/* Collaborators list */}
          {existingCollaborators.length > 0 ? (
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y">
                {existingCollaborators.map((collaborator) => (
                  <UserItem
                    key={collaborator.id}
                    user={collaborator}
                    actionButton={
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeCollaborator(collaborator)}>
                        <TrashIcon className="size-4" />
                      </Button>
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
              No collaborators yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorSearch;
