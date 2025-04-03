"use client";

import { useParams } from "next/navigation";
import { EditorContent, useEditor, type Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Separator } from "@/components/ui/separator";
import { ToolbarProvider } from "@/components/toolbars/toolbar-provider";
import { RedoToolbar } from "@/components/toolbars/redo";
import { BoldToolbar } from "@/components/toolbars/bold";
import { ItalicToolbar } from "@/components/toolbars/italic";
import { StrikeThroughToolbar } from "@/components/toolbars/strikethrough";
import { BulletListToolbar } from "@/components/toolbars/bullet-list";
import { OrderedListToolbar } from "@/components/toolbars/ordered-list";
import { CodeToolbar } from "@/components/toolbars/code";
import { CodeBlockToolbar } from "@/components/toolbars/code-block";
import { HorizontalRuleToolbar } from "@/components/toolbars/horizontal-rule";
import { BlockquoteToolbar } from "@/components/toolbars/blockquote";
import { HardBreakToolbar } from "@/components/toolbars/hard-break";
import { useDocStore } from "@/lib/store/use-doc-store";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";

const extensions: Extension[] = [
  StarterKit.configure({
    orderedList: { HTMLAttributes: { class: "list-decimal" } },
    bulletList: { HTMLAttributes: { class: "list-disc" } },
    code: { HTMLAttributes: { class: "bg-accent rounded-md p-1" } },
    horizontalRule: { HTMLAttributes: { class: "my-2" } },
    codeBlock: {
      HTMLAttributes: {
        class: "bg-primary text-primary-foreground p-2 text-sm rounded-md",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
      HTMLAttributes: { class: "tiptap-heading" },
    },
  }),
];

const RichEditor = () => {
  const params = useParams();
  const uuid = params?.uuid as string;

  const { updateDocAsync, doc } = useDocStore();
  const { delayedCallback } = useDebounceCallback(2000);

  // Initialize editor with content from doc if available
  const initialContent = doc?.content
    ? JSON.stringify(doc.content)
    : "Start writing here...";

  const editor = useEditor({
    extensions,
    content: initialContent,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      delayedCallback(() => {
        updateDocAsync(uuid, { content: html });
      });
    },
  });

  if (!editor) return null;

  return (
    <div className="border w-full rounded-md overflow-hidden pb-3 mx-auto min-h-32 mt-6 max-w-3xl bg-muted dark:bg-muted/20 px-4 md:px-0">
      <div className="flex items-center py-2 px-2 border-b bg-background sticky top-0 z-20">
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-2">
            <RedoToolbar />
            <Separator orientation="vertical" className="h-7" />
            <BoldToolbar />
            <ItalicToolbar />
            <StrikeThroughToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeToolbar />
            <CodeBlockToolbar />
            <HorizontalRuleToolbar />
            <BlockquoteToolbar />
            <HardBreakToolbar />
          </div>
        </ToolbarProvider>
      </div>
      <div
        onClick={() => editor.chain().focus().run()}
        className="cursor-text min-h-[18rem] bg-background">
        <EditorContent className="outline-none" editor={editor} />
      </div>
    </div>
  );
};

export default RichEditor;
