"use client";

import { SidebarTriggerHeader } from "@/components/ui/sidebar";
import { DocHeader, DocDetailHeader } from "../[docID]/_components/header";

const Header = function Header() {
  return (
    <header className="group flex h-12 w-full items-center justify-between px-3 border-b-[0.5px]">
      <SidebarTriggerHeader className="mr-4" />
      <DocHeader />
      <DocDetailHeader />
    </header>
  );
};

export default Header;
