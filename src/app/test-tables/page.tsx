import { getSupabaseServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

// Common class database table names to try
const COMMON_TABLES = [
  "messages",
  "images",
  "captions",
  "caption_votes",
  "profiles",
];

export default async function TestTablesPage() {
  const { supabase, env, error: envError } = getSupabaseServerClient();

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
          </div>
        </main>
      </div>
    );
  }

  const results = await Promise.allSettled(
    COMMON_TABLES.map(async (tableName) => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);
      return { tableName, data, error };
    })
  );

  const workingTables = results
    .map((result, index) => {
      if (result.status === "fulfilled" && !result.value.error) {
        return {
          tableName: COMMON_TABLES[index],
          rowCount: result.value.data?.length || 0,
        };
      }
      return null;
    })
    .filter((item): item is { tableName: string; rowCount: number } => item !== null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6">
          Available Tables
        </h1>
        {workingTables.length > 0 ? (
          <div className="space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Found {workingTables.length} accessible table{workingTables.length !== 1 ? "s" : ""}:
            </p>
            {workingTables.map(({ tableName, rowCount }) => (
              <div
                key={tableName}
                className="border border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-lg font-mono font-bold text-green-800 dark:text-green-400">
                      {tableName}
                    </code>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      ✓ Accessible
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Use this table name in <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">src/app/items/page.tsx</code>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-400">
              No common table names found. Please check your Supabase Dashboard → Table Editor
              to see what tables exist in your project.
            </p>
          </div>
        )}
        <div className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Once you know your table name, update <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">TABLE_NAME</code> in{" "}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">src/app/items/page.tsx</code>
          </p>
        </div>
      </main>
    </div>
  );
}
