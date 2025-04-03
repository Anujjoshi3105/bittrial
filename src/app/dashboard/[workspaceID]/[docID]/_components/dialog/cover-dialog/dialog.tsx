import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGalleryStore } from "@/lib/store/use-gallery-store";
import { useUserStore } from "@/lib/store/use-user-store";
import { useState, type PropsWithChildren } from "react";
import Gallery from "./gallery";
import Upload from "./upload";
import { ImageGenerator } from "./image-generator";

type Props = PropsWithChildren;

export default function CoverDialog({ children }: Props) {
  const [tab, setTab] = useState<"gallery" | "upload" | "generator">("gallery");
  const { currentUser } = useUserStore();

  const { getGradientsAsync, getPicturesAsync } = useGalleryStore();
  const openChangeHandler = (open: boolean) => {
    if (open && currentUser?.id) {
      getPicturesAsync(currentUser.id);
      getGradientsAsync();
    }
  };

  return (
    <Dialog onOpenChange={openChangeHandler}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle />
      <DialogContent className="top-[5%] flex w-[90%] translate-y-[0] flex-col gap-0 rounded-xl p-0 py-3 md:!max-w-xl max-h-[90vh] overflow-x-scroll">
        <Tabs value={tab} className="w-full">
          <TabsList className="h-auto w-full justify-start gap-x-3 rounded-none border-b bg-background px-3 py-0">
            <TabsTrigger
              value="gallery"
              onClick={() => setTab("gallery")}
              className="rounded-none border-b-[2px] px-0 data-[state=active]:border-b-primary">
              Gallery
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setTab("upload")}
              value="upload"
              className="rounded-none border-b-[2px] px-0 data-[state=active]:border-b-primary">
              Upload
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setTab("generator")}
              value="generator"
              className="rounded-none border-b-[2px] px-0 data-[state=active]:border-b-primary">
              AI Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="m-0 px-3 pt-3">
            <Gallery />
          </TabsContent>

          <TabsContent value="upload" className="m-0 px-3 pt-3">
            <Upload />
          </TabsContent>

          <TabsContent value="generator" className="m-0 px-3 pt-3">
            <ImageGenerator />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
