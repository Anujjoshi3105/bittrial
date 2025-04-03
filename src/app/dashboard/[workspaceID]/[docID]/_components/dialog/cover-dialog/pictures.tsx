import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useGalleryStore } from "@/lib/store/use-gallery-store";
import { AlertCircleIcon, CheckIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import DeleteImageDialog from "../delete-image-dialog";

export default function Gallery() {
  const params = useParams();
  const id = params?.docID as string;

  return (
    <div className="mt-3 flex flex-col gap-y-6">
      <GradientsSection id={id} />
      <PicturesSection id={id} />
    </div>
  );
}

function GradientsSection({ id }: { id: string }) {
  const { updateDocAsync, doc } = useDocStore();
  const { loadGradients, gradients } = useGalleryStore();
  if (loadGradients) return <GradientsSkeleton />;
  if (!gradients || gradients.length === 0) return <GradientsEmpty />;

  return (
    <section>
      <p className="mb-2 text-sm leading-none">Gradients</p>
      <div className="relative grid grid-cols-4 gap-2">
        {gradients &&
          gradients.map((d) => {
            const isSelected =
              d.path && doc?.image_url && d.path === doc.image_url;

            return (
              <div
                role="button"
                key={d.path}
                className="group relative h-[72px] overflow-hidden rounded-md"
                onClick={() => updateDocAsync(id, { image_url: d.path })}>
                <div
                  className={cn(
                    "absolute grid h-full w-full place-content-center",
                    isSelected && "bg-zinc-800/50"
                  )}>
                  {isSelected && (
                    <CheckIcon className=" h-6 w-6 text-zinc-50" />
                  )}
                </div>

                <Image
                  src={d.signedUrl}
                  className="h-[102px] w-full cursor-pointer rounded-md object-cover object-center hover:opacity-80"
                  alt=""
                  height={102}
                  width={154}
                />
              </div>
            );
          })}
      </div>
    </section>
  );
}

function GradientsSkeleton() {
  return (
    <section>
      <p className="mb-2 text-sm leading-none">Gradients</p>
      <div className="grid grid-cols-4 gap-2">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i + 1} className="h-[74px] w-full bg-zinc-200 " />
          ))}
      </div>
    </section>
  );
}

function GradientsEmpty() {
  return (
    <section>
      <p className="mb-2 text-sm leading-none">Gradients</p>
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6">
        <AlertCircleIcon className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-center text-sm text-muted-foreground">
          No gradients available.
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground/70">
          Upload gradients to customize your banner.
        </p>
      </div>
    </section>
  );
}

function PicturesSection({ id }: { id: string }) {
  const { updateDocAsync, doc } = useDocStore();
  const { loadPictures, pictures } = useGalleryStore();

  if (loadPictures && !pictures) return <PicturesSkeleton />;
  if (pictures && pictures.length === 0) return <PicturesEmpty />;

  return (
    <section>
      <p className="mb-2 text-sm leading-none">Pictures</p>
      <div className="relative grid grid-cols-4 gap-2">
        {pictures &&
          pictures.map((d) => {
            const isSelected =
              d.path && doc?.image_url && d.path === doc.image_url;

            return (
              <div
                role="button"
                key={d.path}
                className="group relative h-auto overflow-hidden rounded-md"
                onClick={() => updateDocAsync(id, { image_url: d.path })}>
                <div
                  className={cn(
                    "absolute grid h-full w-full place-content-center",
                    isSelected && "bg-zinc-800/50"
                  )}>
                  {isSelected && (
                    <CheckIcon className=" h-6 w-6 text-zinc-50" />
                  )}
                </div>

                <div className="absolute right-0 top-0 group-hover:block md:hidden">
                  <DeleteImageDialog
                    deleteImageHandler={() => {
                      updateDocAsync(id, { image_url: null });
                    }}>
                    <Button
                      variant="destructive"
                      className="h-7 w-7 rounded-none rounded-bl-2xl"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </DeleteImageDialog>
                </div>

                <Image
                  src={d.signedUrl}
                  className="h-[72px] w-full cursor-pointer rounded-md object-cover object-center hover:opacity-80"
                  alt=""
                  height={72}
                  width={154}
                />
              </div>
            );
          })}
      </div>
    </section>
  );
}

function PicturesSkeleton() {
  return (
    <section>
      <p className="mb-2 text-sm leading-none">Pictures</p>
      <div className="grid grid-cols-4 gap-2">
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i + 1} className="h-[74px] w-full bg-zinc-200 " />
          ))}
      </div>
    </section>
  );
}

function PicturesEmpty() {
  return (
    <section>
      <p className="mb-2 text-sm leading-none">Pictures</p>
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6">
        <AlertCircleIcon className="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-center text-sm text-muted-foreground">
          No pictures available.
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground/70">
          Upload pictures to customize your banner.
        </p>
      </div>
    </section>
  );
}
