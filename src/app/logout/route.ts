import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabaseClient";

export async function POST() {
  const cookieStore = cookies();

  // Ensure we have the Supabase client wired with cookies
  const { supabase } = getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  // Also clear the auth cookie explicitly to be safe
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));

  return response;
}

