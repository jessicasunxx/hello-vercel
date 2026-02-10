import { getSupabaseServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Class database tables (pre-existing)
// If you don't have access to one of these, Supabase will return an RLS/permission error.
const COMMON_TABLES = ["images", "captions", "caption_votes", "profiles"];

async function tryFetchFromTable(supabase: any, tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*").limit(100);
  return { tableName, data, error };
}

export default async function ItemsPage() {
  const { supabase, env, error: envError } = getSupabaseServerClient();

  if (!supabase || envError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Supabase not configured</h2>
            <p className="mb-2">{envError}</p>
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

  const hasMismatch =
    Boolean(env.urlRef) && Boolean(env.keyRef) && env.urlRef !== env.keyRef;

  if (hasMismatch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Supabase URL / key mismatch</h2>
            <p className="mb-3">
              Your Supabase URL points to project{" "}
              <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                {env.urlRef}
              </code>{" "}
              but your anon key belongs to project{" "}
              <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                {env.keyRef}
              </code>
              .
            </p>
            <div className="text-sm space-y-2">
              <p className="font-semibold">Fix in Vercel:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  In Vercel env vars, delete old <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">SUPABASE_URL</code> /{" "}
                  <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">SUPABASE_ANON_KEY</code> (or make sure they match).
                </li>
                <li>
                  Set <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">{env.source.url}</code> and{" "}
                  <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">{env.source.anonKey}</code> from the <strong>same</strong> Supabase project.
                </li>
                <li>Redeploy.</li>
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
    const result = await tryFetchFromTable(supabase, tableName);
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

  // Render images table with a nicer display
  if (workingTable === "images") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-6xl px-6 py-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-2">
            Images from Supabase
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Table: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{workingTable}</code> • {data.length} image{data.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((image: any) => (
              <div
                key={image.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow"
              >
                {image.url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.image_description || "Image"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {image.image_description && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      {image.image_description}
                    </p>
                  )}
                  {image.additional_context && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {image.additional_context}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {image.is_public && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                        Public
                      </span>
                    )}
                    {image.is_common_use && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        Common Use
                      </span>
                    )}
                  </div>
                  {image.created_datetime_utc && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Created: {new Date(image.created_datetime_utc).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Render other tables in a clean card format
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
