import { createClient } from "@/lib/supabase/utils/server";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams?.get("code") as string;
  const server = await createClient();

  try {
    const { data, error } = await server.auth.exchangeCodeForSession(code);

    if (data)
      return NextResponse.redirect(
        new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL)
      );

    throw new Error(error?.message);
  } catch {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
