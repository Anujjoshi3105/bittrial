"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Quill from "quill";

export default function Toolbar({ quill }: { quill: Quill }) {
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

  return (
    <div id="toolbar" className="flex items-center gap-2 p-2 border-b">
      {/* Default Quill toolbar */}
      <span className="ql-formats">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </span>
      <span className="ql-formats">
        <button className="ql-blockquote" />
        <button className="ql-code-block" />
      </span>
      <span className="ql-formats">
        <select className="ql-header">
          <option value="1" />
          <option value="2" />
          <option selected />
        </select>
      </span>
      <span className="ql-formats">
        <select className="ql-color" />
        <select className="ql-background" />
      </span>
      <span className="ql-formats">
        <select className="ql-align" />
      </span>

      {/* Custom AI Button */}
      <Button className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        AI
      </Button>
    </div>
  );
}
