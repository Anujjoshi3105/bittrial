"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/lib/store/use-user-store";
import { ChevronsUpDownIcon } from "lucide-react";
import UserPopover from "./popover/user-popover";
import SidebarButton from "./sidebar-button";

export default function SidebarUser() {
  const { fullname, username } = useUserStore();

  return (
    <UserPopover fullname={fullname} username={username}>
      {!fullname ? (
        <Skeleton className="mb-1 h-10 w-full bg-primary/5" />
      ) : (
        <SidebarButton className="h-[50px] md:h-11">
          <div className="relative mr-2 flex h-[25px] w-[25px] items-center justify-center rounded-full bg-secondary-foreground">
            <span className="text-sm font-medium uppercase text-secondary">
              {fullname ? fullname[0] : "S"}
            </span>
          </div>

          <p className="mr-1 max-w-[250px] truncate capitalize md:max-w-[120px]">
            {fullname}
          </p>

          <ChevronsUpDownIcon className="h-3 w-3 text-muted-foreground" />
        </SidebarButton>
      )}
    </UserPopover>
  );
}
