import { useState, memo } from "react";
import { type EditorInstance } from "novel";
import { Separator } from "@/components/ui/separator";
import { ToolbarProvider } from "@/components/toolbars/toolbar-provider";

// Import toolbar components
import { BlockquoteToolbar } from "@/components/toolbars/blockquote";
import { BoldToolbar } from "@/components/toolbars/bold";
import { BulletListToolbar } from "@/components/toolbars/bullet-list";
import { CodeToolbar } from "@/components/toolbars/code";
import { CodeBlockToolbar } from "@/components/toolbars/code-block";
import { HardBreakToolbar } from "@/components/toolbars/hard-break";
import { HorizontalRuleToolbar } from "@/components/toolbars/horizontal-rule";
import { ItalicToolbar } from "@/components/toolbars/italic";
import { OrderedListToolbar } from "@/components/toolbars/ordered-list";
import { StrikeThroughToolbar } from "@/components/toolbars/strikethrough";
import { SearchAndReplaceToolbar } from "@/components/toolbars/search-and-replace-toolbar";
import { ImagePlaceholderToolbar } from "@/components/toolbars/image-placeholder-toolbar";

// Additional tools
import { NodeSelector } from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/selectors/node-selector";
import { LinkSelector } from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/selectors/link-selector";
import { MathSelector } from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/selectors/math-selector";
import { TextButtons } from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/selectors/text-buttons";
import { ColorSelector } from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/selectors/color-selector";
import GenerativeMenuSwitch from "../../app/dashboard/[workspaceID]/[docID]/_components/editor/generative/generative-menu-switch";

// Group related toolbar items for better organization
const FormattingTools = memo(() => (
  <>
    <BoldToolbar />
    <ItalicToolbar />
    <StrikeThroughToolbar />
  </>
));
FormattingTools.displayName = "FormattingTools";

const ListTools = memo(() => (
  <>
    <BulletListToolbar />
    <OrderedListToolbar />
  </>
));
ListTools.displayName = "ListTools";

const CodeTools = memo(() => (
  <>
    <CodeToolbar />
    <CodeBlockToolbar />
  </>
));
CodeTools.displayName = "CodeTools";

const BlockTools = memo(() => (
  <>
    <HorizontalRuleToolbar />
    <BlockquoteToolbar />
    <HardBreakToolbar />
  </>
));
BlockTools.displayName = "BlockTools";

const UtilityTools = memo(() => (
  <>
    <SearchAndReplaceToolbar />
    <Separator orientation="vertical" className="h-7" />
    <ImagePlaceholderToolbar />
  </>
));
UtilityTools.displayName = "UtilityTools";

interface EditorToolbarProps {
  editor: EditorInstance;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  return (
    <div className="flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20 rounded-t-lg">
      <ToolbarProvider editor={editor}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basic formatting */}
          <Separator orientation="vertical" className="h-7" />
          <FormattingTools />

          {/* Lists */}
          <Separator orientation="vertical" className="h-7" />
          <ListTools />

          {/* Code */}
          <Separator orientation="vertical" className="h-7" />
          <CodeTools />

          {/* Block elements */}
          <Separator orientation="vertical" className="h-7" />
          <BlockTools />

          {/* Utility tools */}
          <Separator orientation="vertical" className="h-7" />
          <UtilityTools />
        </div>
      </ToolbarProvider>

      {/* Advanced menu */}
      <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
        <Separator orientation="vertical" />
        <NodeSelector open={openNode} onOpenChange={setOpenNode} />
        <Separator orientation="vertical" />
        <LinkSelector open={openLink} onOpenChange={setOpenLink} />
        <Separator orientation="vertical" />
        <MathSelector />
        <Separator orientation="vertical" />
        <TextButtons />
        <Separator orientation="vertical" />
        <ColorSelector open={openColor} onOpenChange={setOpenColor} />
      </GenerativeMenuSwitch>
    </div>
  );
};

export default memo(EditorToolbar);
