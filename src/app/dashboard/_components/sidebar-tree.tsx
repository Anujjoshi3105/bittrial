"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useEffectOnce } from "usehooks-ts";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";
import { getSidebarTreeData, Page } from "@/lib/helper/data.helper";
import EmojiPickerPopover, {
  Emoji,
} from "@/components/popover/emoji-picker-popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SidebarButton from "./sidebar-button";
import NewDocDialog from "./dialog/new-doc-dialog";
import SidebarMoreMenuPopover from "./popover/sidebar-more-menu-popover";
import Link from "next/link";

interface SidebarTreeProps {
  favorite?: boolean;
  message?: string;
}

export default function SidebarTree({
  favorite = false,
  message = "Create one to get started",
}: SidebarTreeProps) {
  return (
    <div>
      <SidebarTree.Title favorite={favorite} />
      <SidebarTree.Root message={message} favorite={favorite} />
    </div>
  );
}

SidebarTree.Root = function Root({
  id,
  level = 0,
  message,
  favorite,
}: {
  id?: string;
  level?: number;
  message?: string;
  favorite?: boolean;
}) {
  const {
    loading,
    sidebarTree,
    getSidebarTreeAsync,
    renameDocAsync,
    sidebarTreeCollapsed: collapsedMap,
    sidebarTreeCollapseHandler,
  } = useSidebarStore();

  // Fetch sidebar tree data on first render
  useEffectOnce(() => {
    getSidebarTreeAsync(id);
  });

  // Process and filter data
  const allItems = useMemo(
    () => getSidebarTreeData(sidebarTree, id),
    [sidebarTree, id]
  );

  const items = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      favorite ? allItems.filter(([_, item]) => item.is_favorite) : allItems,
    [allItems, favorite]
  );

  // Handle loading and empty states
  if (loading["root"] && !sidebarTree && !id) {
    return <SidebarTree.Skeleton level={level} />;
  }

  if (loading[id!] && !items.length) {
    return <SidebarTree.Skeleton level={level} />;
  }

  if (!items.length) {
    return <SidebarTree.Empty level={level} message={message} />;
  }

  return (
    <>
      {items.map(([key, item]) => (
        <section key={key} onClick={(e) => e.stopPropagation()}>
          <div
            className="group justify-between pr-1"
            style={{
              paddingLeft: level === 0 ? "4px" : `${level * 20}px`,
            }}>
            <div className="flex items-center justify-start truncate">
              <Button
                size="smIcon"
                variant="ghost"
                className="text-muted-foreground hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  sidebarTreeCollapseHandler({
                    id: item.id,
                    parent_id: item.parent_id,
                  });
                }}>
                {collapsedMap.has(item.id) ? (
                  <ChevronDownIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </Button>
              <SidebarTree.Leaf item={item} renameDocAsync={renameDocAsync} />
            </div>
          </div>

          {collapsedMap.has(item.id) && (
            <SidebarTree.Root id={item.id} level={level + 1} />
          )}
        </section>
      ))}
    </>
  );
};

SidebarTree.Leaf = function Leaf({
  item,
  renameDocAsync,
}: {
  item: Page;
  renameDocAsync: (opt: {
    id: string;
    title: string;
    description: string;
    emoji: Emoji | null;
  }) => Promise<void>;
}) {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when item title changes
  useEffect(() => {
    if (!isEditing && item.title !== editedTitle) {
      setEditedTitle(item.title);
    }
  }, [item.title, isEditing, editedTitle]);

  // Memoize event handlers
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    if (isSubmitting) return;

    if (editedTitle !== item.title) {
      setIsSubmitting(true);

      try {
        await renameDocAsync({
          id: item.id,
          title: editedTitle || "",
          description: item.description || "",
          emoji: item.emoji as Emoji,
        });
      } catch (error) {
        setEditedTitle(item.title);
        console.error("Failed to rename document:", error);
      } finally {
        setIsSubmitting(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(item.title);
    }
  };

  return (
    <SidebarButton asChild className="pl-1 group">
      <Link href={`/dashboard/${item.id}`}>
        <div className="flex items-center justify-start truncate">
          <EmojiPickerPopover
            onEmojiSelect={(emoji) =>
              renameDocAsync({
                id: item.id,
                title: item.title || "",
                description: item.description || "",
                emoji,
              })
            }
            onClickRemove={() =>
              renameDocAsync({
                id: item.id,
                title: item.title || "",
                description: item.description || "",
                emoji: null,
              })
            }>
            {(item.emoji as Emoji)?.native ? (
              <span
                role="img"
                aria-label={(item.emoji as Emoji)?.name}
                className="mr-2 block w-4 cursor-pointer text-sm antialiased">
                {(item.emoji as Emoji)?.native}
              </span>
            ) : (
              <FileIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </EmojiPickerPopover>

          {isEditing ? (
            <input
              type="text"
              value={editedTitle || ""}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full border-b border-dashed bg-transparent px-1 text-sm outline-none"
              onClick={(e) => e.stopPropagation()}
              disabled={isSubmitting}
            />
          ) : (
            <span
              onDoubleClick={handleTitleDoubleClick}
              className={cn(
                "truncate text-sm text-primary/70 antialiased",
                params?.docID === item.id && "font-medium text-primary"
              )}>
              {editedTitle}
            </span>
          )}
        </div>
        <SidebarMoreMenuPopover item={item}>
          <Button
            size="smIcon"
            variant="ghost"
            className="ml-auto text-muted-foreground hover:bg-primary/10 opacity-0 group-hover:opacity-100">
            <MoreHorizontalIcon />
          </Button>
        </SidebarMoreMenuPopover>
      </Link>
    </SidebarButton>
  );
};

SidebarTree.Title = function Title({ favorite }: { favorite?: boolean }) {
  return (
    <div className="flex w-full items-center justify-between px-4 py-1 text-sm font-medium">
      {favorite ? "Favorite" : "Document"}
      <NewDocDialog>
        <Button
          size="smIcon"
          variant="ghost"
          className="ml-auto hover:bg-primary/5">
          <PlusCircleIcon />
        </Button>
      </NewDocDialog>
    </div>
  );
};

SidebarTree.Skeleton = function Loading({ level }: { level: number }) {
  return (
    <div className={cn(level === 0 ? "pt-3" : "pt-1")}>
      {Array(level === 0 ? 4 : 1)
        .fill(null)
        .map((_, i) => (
          <Skeleton key={i} className="mb-1 h-7 w-full bg-primary/5" />
        ))}
    </div>
  );
};

SidebarTree.Empty = function Empty({
  level,
  message,
}: {
  level: number;
  message?: string;
}) {
  return (
    <div
      className="pb-1 text-center text-xs text-muted-foreground dark:text-muted-foreground/20"
      style={{ paddingLeft: `${level * 22}px` }}>
      {message || "No page inside"}
    </div>
  );
};
