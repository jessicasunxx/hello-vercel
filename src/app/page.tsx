import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          Hello, World!
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Deployed on Vercel 🚀
        </p>
        <Link
          href="/items"
          className="mt-8 rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          View Supabase Data →
        </Link>
      </main>
    </div>
  );
}
