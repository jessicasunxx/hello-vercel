import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Common table names to try - update this with your actual table name
const COMMON_TABLES = ["todos", "items", "products", "messages", "posts", "users"];

async function tryFetchFromTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*").limit(100);
  return { tableName, data, error };
}

export default async function ItemsPage() {
  // Try each common table name until we find one that works
  let data: any[] | null = null;
  let error: any = null;
  let workingTable = "";

  for (const tableName of COMMON_TABLES) {
    const result = await tryFetchFromTable(tableName);
    if (!result.error && result.data) {
      data = result.data;
      workingTable = tableName;
      break;
    }
    // If this is the last table and it failed, save the error
    if (tableName === COMMON_TABLES[COMMON_TABLES.length - 1]) {
      error = result.error;
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Error loading data</h2>
            <p className="mb-2 font-mono text-sm">{error.message}</p>
            <div className="mt-4 text-sm space-y-2">
              <p className="font-semibold">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to your Supabase Dashboard → Table Editor</li>
                <li>Find the name of an existing table</li>
                <li>Add that table name to the <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">COMMON_TABLES</code> array in <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">src/app/items/page.tsx</code> (line 6)</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
            Items from Supabase
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No rows found in the table &quot;{workingTable || "selected table"}&quot;.
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            The table exists but is empty.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6">
          Items from Supabase
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Table: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{workingTable}</code>
        </p>
        <div className="space-y-4">
          {data.map((row, index) => (
            <div
              key={row.id || index}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 shadow-sm"
            >
              <pre className="text-sm text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Total: {data.length} row{data.length !== 1 ? "s" : ""}
        </p>
      </main>
    </div>
  );
}
