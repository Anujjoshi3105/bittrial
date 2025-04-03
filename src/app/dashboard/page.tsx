import {
  getCollaboratingWorkspaces,
  getPrivateWorkspaces,
  getSharedWorkspaces,
} from "@/lib/queries/workspace";
import NewWorkspaceDialog from "./_components/dialog/new-workspace-dialog";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "./_components/workspace-card";
import { Workspace } from "@/types/supabase.types";
import { RefreshCwIcon, PlusIcon, FolderIcon } from "lucide-react";
import { Suspense } from "react";

function WorkspaceSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-muted/20 rounded-xl animate-pulse h-64 w-full"
        />
      ))}
    </div>
  );
}

async function Section({
  title,
  workspaces,
}: {
  title: string;
  workspaces: Workspace[];
  fetchWorkspaces: () => Promise<Workspace[]>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCwIcon />
          Refresh
        </Button>
      </div>

      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isOwner={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
          <div className="bg-muted/50 rounded-full p-4 mb-4">
            <FolderIcon className="h-12 w-12 text-muted-foreground opacity-70" />
          </div>
          <p className="text-sm text-muted-foreground">
            No {title.toLowerCase()} available
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Create a new workspace to get started
          </p>
        </div>
      )}
    </div>
  );
}

export default async function MainLayout() {
  const [privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(),
      getSharedWorkspaces(),
      getCollaboratingWorkspaces(),
    ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Workspaces</h1>
        <NewWorkspaceDialog>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            New Workspace
          </Button>
        </NewWorkspaceDialog>
      </div>

      <div className="space-y-8">
        <Suspense fallback={<WorkspaceSectionSkeleton />}>
          <Section
            title="Private Workspaces"
            workspaces={privateWorkspaces}
            fetchWorkspaces={getPrivateWorkspaces}
          />
        </Suspense>

        <Suspense fallback={<WorkspaceSectionSkeleton />}>
          <Section
            title="Shared Workspaces"
            workspaces={sharedWorkspaces}
            fetchWorkspaces={getSharedWorkspaces}
          />
        </Suspense>

        <Suspense fallback={<WorkspaceSectionSkeleton />}>
          <Section
            title="Collaborating Workspaces"
            workspaces={collaboratingWorkspaces}
            fetchWorkspaces={getCollaboratingWorkspaces}
          />
        </Suspense>
      </div>
    </div>
  );
}
