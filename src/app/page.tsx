import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50 text-center">
          Meme gallery
        </h1>
        <p className="mt-4 text-center text-lg text-zinc-600 dark:text-zinc-400">
          Browse memes, vote on captions, and upload your own.
        </p>
        <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-500 max-w-md">
          You need a Google account to open the gallery. When you continue, you
          may briefly leave this site to sign in with Google, then you will come
          back here.
        </p>
        <Link
          href="/items"
          className="mt-8 rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Open meme gallery →
        </Link>
      </main>
    </div>
  );
}
