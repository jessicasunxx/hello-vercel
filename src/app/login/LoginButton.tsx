"use client";

import { useCallback, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Unable to start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isLoading ? "Redirecting to Google..." : "Sign in with Google"}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 text-center max-w-xs">
          {error}
        </p>
      )}
    </div>
  );
}

