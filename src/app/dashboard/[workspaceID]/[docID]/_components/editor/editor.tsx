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
import { useEffect, useState, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "@/components/ui/separator";
import EditorToolbar from "./toolbar";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { suggestionItems } from "./slash-command";
import { useDocStore } from "@/lib/store/use-doc-store";
import { ImageExtension } from "@/components/extensions/image";
import { ImagePlaceholder } from "@/components/extensions/image-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorView } from "@tiptap/pm/view";
import { Slice } from "@tiptap/pm/model";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { TiptapCollabProvider } from "@hocuspocus/provider";

// Configure ImagePlaceholder handlers
const handleDrop = (files: File[]) => {
  console.log("Files dropped:", files);
  // Default handling will continue
};

const handleDropRejected = (files: File[]) => {
  console.log("Files rejected:", files);
  // You could show a toast notification here
};

const handleEmbed = (url: string) => {
  console.log("URL embedded:", url);
  // Default handling will continue
};

const Editor = () => {
  const { doc: docData, updateDocAsync } = useDocStore();
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const yDocRef = useRef(new Y.Doc());
  const providerRef = useRef<TiptapCollabProvider | null>(null);

  // Create the extensions once to avoid recreating them
  const extensions = [
    ...defaultExtensions,
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
      onDrop: handleDrop,
      onDropRejected: handleDropRejected,
      onEmbed: handleEmbed,
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Collaboration.configure({
      document: yDocRef.current,
    }),
  ];

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      if (!docData?.id) return;

      const json = editor.getJSON();
      await updateDocAsync(docData.id, { content: json });
    },
    2000
  );

  // Setup collaboration when document ID changes
  useEffect(() => {
    if (!docData?.id || !editor) return;

    // Clean up previous provider if it exists
    if (providerRef.current) {
      providerRef.current.destroy();
    }

    // Create new provider with current document ID
    providerRef.current = new TiptapCollabProvider({
      name: docData.id, // Unique document identifier for syncing
      appId: "x9lo6gv9", // Your Cloud Dashboard AppID
      token: "G1XVPfkt2UiMxBF9waxv4lifNteADEvrybB12qm0yT8g7fRJpPA7dRfAn5tiAuxX", // Your JWT token
      document: yDocRef.current,
      onSynced() {
        // Only set initial content if it hasn't been set yet
        if (
          !yDocRef.current.getMap("config").get("initialContentLoaded") &&
          editor
        ) {
          yDocRef.current.getMap("config").set("initialContentLoaded", true);

          // Set content from docData if available
          if (docData?.content) {
            editor.commands.setContent(docData.content as JSONContent);
          }
        }
      },
    });

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
    };
  }, [docData?.id, editor]);

  const handleEditorCreate = useCallback(
    ({ editor }: { editor: EditorInstance }) => {
      setEditor(editor);
    },
    []
  );

  const handleEditorUpdate = useCallback(
    ({ editor }: { editor: EditorInstance }) => {
      debouncedUpdates(editor);
    },
    [debouncedUpdates]
  );

  const handleKeyDown = useCallback(
    (_view: EditorView, event: KeyboardEvent) => {
      return handleCommandNavigation(event);
    },
    []
  );

  const handlePasteEvent = useCallback(
    (view: EditorView, event: ClipboardEvent) => {
      return handleImagePaste(view, event, uploadFn);
    },
    []
  );

  const handleDropEvent = useCallback(
    (view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => {
      return handleImageDrop(view, event, moved, uploadFn);
    },
    []
  );

  return (
    <div className="relative w-full max-w-screen-lg">
      <EditorRoot>
        <EditorToolbar editor={editor} />
        <EditorContent
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg bg-muted sm:mb-[calc(20vh)] sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: handleKeyDown,
            },
            handlePaste: handlePasteEvent,
            handleDrop: handleDropEvent,
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={handleEditorUpdate}
          onCreate={handleEditorCreate}
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
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default Editor;
