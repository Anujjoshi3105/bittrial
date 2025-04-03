/*
import { create } from "zustand";
import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { client as supabaseClient } from "@/lib/supabase/client";
import {
  SocketEditorEvent,
  EditorRange,
  TOOLBAR_OPTIONS,
} from "@/types/editor.types";
import { useSocket } from "@/providers/socket.provider";
import { useUserStore } from "@/store/use-user-store";
import { useDocStore } from "@/store/use-doc-store";
import { Json } from "@/lib/supabase/database.types";
import useDebounceCallback from "@/hooks/use-debounce-callback";
import { randomColor } from "@/lib/utils";
import { toast } from "sonner";

interface EditorCollaborator {
  id: string;
  email: string;
  avatarUrl: string;
  presence_ref: string;
}

type EditorState = {
  quill: any | null;
  collaborators: EditorCollaborator[];
  localCursors: any[];
  wrapperRef: React.RefObject<HTMLDivElement> | null;
  isLoading: boolean;
};

type EditorActions = {
  setQuill: (quill: any) => void;
  setCollaborators: (collaborators: EditorCollaborator[]) => void;
  addLocalCursor: (cursor: any) => void;
  setLocalCursors: (cursors: any[]) => void;
  removeLocalCursor: (cursorId: string) => void;
  setWrapperRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setIsLoading: (isLoading: boolean) => void;
  initializeEditor: (
    wrapper: HTMLElement | null,
    initialContent: any
  ) => Promise<void>;
};

// Create Zustand store
const useEditorStore = create<EditorState & EditorActions>()((set, get) => ({
  quill: null,
  collaborators: [],
  localCursors: [],
  wrapperRef: null,
  isLoading: true,

  setQuill: (quill) => set({ quill }),
  setCollaborators: (collaborators) => set({ collaborators }),
  addLocalCursor: (cursor) =>
    set((state) => ({
      localCursors: [...state.localCursors, cursor],
    })),
  setLocalCursors: (localCursors) => set({ localCursors }),
  removeLocalCursor: (cursorId) =>
    set((state) => ({
      localCursors: state.localCursors.filter(
        (cursor) => cursor.cursors()[0]?.id !== cursorId
      ),
    })),
  setWrapperRef: (wrapperRef) => set({ wrapperRef }),
  setIsLoading: (isLoading) => set({ isLoading }),

  initializeEditor: async (wrapper, initialContent) => {
    if (!wrapper) return;

    const editor = document.createElement("div");
    wrapper.append(editor);

    const Quill = (await import("quill")).default;
    const QuillCursors = (await import("quill-cursors")).default;
    Quill.register("modules/cursors", QuillCursors);

    const quillInstance = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: { transformOnTextChange: true },
      },
      placeholder: "Write something...",
      readOnly: false,
    });

    // Initialize with existing document content if available
    if (initialContent) {
      quillInstance.setContents(initialContent as any);
    }

    set({ quill: quillInstance, isLoading: false });
  },
}));

export function useEditor() {
  const params = useParams();
  const id = params?.docID as string;
  const { socket } = useSocket();
  const { currentUser: user } = useUserStore();
  const { doc, loadingDoc, updateDocAsync } = useDocStore();
  const { delayedCallback } = useDebounceCallback(2000);

  // Get state and actions from store
  const {
    quill,
    collaborators,
    localCursors,
    isLoading,
    setQuill,
    setCollaborators,
    setLocalCursors,
    setIsLoading,
    initializeEditor,
  } = useEditorStore();

  // Create wrapper ref with Quill initialization
  const wrapperRef = useCallback(
    async (wrapper: HTMLElement | null) => {
      await initializeEditor(wrapper, doc?.content);
    },
    [initializeEditor, doc?.content]
  );

  // Create room when user joins
  useEffect(() => {
    if (!socket || !quill || !id) {
      return undefined;
    }

    socket.emit(SocketEditorEvent.CreateRoom, id);
  }, [socket, quill, id]);

  // Handle document updates (text changes and auto-save)
  useEffect(() => {
    if (!quill || !socket || !id || !user) return;

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
        updateDocAsync(id, { content: contents as Json });
      });
    };

    quill.on(SocketEditorEvent.TextChange, handleQuillChange);

    // Handle incoming changes from other users
    const handleIncomingChanges = (deltas: any, id: string) => {
      if (id === id) {
        quill.updateContents(deltas);
      }
    };

    socket.on(SocketEditorEvent.ReceiveChanges, handleIncomingChanges);

    return () => {
      quill.off(SocketEditorEvent.TextChange, handleQuillChange);
      socket.off(SocketEditorEvent.ReceiveChanges, handleIncomingChanges);
    };
  }, [quill, socket, id, user, delayedCallback, updateDocAsync]);

  // Handle cursor synchronization
  useEffect(() => {
    if (!quill || !socket || !id || !user) return;

    // Send cursor position to other users
    const handleCursorMove = (
      range: EditorRange,
      oldRange: EditorRange,
      source: string
    ) => {
      if (source !== "user") return;
      socket.emit(SocketEditorEvent.SendCursorMove, range, id, user.id);
    };

    quill.on(SocketEditorEvent.SelectionChange, handleCursorMove);

    return () => {
      quill.off(SocketEditorEvent.SelectionChange, handleCursorMove);
    };
  }, [quill, socket, id, user]);

  // Receive and display other users' cursors
  useEffect(() => {
    if (!quill || !socket || !id) return;

    const handleIncomingCursor = (
      range: EditorRange,
      roomId: string,
      cursorId: string
    ) => {
      if (roomId !== id || cursorId === user?.id) return;

      const cursorToMove = localCursors.find(
        (cursor) => cursor.cursors()?.[0]?.id === cursorId
      );

      if (cursorToMove) {
        cursorToMove.moveCursor(cursorId, range);
      }
    };

    socket.on(SocketEditorEvent.ReceiveCursorMove, handleIncomingCursor);

    return () => {
      socket.off(SocketEditorEvent.ReceiveCursorMove, handleIncomingCursor);
    };
  }, [quill, socket, id, localCursors, user]);

  // Manage presence (collaborators list) with Supabase
  useEffect(() => {
    if (!id || !quill || !user) return;

    const room = supabaseClient.channel(id);

    // Handle when users join
    room.on("presence", { event: "join" }, ({ newPresences }) => {
      const newCollaborators = Object.values(
        newPresences
      ).flat() as unknown as EditorCollaborator[];

      if (newCollaborators[0] && newCollaborators[0].id !== user.id) {
        toast.info(`${newCollaborators[0]?.email} joined the document.`);
      }
    });

    // Handle presence synchronization
    const subscription = room.on("presence", { event: "sync" }, () => {
      const newState = room.presenceState();
      const newCollaborators = Object.values(
        newState
      ).flat() as unknown as EditorCollaborator[];
      setCollaborators(newCollaborators);

      // Create cursors for all collaborators
      const allCursors: any[] = [];

      newCollaborators.forEach((collaborator) => {
        if (collaborator.id !== user.id) {
          const userCursor = quill.getModule("cursors");
          const displayName = collaborator.email.includes("@")
            ? collaborator.email.split("@")[0]
            : collaborator.email;

          userCursor.createCursor(collaborator.id, displayName, randomColor());

          allCursors.push(userCursor);
        }
      });

      setLocalCursors(allCursors);
    });

    // Handle when users leave
    room.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const leftCollaborators = Object.values(
        leftPresences
      ).flat() as unknown as EditorCollaborator[];

      if (leftCollaborators[0] && leftCollaborators[0].id !== user.id) {
        // Remove cursor when user leaves
        const userCursor = quill.getModule("cursors");
        userCursor.removeCursor(leftCollaborators[0].id);

        toast.info(`${leftCollaborators[0]?.email} left the document.`);
      }
    });

    // Subscribe and track user presence
    subscription.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;

      const avatarUrl = user.aud || "";
      const email = user.email || "";

      room.track({
        id: user.id,
        email: email,
        avatarUrl: avatarUrl,
      });
    });

    return () => {
      supabaseClient.removeChannel(room);
    };
  }, [id, quill, user, setCollaborators, setLocalCursors]);

  // Handle client-side rendering
  useEffect(() => {
    if (typeof window !== "undefined") {
      return undefined;
    }
  }, []);

  // Set loading state based on docStore
  useEffect(() => {
    setIsLoading(loadingDoc);
  }, [loadingDoc, setIsLoading]);

  return {
    quill,
    wrapperRef,
    collaborators,
    isLoading,
  };
}
*/
