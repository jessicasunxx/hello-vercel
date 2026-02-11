import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseClient";

export async function POST() {
  // Ensure we have the Supabase client wired with cookies
  const { supabase } = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  );

  return response;
}

