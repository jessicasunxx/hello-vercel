"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useState } from "react";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  const baseClass =
    "rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className ?? baseClass}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
