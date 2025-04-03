"use client";

import { useUserStore } from "@/lib/store/use-user-store";
import type { User } from "@supabase/supabase-js";
import { type PropsWithChildren } from "react";
import { useEffectOnce } from "usehooks-ts";

export default function DashboardWrapper({
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
  return children;
}
