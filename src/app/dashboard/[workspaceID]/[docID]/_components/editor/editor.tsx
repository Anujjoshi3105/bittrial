"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";
import {
  SocketEditorEvent,
  EditorRange,
  TOOLBAR_OPTIONS,
} from "@/types/editor.types";
import { useUserStore } from "@/lib/store/use-user-store";
import { useDocStore } from "@/lib/store/use-doc-store";
import { Json } from "@/types/database.types";
import { client as supabaseClient } from "@/lib/supabase/utils/client";
import { useSocket } from "@/lib/providers/socket.provider";
import useDebounceCallback from "@/lib/hooks/use-debounce-callback";
import { randomColor } from "@/lib/utils";
import { EditorCollaborator } from "@/types/global.type";
import { Loader2 } from "lucide-react";
import Quill, { Delta } from "quill";
import QuillCursors from "quill-cursors";
import IQuillRange from "quill-cursors/dist/quill-cursors/i-range";

export default function Editor() {
  const params = useParams();
  const id = params?.docID as string;
  const { socket } = useSocket();
  const { currentUser, avatar } = useUserStore();
  const { updateDocAsync, doc, loadingDoc, setCollaborators } = useDocStore();
  const { delayedCallback } = useDebounceCallback(2000);
  const initContent = doc?.content;
  const [quill, setQuill] = useState<Quill | null>(null);
  const collaboratorColorsRef = useRef<Map<string, string>>(new Map());

  // Reference to track if the editor has been initialized
  const isInitialized = useRef(false);
  // Reference to the wrapper element
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Initialize editor with Quill and related modules
  useEffect(() => {
    if (!wrapperRef.current || isInitialized.current || !doc) return;

    const initQuill = async () => {
      // Clear any existing content first
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }

      const editor = document.createElement("div");
      wrapperRef.current?.appendChild(editor);

      const Quill = (await import("quill")).default;
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);

      const quillInstance = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          formula: true,
          cursors: {
            hideDelayMs: 5000,
            hideSpeedMs: 200,
            selectionChangeSource: null,
            transformOnTextChange: true,
          },
          history: {
            delay: 2000,
            maxStack: 1000,
            userOnly: true,
          },
        },
        placeholder: "Write something...",
        readOnly: false,
      });

      // Initialize with existing document content if available
      if (initContent) {
        quillInstance.setContents(doc.content as unknown as Delta);
      }

      setQuill(quillInstance);
      isInitialized.current = true;
    };

    initQuill();
    const currentWrapperRef = wrapperRef.current;
    // Cleanup function to prevent memory leaks
    return () => {
      if (currentWrapperRef) {
        currentWrapperRef.innerHTML = "";
      }
      setQuill(null);
      isInitialized.current = false;
    };
  }, [doc, initContent, id]);

  // Handle SSR
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
  }, []);

  // Undo/Redo handlers
  useEffect(() => {
    if (!quill) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        quill.history.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        quill.history.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quill]);

  // Create room when user joins
  useEffect(() => {
    if (!socket || !quill || !id) {
      return undefined;
    }

    socket.emit(SocketEditorEvent.CreateRoom, id);
  }, [socket, quill, id]);

  // Handle document updates (text changes and auto-save)
  useEffect(() => {
    if (!quill || !socket || !id || !currentUser) return;

    const handleQuillChange = (
      delta: EditorRange,
      oldDelta: EditorRange,
      source: string
    ) => {
      if (source !== "user") return;

      // Emit changes to other collaborators
      socket.emit(SocketEditorEvent.SendChanges, delta, id);

      // Save to database after a delay (debounced)
      delayedCallback(() => {
        const contents = quill.getContents();
        updateDocAsync(id, { content: contents as unknown as Json });
      });
    };

    quill.on(SocketEditorEvent.TextChange, handleQuillChange);

    // Handle incoming changes from other users
    const handleIncomingChanges = (deltas: Delta, id: string) => {
      if (id === id) {
        quill.updateContents(deltas);
      }
    };

    socket.on(SocketEditorEvent.ReceiveChanges, handleIncomingChanges);

    return () => {
      quill.off(SocketEditorEvent.TextChange, handleQuillChange);
      socket.off(SocketEditorEvent.ReceiveChanges, handleIncomingChanges);
    };
  }, [quill, socket, id, currentUser, delayedCallback, updateDocAsync]);

  // Handle cursor synchronization
  useEffect(() => {
    if (!quill || !socket || !id || !currentUser) return;

    // Send cursor position to other users
    const handleCursorMove = (
      range: EditorRange,
      oldRange: EditorRange,
      source: string
    ) => {
      if (source !== "user") return;
      socket.emit(SocketEditorEvent.SendCursorMove, range, id, currentUser.id);
    };

    quill.on(SocketEditorEvent.SelectionChange, handleCursorMove);

    return () => {
      quill.off(SocketEditorEvent.SelectionChange, handleCursorMove);
    };
  }, [quill, socket, id, currentUser]);

  // Receive and display other users' cursors
  useEffect(() => {
    if (!quill || !socket || !id || !currentUser) return;

    const handleIncomingCursor = (
      range: EditorRange,
      roomId: string,
      cursorId: string
    ) => {
      if (roomId !== id || cursorId === currentUser?.id) return;

      const cursorModule = quill.getModule("cursors") as QuillCursors;

      // Move existing cursor if it exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cursorModule.cursors().some((c: any) => c.id === cursorId)) {
        cursorModule.moveCursor(cursorId, range as unknown as IQuillRange);
      }
    };

    socket.on(SocketEditorEvent.ReceiveCursorMove, handleIncomingCursor);

    return () => {
      socket.off(SocketEditorEvent.ReceiveCursorMove, handleIncomingCursor);
    };
  }, [quill, socket, id, currentUser]);

  // Manage presence (collaborators list) with Supabase
  useEffect(() => {
    if (!id || !quill || !currentUser) return;

    const room = supabaseClient.channel(id);
    const cursorModule = quill.getModule("cursors") as QuillCursors;

    // Helper function to deduplicate collaborators by ID
    const deduplicateCollaborators = (collaborators: EditorCollaborator[]) => {
      const uniqueCollaborators = new Map<string, EditorCollaborator>();

      // Keep only the latest entry for each collaborator ID
      collaborators.forEach((collaborator) => {
        uniqueCollaborators.set(collaborator.id, collaborator);
      });

      return Array.from(uniqueCollaborators.values());
    };

    // Helper function to create or update a cursor
    const updateCursor = (collaborator: EditorCollaborator) => {
      if (collaborator.id === currentUser.id) return;

      const displayName = collaborator.email.includes("@")
        ? collaborator.email.split("@")[0]
        : collaborator.email;

      // Get or create a color for this collaborator
      if (!collaboratorColorsRef.current.has(collaborator.id)) {
        collaboratorColorsRef.current.set(collaborator.id, randomColor());
      }
      const color =
        collaboratorColorsRef.current.get(collaborator.id) || randomColor();

      // Check if cursor already exists
      const existingCursor = cursorModule
        .cursors()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .find((c: any) => c.id === collaborator.id);

      if (!existingCursor) {
        // Create new cursor
        cursorModule.createCursor(collaborator.id, displayName, color);
      }
    };

    // Handle when users join
    room.on("presence", { event: "join" }, ({ newPresences }) => {
      const newCollaborators = Object.values(
        newPresences
      ).flat() as unknown as EditorCollaborator[];

      // Only notify for truly new collaborators who aren't the current user
      const uniqueNewCollaborator = newCollaborators.find(
        (collab) => collab.id !== currentUser.id
      );

      if (uniqueNewCollaborator) {
        toast.info(`${uniqueNewCollaborator.email} joined the document.`);
      }
    });

    // Handle presence synchronization
    const subscription = room.on("presence", { event: "sync" }, () => {
      const newState = room.presenceState();
      const allCollaborators = Object.values(
        newState
      ).flat() as unknown as EditorCollaborator[];

      // Deduplicate collaborators by ID
      const uniqueCollaborators = deduplicateCollaborators(allCollaborators);

      // Update collaborators in the store
      setCollaborators(uniqueCollaborators);

      // Create or update cursors for all collaborators
      uniqueCollaborators.forEach(updateCursor);
    });

    // Handle when users leave
    room.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const leftCollaborators = Object.values(
        leftPresences
      ).flat() as unknown as EditorCollaborator[];

      // Get current state to check if user is truly gone
      const currentState = room.presenceState();
      const remainingCollaborators = Object.values(
        currentState
      ).flat() as unknown as EditorCollaborator[];
      const remainingIds = new Set(remainingCollaborators.map((c) => c.id));

      // Only process collaborators who have completely left (no remaining sessions)
      leftCollaborators.forEach((collaborator) => {
        if (
          !remainingIds.has(collaborator.id) &&
          collaborator.id !== currentUser.id
        ) {
          // Remove cursor when user completely leaves
          cursorModule.removeCursor(collaborator.id);
          collaboratorColorsRef.current.delete(collaborator.id);

          toast.info(`${collaborator.email} left the document.`);
        }
      });
    });

    // Subscribe and track user presence
    subscription.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      console.log("user is connected", currentUser.id);
      const email = currentUser.email || "";

      room.track({
        id: currentUser.id,
        email: email,
        avatarUrl: avatar,
      });
    });

    return () => {
      supabaseClient.removeChannel(room);
    };
  }, [id, quill, currentUser, avatar, setCollaborators]);

  if (loadingDoc) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-12 animate-spin md:size-24 text-background" />
      </div>
    );
  }

  return <div ref={wrapperRef} className="relative" />;
}
