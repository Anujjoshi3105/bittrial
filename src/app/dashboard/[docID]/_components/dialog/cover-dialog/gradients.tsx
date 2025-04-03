import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useGalleryStore } from "@/lib/store/use-gallery-store";
import { AlertCircleIcon, CheckIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function Gradients() {
  const params = useParams();
  const id = params?.docID as string;
  const { updateDocAsync, doc } = useDocStore();
  const { loadGradients, gradients } = useGalleryStore();

  if (loadGradients) return <Gradients.Skeleton />;
  if (!gradients || gradients.length === 0) return <Gradients.Empty />;

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

Gradients.Skeleton = function Loading() {
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
};

Gradients.Empty = function Empty() {
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
};
