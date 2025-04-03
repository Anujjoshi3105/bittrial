"use client";

import { useEffect, type PropsWithChildren } from "react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import WorkspaceDialog from "./workspace-dialog";

export default function LayoutWrapper({
  children,
  workspaceId,
}: PropsWithChildren & {
  workspaceId: string;
}) {
  useEffect(() => {
    if (!workspaceId) return;
  }, [workspaceId]);
  useDocRealtime(workspaceId);
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="group/sidebar">
          <SidebarTrigger className="absolute right-4 top-4 z-[100] opacity-0 group-hover/sidebar:opacity-60 hover:opacity-100" />
          <SidebarRail />
          <SidebarHeader>
            <WorkspaceDialog />
            <SidebarMenu />
          </SidebarHeader>
          <SidebarContent className="py-2 space-y-2">
            <SidebarTree workspaceID={workspaceId} />
            <SidebarTree
              workspaceID={workspaceId}
              message="No favorite yet"
              favorite
            />
          </SidebarContent>
          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
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
