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
import { useEffect, useState } from "react";
import Reader from "./_components/reader";
import RichEditor from "./_components/editor/rich-editor";

export default function DocDetailPage() {
  const params = useParams();
  const id = params?.docID as string;
  const { getDocAsync, loadingDoc } = useDocStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getDocAsync(id);
  }, [id, getDocAsync]);

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
        {!isEditing || loadingDoc ? <Reader /> : <Editor />}
      </div>
    </ScrollArea>
  );
}
