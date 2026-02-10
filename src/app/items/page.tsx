import { getSupabaseServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Class database tables (pre-existing)
const COMMON_TABLES = ["images", "captions", "caption_votes", "profiles"];

// Fetch all images at once - no pagination
const MAX_IMAGES = 1000;

async function checkTableAccessible(supabase: any, tableName: string) {
  const { error } = await supabase.from(tableName).select("*").limit(1);
  return { tableName, error };
}

async function fetchAllImages(supabase: any) {
  // Fetch all images with captions - no pagination
  // The relationship is: captions.image_id -> images.id
  const dataResult = await supabase
    .from("images")
    .select(`
      *,
      captions(*)
    `)
    .order("created_datetime_utc", { ascending: false })
    .limit(MAX_IMAGES);
  
  let allData = dataResult.data as any[] | null;
  const error = dataResult.error;
  
  // Process the captions data
  if (allData) {
    allData = allData.map((image: any) => {
      // Get the first caption
      const caption = Array.isArray(image.captions) && image.captions.length > 0
        ? image.captions[0]
        : null;
      
      // Try different possible column names for caption text
      const captionText = caption?.text 
        || caption?.caption 
        || caption?.caption_text 
        || caption?.content 
        || caption?.body
        || null;
      
      return {
        ...image,
        caption: captionText,
        caption_id: caption?.id || null,
        captions: undefined,
      };
    });
  }
  
  return { data: allData, error };
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

  // Check if images table is accessible
  const imagesCheck = await checkTableAccessible(supabase, "images");
  
  if (imagesCheck.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Error loading data</h2>
            <p className="mb-2 font-mono text-sm">{imagesCheck.error.message}</p>
            <div className="mt-4 text-sm space-y-2">
              <p className="font-semibold">Possible issues:</p>
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

  // Fetch all images with captions
  const result = await fetchAllImages(supabase);
  const data = result.data;
  
  if (result.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="text-xl font-bold mb-2">Error loading images</h2>
            <p className="mb-2 font-mono text-sm">{result.error.message}</p>
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
            Image Gallery
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No images found.
          </p>
        </main>
      </div>
    );
  }

  // Render all images in a grid - no pagination
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900 font-sans">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent mb-3">
            Meme Gallery
          </h1>
          <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="px-3 py-1 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-full font-mono text-xs">
              images
            </span>
            <span className="text-zinc-400">•</span>
            <span className="font-medium">
              {data.length} meme{data.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grid - All memes displayed at once */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((image: any, index: number) => {
            // Get caption text
            const caption = image.caption?.trim() || null;

            return (
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
                      alt={caption || "Meme"}
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
                  {caption ? (
                    <h3
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {caption}
                    </h3>
                  ) : (
                    <h3 className="text-sm font-medium text-zinc-400 dark:text-zinc-500 italic">
                      No caption available
                    </h3>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {image.created_datetime_utc && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(image.created_datetime_utc).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
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
            );
          })}
        </div>
      </main>
    </div>
  );
}
