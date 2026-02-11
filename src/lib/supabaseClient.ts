import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type SupabaseEnv = {
  url: string;
  anonKey: string;
  urlRef: string | null;
  keyRef: string | null;
  source: {
    url: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_URL";
    anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_ANON_KEY";
  };
};

function getUrlRef(url: string): string | null {
  try {
    const hostname = new URL(url).hostname; // e.g. qihsgnfjqmkjmoowyfbn.supabase.co
    return hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

function base64UrlDecodeToJson<T>(input: string): T | null {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(base64 + pad, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function getKeyRef(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payload = base64UrlDecodeToJson<{ ref?: string }>(parts[1]!);
  return payload?.ref ?? null;
}

export function getSupabaseEnv(): { env: SupabaseEnv | null; error: string | null } {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    "";

  if (!url || !anonKey) {
    return {
      env: null,
      error:
        "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel (or SUPABASE_URL / SUPABASE_ANON_KEY on the server).",
    };
  }

  const sourceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "NEXT_PUBLIC_SUPABASE_URL"
    : "SUPABASE_URL";
  const sourceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    : "SUPABASE_ANON_KEY";

  return {
    env: {
      url,
      anonKey,
      urlRef: getUrlRef(url),
      keyRef: getKeyRef(anonKey),
      source: { url: sourceUrl, anonKey: sourceKey },
    },
    error: null,
  };
}

export async function getSupabaseServerClient() {
  const { env, error } = getSupabaseEnv();
  if (!env) return { supabase: null, env: null, error };

  const cookieStore = await cookies();

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });

  return { supabase, env, error: null };
}
