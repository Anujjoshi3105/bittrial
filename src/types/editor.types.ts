export enum SocketEditorEvent {
  CreateRoom = "create-room",
  SendChanges = "send-changes",
  ReceiveChanges = "receive-changes",
  TextChange = "text-change",
  SelectionChange = "selection-change",
  ReceiveCursorMove = "receive-cursor-move",
  SendCursorMove = "send-cursor-move",
}

export type EditorRange = { index: number; length: number } | null;

export const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // Text formatting
  ["blockquote", "code-block"], // Block-level elements
  [{ header: 1 }, { header: 2 }], // Headers
  [{ list: "ordered" }, { list: "bullet" }], // Lists
  [{ script: "sub" }, { script: "super" }], // Subscript/Superscript
  [{ indent: "-1" }, { indent: "+1" }], // Indentation
  [{ direction: "rtl" }], // Text direction
  [{ size: ["small", false, "large", "huge"] }], // Font sizes
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // Header options
  [{ color: [] }, { background: [] }], // Text color & background color
  [{ font: [] }], // Font selection
  [{ align: [] }], // Text alignment
  ["clean"], // Remove formatting
  ["link", "image", "video", "formula"], // Media embeds & formulas
  [{ list: "check" }], // Checklist
  ["undo", "redo"], // Undo/Redo buttons
  ["ai"],
];
