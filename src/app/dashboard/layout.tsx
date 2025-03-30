import { createClient } from "@/lib/supabase/utils/server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import DashboardWrapper from "./_components/dashboard-wrapper";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const server = await createClient();
  const { data } = await server.auth.getUser();
  if (!data.user) return redirect("/login");

  const { data: profile } = await server
    .from("users")
    .select("username, fullname")
    .eq("id", data.user.id)
    .single();

  if (!profile?.fullname || !profile?.username) {
    return redirect("/complete-signup");
  }

  return (
    <DashboardWrapper currentUser={data.user}>{children}</DashboardWrapper>
  );
}
