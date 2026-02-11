import LoginButton from "./LoginButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;ll be redirected to Google, then back through{" "}
          <span className="font-mono text-xs">secure.almostcrackd.ai</span>, and
          finally to{" "}
          <span className="font-mono text-xs">
            /auth/callback
          </span>{" "}
          in this app.
        </p>
        <div className="mt-6 flex justify-center">
          <LoginButton />
        </div>
      </main>
    </div>
  );
}

