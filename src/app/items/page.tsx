import { getSupabaseServerClient } from "@/lib/supabaseClient";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Class database tables (pre-existing)
// If you don't have access to one of these, Supabase will return an RLS/permission error.
const COMMON_TABLES = ["images", "captions", "caption_votes", "profiles"];

const PAGE_SIZE = 24;

function getPage(searchParams: Record<string, string | string[] | undefined> | undefined) {
  const raw = searchParams?.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

async function checkTableAccessible(supabase: any, tableName: string) {
  const { error } = await supabase.from(tableName).select("*").limit(1);
  return { tableName, error };
}

async function fetchTablePage(supabase: any, tableName: string, page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Prefer consistent ordering for images (others may not have created_datetime_utc)
  const query =
    tableName === "images"
      ? supabase
          .from(tableName)
          .select("*")
          .order("created_datetime_utc", { ascending: false })
          .range(from, to)
      : supabase.from(tableName).select("*").range(from, to);

  const { data, error } = await query;
  return { data: (data as any[]) ?? null, error };
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { supabase, env, error: envError } = getSupabaseServerClient();
  const page = getPage(searchParams);

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
    env && Boolean(env.urlRef) && Boolean(env.keyRef) && env.urlRef !== env.keyRef;

  if (hasMismatch && env) {
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
  let error: any = null;
  let workingTable = "";
  const errors: Array<{ table: string; error: string }> = [];

  for (const tableName of COMMON_TABLES) {
    const result = await checkTableAccessible(supabase, tableName);
    if (!result.error) {
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

  const pageResult = await fetchTablePage(supabase, workingTable, page);
  const data = pageResult.data;
  if (pageResult.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Error loading page</h2>
            <p className="mb-2 font-mono text-sm">{pageResult.error.message}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900 font-sans">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent mb-3">
              Image Gallery
            </h1>
            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="px-3 py-1 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-full font-mono text-xs">
                {workingTable}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="font-medium">{data.length} image{data.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span>
              {" "}• showing {data.length} result{data.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/items?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
                  page <= 1
                    ? "pointer-events-none opacity-50 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-white/60 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Prev
              </Link>
              <Link
                href={`/items?page=${page + 1}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
                  data.length < PAGE_SIZE
                    ? "pointer-events-none opacity-50 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-white/60 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Next
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((image: any, index: number) => (
              <div
                key={image.id}
                className="group relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Container */}
                {image.url && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.image_description || "Image"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.is_public && (
                        <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                          Public
                        </span>
                      )}
                      {image.is_common_use && (
                        <span className="px-2.5 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                          Common
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  {image.image_description ? (
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {image.image_description}
                    </h3>
                  ) : (
                    <h3 className="text-sm font-medium text-zinc-400 dark:text-zinc-500 italic">
                      No description available
                    </h3>
                  )}
                  
                  {image.additional_context && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {image.additional_context}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {image.created_datetime_utc && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(image.created_datetime_utc).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                    <div className="flex gap-1.5">
                      {image.is_public && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                      {image.is_common_use && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 pointer-events-none" />
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
          Table: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{workingTable}</code> • Page {page}
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
