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
import { Check, Search, TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchUser } from "@/lib/queries/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";
import AvatarComponent from "@/components/avatar-component";
import { useUserStore } from "@/lib/store/use-user-store";

interface CollaboratorSearchProps {
  existingCollaborators: User[];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
  removeCollaborator: (collaborator: User) => void;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
  removeCollaborator,
}) => {
  const { currentUser } = useUserStore();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { delayedCallback } = useDebounceCallback(300);

  const filteredResults = useMemo(
    () => searchResults.filter((result) => result.id !== currentUser?.id),
    [searchResults, currentUser]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsUsersLoading(false);
      return;
    }

    setIsUsersLoading(true);

    delayedCallback(async () => {
      try {
        const response = await searchUser(query);
        setSearchResults(response);
      } catch (error) {
        console.error("Error searching for users:", error);
      } finally {
        setIsUsersLoading(false);
      }
    });
  };

  // Check if user is already a collaborator
  const isCollaboratorAdded = (userId: string) =>
    existingCollaborators.some((collaborator) => collaborator.id === userId);

  const renderSearchResults = () => {
    if (isUsersLoading) {
      return Array(3)
        .fill(null)
        .map((_, i) => <Skeleton key={i} className="w-full h-16" />);
    }

    if (searchQuery && !filteredResults.length) {
      return (
        <div className="w-full animate-in fade-in-5 text-sm text-muted-foreground p-4 text-center">
          No results found.
        </div>
      );
    }

    return filteredResults.map((user) => {
      const isAdded = isCollaboratorAdded(user.id);
      return (
        <div
          className="p-4 border animate-in fade-in-30 bg-card/30 dark:blured rounded-md flex items-center justify-between"
          key={user.id}>
          <div className="flex items-center gap-2">
            <AvatarComponent
              className="size-8"
              src={user.imageUrl}
              alt={user.fullname}
            />
            <p className="text-sm truncate max-w-[180px]">{user.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => getCollaborator(user)}
            disabled={isAdded}
            size={isAdded ? "icon" : "default"}>
            {isAdded ? <Check className="size-4" /> : "Add"}
          </Button>
        </div>
      );
    });
  };

  const CollaboratorItem = ({ collaborator }: { collaborator: User }) => (
    <div className="p-2 flex justify-between items-center animate-in fade-in-5 zoom-in-95">
      <div className="flex gap-2 items-center">
        <AvatarComponent
          className="size-8"
          src={collaborator.imageUrl}
          alt={collaborator.fullname?.charAt(0)}
        />
        <div className="text-xs gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
          <p className="capitalize text-sm">{collaborator.fullname}</p>
          {collaborator.email}
        </div>
      </div>
      <Button
        size="mdIcon"
        variant="destructive"
        onClick={() => removeCollaborator(collaborator)}>
        <TrashIcon />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Sheet>
        <SheetTrigger className="w-full">{children}</SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Search Collaborator</SheetTitle>
            <SheetDescription>
              You can also remove collaborators after adding them from settings
              tab.
            </SheetDescription>
          </SheetHeader>

          <div className="relative flex items-center gap-2 my-4">
            <Search className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              name="name"
              className="pl-8"
              placeholder="Email"
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
            />
          </div>

          <ScrollArea className="flex-1 w-full pr-4">
            <div className="flex flex-col gap-1">{renderSearchResults()}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="space-y-1">
        <Label>Collaborators {`(${existingCollaborators.length})`}</Label>
        <div className="max-h-[200px] w-full overflow-y-auto rounded-md border border-muted-foreground/20">
          {existingCollaborators.length ? (
            existingCollaborators.map((collaborator) => (
              <CollaboratorItem
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col text-sm text-muted-foreground py-6">
              No collaborators yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorSearch;
