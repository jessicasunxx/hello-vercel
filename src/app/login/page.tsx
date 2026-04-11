import LoginButton from "./LoginButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with your Google account to open the meme gallery (vote,
          upload, and view captions).
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
          After you tap the button, your browser will go to Google&apos;s sign-in
          page. That is normal—you are not leaving the project permanently.
        </p>
        <div className="mt-6 flex justify-center">
          <LoginButton />
        </div>
      </main>
    </div>
  );
}

