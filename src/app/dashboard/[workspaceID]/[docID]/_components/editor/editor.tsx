"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "@/components/ui/separator";
import EditorToolbar from "./toolbar";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { useDocStore } from "@/lib/store/use-doc-store";
import SearchAndReplace from "@/components/extensions/search-and-replace";
import { ImageExtension } from "@/components/extensions/image";
import { ImagePlaceholder } from "@/components/extensions/image-placeholder";
import TextAlign from "@tiptap/extension-text-align";

// Add all extensions
const extensions = [
  ...defaultExtensions,
  slashCommand,
  SearchAndReplace,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  ImageExtension,
  ImagePlaceholder.configure({
    HTMLAttributes: {
      class: "w-full",
    },
    allowedMimeTypes: {
      image: ["image/*"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (files) => {
      console.log("Files dropped:", files);
      // Default handling will continue
    },
    onDropRejected: (files) => {
      console.log("Files rejected:", files);
      // You could show a toast notification here
    },
    onEmbed: (url) => {
      console.log("URL embedded:", url);
      // Default handling will continue
    },
  }),
];

const Editor = () => {
  const { doc, updateDocAsync } = useDocStore();
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [editor, setEditor] = useState<EditorInstance | null>(null);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      if (doc?.id) updateDocAsync(doc.id, { content: json });
    },
    500
  );

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(doc?.content as JSONContent, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="relative w-full max-w-screen-lg">
      <EditorRoot>
        <EditorToolbar editor={editor} />
        <EditorContent
          initialContent={doc?.content as JSONContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg bg-muted sm:mb-[calc(20vh)] sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
          }}
          onCreate={({ editor }) => {
            setEditor(editor);
          }}
          slotAfter={<ImageResizer />}>
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

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
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default Editor;
