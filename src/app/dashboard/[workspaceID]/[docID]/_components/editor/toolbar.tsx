import React from "react";
import { BlockquoteToolbar } from "@/components/toolbars/blockquote";
import { BoldToolbar } from "@/components/toolbars/bold";
import { UnderlineToolbar } from "@/components/toolbars/underline";
import { BulletListToolbar } from "@/components/toolbars/bullet-list";
import { CodeToolbar } from "@/components/toolbars/code";
import { CodeBlockToolbar } from "@/components/toolbars/code-block";
import { HardBreakToolbar } from "@/components/toolbars/hard-break";
import { HorizontalRuleToolbar } from "@/components/toolbars/horizontal-rule";
import { ItalicToolbar } from "@/components/toolbars/italic";
import { OrderedListToolbar } from "@/components/toolbars/ordered-list";
import { StrikeThroughToolbar } from "@/components/toolbars/strikethrough";
import { ToolbarProvider } from "@/components/toolbars/toolbar-provider";
import { SearchAndReplaceToolbar } from "@/components/toolbars/search-and-replace-toolbar";
import { ImagePlaceholderToolbar } from "@/components/toolbars/image-placeholder-toolbar";
import { Separator } from "@/components/ui/separator";
import { EditorInstance } from "novel";

export default function EditorToolbar({
  editor,
}: {
  editor: EditorInstance | null;
}) {
  return (
    <div className="flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20 rounded-t-lg">
      {editor && (
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-2 flex-wrap">
            <BoldToolbar />
            <UnderlineToolbar />
            <ItalicToolbar />
            <StrikeThroughToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeToolbar />
            <CodeBlockToolbar />
            <HorizontalRuleToolbar />
            <BlockquoteToolbar />
            <HardBreakToolbar />

            {/* Add Search and Replace to the toolbar */}
            <Separator orientation="vertical" className="h-7" />
            <SearchAndReplaceToolbar />

            {/* Add Image Placeholder to the toolbar */}
            <Separator orientation="vertical" className="h-7" />
            <ImagePlaceholderToolbar />
          </div>
        </ToolbarProvider>
      )}
    </div>
  );
}
