"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useParams, useRouter } from "next/navigation";
import Action from "./_components/action";
import Cover from "./_components/cover";
import Title from "./_components/title";
import Editor from "./_components/editor/editor";
import Deleted from "./_components/deleted";
import Published from "./_components/published";
import { useEffect, useState, useCallback } from "react";
import Reader from "./_components/reader";
import RichEditor from "./_components/editor/rich-editor";
import { getPageDetails } from "@/lib/queries/pages";
import { toast } from "sonner";
import Loading from "../loading";

export default function DocDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.docID as string;

  const { getDocAsync, loadingDoc } = useDocStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPageDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await getPageDetails(id);
      if (res?.error) {
        toast.error("No such page available");
        router.push("/dashboard");
        return;
      }
      await getDocAsync(id);
    } catch (error) {
      console.error("Error fetching page details:", error);
      toast.error("Unexpected error occurred");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, router, getDocAsync]);

  useEffect(() => {
    fetchPageDetails();
  }, [fetchPageDetails]);

  if (loading || loadingDoc) return <Loading />;
  return (
    <ScrollArea className="h-[calc(100vh-48px)]">
      <Published />
      <Deleted />
      <Cover />
      <Action />
      <Title />
      <RichEditor />
      <div
        className="mx-auto min-h-32 mt-6 max-w-3xl bg-muted dark:bg-muted/20 px-4 md:px-0 cursor-text"
        onDoubleClick={() => setIsEditing(true)}>
        {!isEditing ? <Reader /> : <Editor />}
      </div>
    </ScrollArea>
  );
}
