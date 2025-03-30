import React from "react";
import { createClient } from "@/lib/supabase/utils/server";
import { redirect } from "next/navigation";
import CompleteSignUpPage from "./complete-signup";

export default async function CompleteSignUpRootPage() {
  const server = await createClient();
  const { data: profile } = await server
    .from("users")
    .select("username, fullname")
    .single();

  if (profile?.fullname && profile?.username) return redirect("/dashboard");

  return <CompleteSignUpPage />;
}
