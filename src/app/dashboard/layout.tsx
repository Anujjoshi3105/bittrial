import { PropsWithChildren } from "react";
import LayoutWrapper from "./_components/layout-wrapper";
import { createClient } from "@/lib/supabase/utils/server";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: PropsWithChildren) {
  const supabaseClient = await createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabaseClient
    .from("users")
    .select("username, fullname")
    .eq("id", user.id)
    .single();
  if (!profile?.fullname || !profile?.username)
    return redirect("/complete-signup");

  return <LayoutWrapper currentUser={user}>{children}</LayoutWrapper>;
}
