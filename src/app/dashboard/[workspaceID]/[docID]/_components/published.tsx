import { useDocStore } from "@/lib/store/use-doc-store";
import { GlobeIcon, LockIcon } from "lucide-react";
import React from "react";

export default function Published() {
  const { isPublished } = useDocStore();

  return (
    <p className="sticky top-0 z-10 flex w-full items-center justify-center gap-x-2 border-y border-y-secondary bg-background/50 p-2 text-xs font-medium text-sky-800 backdrop-blur dark:text-sky-600">
      {isPublished ? (
        <>
          <GlobeIcon size={14} />
          Page is published
        </>
      ) : (
        <>
          <LockIcon size={14} /> Page is private
        </>
      )}
    </p>
  );
}
