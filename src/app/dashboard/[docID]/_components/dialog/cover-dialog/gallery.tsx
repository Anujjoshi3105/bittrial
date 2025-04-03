import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocStore } from "@/lib/store/use-doc-store";
import { Item, useGalleryStore } from "@/lib/store/use-gallery-store";
import { AlertCircleIcon, CheckIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import DeleteImageDialog from "../delete-image-dialog";
import { memo } from "react";

const EmptyState = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6">
    <AlertCircleIcon className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
    <p className="text-center text-sm text-muted-foreground">{title}</p>
    <p className="mt-1 text-center text-xs text-muted-foreground/70">
      {subtitle}
    </p>
  </div>
);

const MediaSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-4 gap-2">
    {Array(count)
      .fill(null)
      .map((_, i) => (
        <Skeleton key={i} className="h-[74px] w-full bg-zinc-200" />
      ))}
  </div>
);

const MediaItem = memo(
  ({
    item,
    isSelected,
    docId,
    updateDocAsync,
    children,
  }: {
    item: Item;
    isSelected: boolean;
    docId: string;
    updateDocAsync: (docId: string, data: { image_url: string | null }) => void;
    children?: React.ReactNode;
  }) => (
    <div
      role="button"
      className="group relative h-[72px] overflow-hidden rounded-md"
      onClick={() => updateDocAsync(docId, { image_url: item.path })}>
      <div
        className={cn(
          "absolute grid h-full w-full place-content-center",
          isSelected && "bg-zinc-800/50"
        )}>
        {isSelected && <CheckIcon className="h-6 w-6 text-zinc-50" />}
      </div>

      {children}

      <Image
        src={item.signedUrl}
        className="h-full w-full cursor-pointer rounded-md object-cover object-center hover:opacity-80"
        alt=""
        height={72}
        width={154}
      />
    </div>
  )
);

MediaItem.displayName = "MediaItem";

const MediaSection = ({
  title,
  items,
  isLoading,
  docId,
  docImageUrl,
  emptyTitle,
  emptySubtitle,
  showDeleteButtons = false,
  skeletonCount = 4,
}: {
  title: string;
  items: Item[] | null;
  isLoading: boolean;
  docId: string;
  docImageUrl: string | null | undefined;
  emptyTitle: string;
  emptySubtitle: string;
  showDeleteButtons?: boolean;
  skeletonCount?: number;
}) => {
  const { updateDocAsync } = useDocStore();

  if (isLoading)
    return (
      <section>
        <p className="mb-2 text-sm leading-none">{title}</p>
        <MediaSkeleton count={skeletonCount} />
      </section>
    );

  if (!items || items.length === 0)
    return (
      <section>
        <p className="mb-2 text-sm leading-none">{title}</p>
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      </section>
    );

  return (
    <section>
      <p className="mb-2 text-sm leading-none">{title}</p>
      <div className="relative grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isSelected =
            item.path && docImageUrl && item.path === docImageUrl;

          return (
            <MediaItem
              key={item.path}
              item={item}
              isSelected={!!isSelected}
              docId={docId}
              updateDocAsync={updateDocAsync}>
              {showDeleteButtons && (
                <div className="absolute right-0 top-0 group-hover:block md:hidden">
                  <DeleteImageDialog
                    deleteImageHandler={() =>
                      updateDocAsync(docId, { image_url: null })
                    }>
                    <Button
                      variant="destructive"
                      className="h-7 w-7 rounded-none rounded-bl-2xl"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}>
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </DeleteImageDialog>
                </div>
              )}
            </MediaItem>
          );
        })}
      </div>
    </section>
  );
};

export default function Gallery() {
  const params = useParams();
  const id = params?.docID as string;
  const { doc } = useDocStore();
  const { loadGradients, gradients, loadPictures, pictures } =
    useGalleryStore();

  return (
    <div className="mt-3 flex flex-col gap-y-6">
      <MediaSection
        title="Gradients"
        items={gradients}
        isLoading={loadGradients}
        docId={id}
        docImageUrl={doc?.image_url}
        emptyTitle="No gradients available."
        emptySubtitle="Upload gradients to customize your banner."
      />

      <MediaSection
        title="Pictures"
        items={pictures}
        isLoading={loadPictures}
        docId={id}
        docImageUrl={doc?.image_url}
        emptyTitle="No pictures available."
        emptySubtitle="Upload pictures to customize your banner."
        showDeleteButtons={true}
        skeletonCount={2}
      />
    </div>
  );
}
