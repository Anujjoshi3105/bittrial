import { HomeIcon, SearchIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import SearchDialog from "./dialog/search-dialog";
import TrashDialog from "./dialog/trash-dialog";
import SidebarButton from "./sidebar-button";
import Link from "next/link";

export default function SidebarMenu() {
  return (
    <div className="pb-3">
      <SidebarButton asChild>
        <Link href="/dashboard">
          <HomeIcon />
          Home
        </Link>
      </SidebarButton>
      <SearchDialog>
        <SidebarButton
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <SearchIcon />
          Search
        </SidebarButton>
      </SearchDialog>
      <TrashDialog>
        <SidebarButton>
          <Trash2Icon />
          Trash
        </SidebarButton>
      </TrashDialog>
      <SidebarButton asChild>
        <Link href="/dashboard/settings">
          <SettingsIcon />
          Settings
        </Link>
      </SidebarButton>
    </div>
  );
}
