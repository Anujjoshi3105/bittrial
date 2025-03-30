import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import LayoutWrapper from "./_components/layout-wrapper";

export default async function MainLayout({
  children,
  params,
}: PropsWithChildren & { params: Promise<{ workspaceID: string }> }) {
  const { workspaceID } = await params;
  if (!workspaceID) return redirect("/dashboard");

  return <LayoutWrapper workspaceId={workspaceID}>{children}</LayoutWrapper>;
}
