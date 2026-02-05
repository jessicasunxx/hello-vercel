import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function FindTablePage() {
  // Try to query information_schema to get table names
  // Note: This might not work with anon key, but worth trying
  const { data: schemaData, error: schemaError } = await supabase
    .rpc("get_table_names")
    .catch(() => ({ data: null, error: { message: "RPC function not available" } }));

  // Also try a direct query to information_schema (usually requires service_role key)
  const { data: tablesData } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .catch(() => ({ data: null }));

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
