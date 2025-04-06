"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useParams } from "next/navigation";
import Action from "./_components/action";
import Cover from "./_components/cover";
import Title from "./_components/title";
import Editor from "./_components/editor/editor";
import Deleted from "./_components/deleted";
import Published from "./_components/published";
import { useEffect } from "react";

export default function DocDetailPage() {
  const params = useParams();
  const { getDocAsync } = useDocStore();

  useEffect(() => {
    getDocAsync(params.docID as string);
  }, [params, getDocAsync]);

  return (
    <ScrollArea className="h-[calc(100vh-48px)]">
      <Published />
      <Deleted />
      <Cover />
      <Action />
      <Title />
      <div className="mx-auto min-h-32 mt-6 max-w-3xl bg-muted dark:bg-muted/20 px-4 md:px-0 cursor-text">
        <Editor />
      </div>
    </ScrollArea>
  );
}
