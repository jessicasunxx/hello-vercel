import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseClient";

async function handleSignOut(request: NextRequest) {
  // Ensure we have the Supabase client wired with cookies
  const { supabase } = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  // Use relative redirect to work in both local and production
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url.origin));

  return response;
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}

