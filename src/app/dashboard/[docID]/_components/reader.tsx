"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import "quill/dist/quill.snow.css";
import { useDocStore } from "@/lib/store/use-doc-store";
import { Delta } from "quill";
import { Loader2 } from "lucide-react";

export default function Reader() {
  const params = useParams();
  const id = params?.docID as string;
  const { doc, loadingDoc } = useDocStore();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!wrapperRef.current || !doc) return;

    const initQuill = async () => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }

      const editor = document.createElement("div");
      wrapperRef.current?.appendChild(editor);

      const Quill = (await import("quill")).default;

      const quillInstance = new Quill(editor, {
        theme: "snow",
        modules: { toolbar: false },
        readOnly: true,
      });

      quillInstance.setContents(doc.content as unknown as Delta);
    };

    initQuill();
  }, [id, doc]);

  // Handle SSR
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
  }, []);

  if (loadingDoc) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-12 animate-spin text-background" />
      </div>
    );
  }

  return <div ref={wrapperRef} className="relative" />;
}
