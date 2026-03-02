import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import MemeCard from "./MemeCard";
import SignOutButton from "./SignOutButton";
import UploadForm from "./UploadForm";

export const dynamic = "force-dynamic"; // Ensures fresh data on each request

// Class database tables (pre-existing)
const COMMON_TABLES = ["images", "captions", "caption_votes", "profiles"];

// Fetch all images at once - no pagination
const MAX_IMAGES = 1000;

async function checkTableAccessible(supabase: any, tableName: string) {
  const { error } = await supabase.from(tableName).select("*").limit(1);
  return { tableName, error };
}

async function fetchAllImages(supabase: any, userId: string | null) {
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
  
  // Debug: Analyze caption data
  if (allData) {
    const captionStats = {
      totalImages: allData.length,
      imagesWithAnyCaptions: 0,
      imagesWithPublicCaptions: 0,
      imagesWithPublicContent: 0,
      totalCaptions: 0,
      publicCaptions: 0,
      captionsWithContent: 0,
      publicCaptionsWithContent: 0,
    };
    
    allData.forEach((image: any) => {
      if (Array.isArray(image.captions) && image.captions.length > 0) {
        captionStats.imagesWithAnyCaptions++;
        captionStats.totalCaptions += image.captions.length;
        
        const hasPublic = image.captions.some((c: any) => c.is_public === true);
        const hasPublicWithContent = image.captions.some((c: any) => 
          c.is_public === true && c.content && c.content.trim() !== ''
        );
        
        if (hasPublic) captionStats.imagesWithPublicCaptions++;
        if (hasPublicWithContent) captionStats.imagesWithPublicContent++;
        
        image.captions.forEach((c: any) => {
          if (c.is_public === true) captionStats.publicCaptions++;
          if (c.content && c.content.trim() !== '') captionStats.captionsWithContent++;
          if (c.is_public === true && c.content && c.content.trim() !== '') {
            captionStats.publicCaptionsWithContent++;
          }
        });
      }
    });
    
    console.log("Caption Statistics:", captionStats);
    
    // Log a few sample images to see what's happening
    const samplesWithoutCaptions = allData
      .filter((img: any) => !Array.isArray(img.captions) || img.captions.length === 0)
      .slice(0, 3);
    if (samplesWithoutCaptions.length > 0) {
      console.log("Sample images without captions:", samplesWithoutCaptions.map((img: any) => ({
        id: img.id,
        url: img.url?.substring(0, 50),
        hasCaptionsArray: Array.isArray(img.captions),
        captionsLength: img.captions?.length || 0,
      })));
    }
    
    const samplesWithCaptions = allData
      .filter((img: any) => Array.isArray(img.captions) && img.captions.length > 0)
      .slice(0, 3);
    if (samplesWithCaptions.length > 0) {
      console.log("Sample images with captions:", samplesWithCaptions.map((img: any) => ({
        id: img.id,
        captionCount: img.captions.length,
        captions: img.captions.map((c: any) => ({
          id: c.id,
          is_public: c.is_public,
          hasContent: !!c.content,
          contentLength: c.content?.length || 0,
        })),
      })));
    }
  }
  
  // Process the captions data
  if (allData) {
    // Get all caption IDs (from all captions for voting)
    const captionIds = allData
      .flatMap((image: any) => {
        if (Array.isArray(image.captions) && image.captions.length > 0) {
          return image.captions
            .map((c: any) => c?.id)
            .filter((id: any) => id != null);
        }
        return [];
      });
    
    // Fetch user's votes for all captions (if authenticated)
    let userVotes: Record<string, number> = {};
    if (userId && captionIds.length > 0) {
      // Try to get all columns to find the vote column name
      const votesResult = await supabase
        .from("caption_votes")
        .select("*")
        .eq("profile_id", userId)
        .in("caption_id", captionIds);
      
      if (votesResult.data && votesResult.data.length > 0) {
        // Column name is 'vote_value' according to the schema
        votesResult.data.forEach((vote: any) => {
          if (vote.vote_value !== undefined) {
            userVotes[vote.caption_id] = vote.vote_value;
          }
        });
      }
    }
    
    // Fetch vote counts for all captions
    let voteCounts: Record<string, { upvotes: number; downvotes: number; total: number }> = {};
    if (captionIds.length > 0) {
      const countsResult = await supabase
        .from("caption_votes")
        .select("*")
        .in("caption_id", captionIds);
      
      if (countsResult.data && countsResult.data.length > 0) {
        // Column name is 'vote_value' according to the schema
        countsResult.data.forEach((vote: any) => {
          const voteValue = vote.vote_value;
          if (voteValue !== undefined) {
            if (!voteCounts[vote.caption_id]) {
              voteCounts[vote.caption_id] = { upvotes: 0, downvotes: 0, total: 0 };
            }
            if (voteValue === 1) {
              voteCounts[vote.caption_id].upvotes++;
            } else if (voteValue === -1) {
              voteCounts[vote.caption_id].downvotes++;
            }
            voteCounts[vote.caption_id].total += voteValue;
          }
        });
      }
    }
    
    allData = allData.map((image: any) => {
      // Get the first caption (for voting - we need caption_id)
      let caption = null;
      if (Array.isArray(image.captions) && image.captions.length > 0) {
        // Prefer any caption that actually has content, fall back to the first caption
        const captionWithContent = image.captions.find(
          (c: any) => c.content && c.content.trim() !== ""
        );
        caption = captionWithContent || image.captions[0];
      }
      
      // The caption text column is 'content' according to the schema.
      // For the gallery, we only care that there is non-empty text, regardless of is_public.
      const captionText =
        caption && caption.content && caption.content.trim() !== ""
          ? caption.content.trim()
          : null;
      
      const captionId = caption?.id || null;
      const userVote = captionId ? userVotes[captionId] || null : null;
      const voteStats = captionId ? voteCounts[captionId] || { upvotes: 0, downvotes: 0, total: 0 } : { upvotes: 0, downvotes: 0, total: 0 };
      
      return {
        ...image,
        caption: captionText,
        caption_id: captionId,
        user_vote: userVote,
        vote_stats: voteStats,
        captions: undefined,
      };
    });

    // Only keep images that have both a URL and a non-empty caption (prompt).
    allData = allData.filter(
      (image: any) =>
        typeof image.url === "string" &&
        image.url.trim() !== "" &&
        typeof image.caption === "string" &&
        image.caption.trim() !== ""
    );
  }
  
  return { data: allData, error };
}

export default async function ItemsPage() {
  const { supabase, env, error: envError } = await getSupabaseServerClient();

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

  // Check authentication status; this route is now protected.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="w-full max-w-3xl px-6 text-center space-y-6">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Meme Gallery is protected
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Please sign in with Google to view and interact with the meme
            gallery.
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Continue to sign in
            </Link>
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

  // Fetch all images with captions (filtered to image+prompt pairs)
  const result = await fetchAllImages(supabase, user.id);
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 font-sans relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zinc-800/30 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-700/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-zinc-800/20 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-clip-text text-transparent mb-4 tracking-tight">
            Meme Gallery
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="px-4 py-1.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-full font-mono text-xs font-semibold text-zinc-300 shadow-sm">
              images
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-semibold text-zinc-200">
              {data.length} meme{data.length !== 1 ? "s" : ""}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">
              Signed in as {user.email}
            </span>
            <div className="ml-auto">
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Upload form */}
        <UploadForm />

        {/* Grid - All memes displayed at once */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((image: any, index: number) => (
            <MemeCard key={image.id} image={image} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
