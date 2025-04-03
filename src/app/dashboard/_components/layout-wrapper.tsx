"use client";

import { type PropsWithChildren } from "react";
import useDocRealtime from "../_hooks/use-doc-realtime";
import Header from "./header";
import SidebarMenu from "./sidebar-menu";
import SidebarTree from "./sidebar-tree";
import SidebarUser from "./sidebar-user";
import {
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserStore } from "@/lib/store/use-user-store";
import { useEffectOnce } from "usehooks-ts";
import { User } from "@supabase/supabase-js";

export default function LayoutWrapper({
  children,
  currentUser,
}: PropsWithChildren & {
  currentUser: User;
}) {
  const { setCurrentUser, getCurrentProfileUserAsync } = useUserStore();

  useEffectOnce(() => {
    setCurrentUser(currentUser);
    getCurrentProfileUserAsync();
  });

  useDocRealtime();
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="group/sidebar">
          <SidebarTrigger className="absolute right-4 top-4 z-[100] opacity-0 group-hover/sidebar:opacity-60 hover:opacity-100" />
          <SidebarRail />
          <SidebarHeader>
            <SidebarUser />
            <SidebarMenu />
          </SidebarHeader>
          <SidebarContent className="py-2 space-y-2">
            <SidebarTree />
            <SidebarTree message="No favorite yet" favorite />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
