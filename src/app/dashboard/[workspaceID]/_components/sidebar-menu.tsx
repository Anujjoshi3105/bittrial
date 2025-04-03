import {
  HomeIcon,
  MailPlusIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";
import SearchDialog from "./dialog/search-dialog";
import TrashDialog from "./dialog/trash-dialog";
import SidebarButton from "./sidebar-button";
import Link from "next/link";
import { useParams } from "next/navigation";
import InviteDialog from "./dialog/invite-dialog";

export default function SidebarMenu() {
  const params = useParams();
  return (
    <div className="pb-3">
      <SidebarButton asChild>
        <Link href={`/dashboard/${params?.workspaceID}`}>
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
      <InviteDialog id={params?.workspaceID as string}>
        <SidebarButton>
          <MailPlusIcon />
          Invite
        </SidebarButton>
      </InviteDialog>
      <SidebarButton asChild>
        <Link href="/dashboard/settings">
          <SettingsIcon />
          Settings
        </Link>
      </SidebarButton>
    </div>
  );
}
