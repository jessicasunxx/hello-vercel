import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Pre-existing Supabase table names
const COMMON_TABLES = ["postgres_table_0", "postgres_table_1", "postgres_table_2", "postgres_table_3"];

async function tryFetchFromTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*").limit(100);
  return { tableName, data, error };
}

export default async function ItemsPage() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Missing Environment Variables</h2>
            <p className="mb-2">Supabase credentials are not configured.</p>
            <div className="mt-4 text-sm space-y-2">
              <p className="font-semibold">To fix this in Vercel:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> = <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">https://qihsgnfjqmkjmoowyfbn.supabase.co</code></li>
                <li>Add <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> with your anon key</li>
                <li>Redeploy your project</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Try each common table name until we find one that works
  let data: any[] | null = null;
  let error: any = null;
  let workingTable = "";
  const errors: Array<{ table: string; error: string }> = [];

  for (const tableName of COMMON_TABLES) {
    const result = await tryFetchFromTable(tableName);
    if (!result.error && result.data) {
      data = result.data;
      workingTable = tableName;
      break;
    }
    if (result.error) {
      errors.push({ table: tableName, error: result.error.message });
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
              <p className="font-semibold">Tried tables:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {errors.map((e, i) => (
                  <li key={i} className="font-mono text-xs">
                    {e.table}: {e.error}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-4">Possible issues:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Environment variables not set in Vercel (check Settings → Environment Variables)</li>
                <li>Table names don&apos;t match - check Supabase Dashboard → Table Editor for actual table names</li>
                <li>Row Level Security (RLS) policies might be blocking access - check Supabase Dashboard → Authentication → Policies</li>
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
