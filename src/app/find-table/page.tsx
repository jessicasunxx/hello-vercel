import { getSupabaseServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function FindTablePage() {
  const { supabase, env, error: envError } = await getSupabaseServerClient();

  if (!supabase || envError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6 py-8">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Supabase not configured</h2>
            <p className="mb-2">{envError}</p>
          </div>
        </main>
      </div>
    );
  }

  const hasMismatch =
    Boolean(env.urlRef) && Boolean(env.keyRef) && env.urlRef !== env.keyRef;

  if (hasMismatch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6 py-8">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Supabase URL / key mismatch</h2>
            <p className="mb-2">
              URL project:{" "}
              <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                {env.urlRef}
              </code>{" "}
              — Key project:{" "}
              <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                {env.keyRef}
              </code>
            </p>
            <p className="text-sm">
              Fix your Vercel env vars so the URL and anon key come from the same Supabase project,
              then redeploy.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Try to query information_schema to get table names
  // Note: This might not work with anon key, but worth trying
  try {
    await supabase.rpc("get_table_names");
  } catch {
    // RPC function not available
  }

  // Also try a direct query to information_schema (usually requires service_role key)
  try {
    await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");
  } catch {
    // Query not available
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6">
          Find Your Table Name
        </h1>
        <div className="space-y-4">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To find your table name:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Go to your Supabase Dashboard</li>
              <li>Click on <strong>Table Editor</strong> in the left sidebar</li>
              <li>Look at the list of tables - you&apos;ll see table names like &quot;todos&quot;, &quot;products&quot;, etc.</li>
              <li>Copy the exact table name (case-sensitive)</li>
              <li>Tell me the table name and I&apos;ll update the code for you</li>
            </ol>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-blue-800 dark:text-blue-400">
              <strong>Quick check:</strong> Common table names in Supabase projects include:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700 dark:text-blue-300">
              <li>todos</li>
              <li>items</li>
              <li>products</li>
              <li>messages</li>
              <li>posts</li>
              <li>notes</li>
              <li>tasks</li>
            </ul>
            <p className="text-sm mt-2 text-blue-600 dark:text-blue-400">
              If your table has a different name, just tell me what it is!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
