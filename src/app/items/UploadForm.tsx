"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import {
  generatePresignedUrl,
  uploadImageToPresignedUrl,
  registerImageUrl,
  generateCaptionsForImage,
} from "@/lib/captionApi";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get JWT token from Supabase auth session
  useEffect(() => {
    async function getToken() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
        } else {
          setError("Please sign in to upload images.");
        }
      } catch (err) {
        console.error("Error getting auth token:", err);
        setError("Unable to get authentication token.");
      }
    }
    getToken();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);

    const selected = event.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFile(null);
      setError(
        "Unsupported file type. Please upload a JPEG, PNG, WEBP, GIF, or HEIC image."
      );
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    if (!authToken) {
      setError("Please sign in to upload images.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Step 1: Generate presigned URL
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(
        file.type,
        authToken
      );

      // Step 2: Upload image bytes to presigned URL
      await uploadImageToPresignedUrl(presignedUrl, file);

      // Step 3: Register the uploaded image URL with the pipeline
      const { imageId } = await registerImageUrl(cdnUrl, authToken);

      // Step 4: Generate captions
      const captions = await generateCaptionsForImage(imageId, authToken);

      setSuccessMessage("Image uploaded and captions generated successfully!");

      // Refresh the gallery so the new image + captions appear
      router.refresh();

      console.log("Generated captions:", captions);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading the image."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mb-12 rounded-3xl border border-purple-200/50 dark:border-purple-800/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-violet-50/30 to-fuchsia-50/50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-fuchsia-950/20 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-2">
          Upload a new meme and generate captions
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
          Choose an image to send to the caption pipeline. Once processing
          finishes, the new meme and its captions will appear in the gallery
          below.
        </p>

        <form className="flex flex-col gap-4 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-purple-600 file:to-fuchsia-600 file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:from-purple-700 hover:file:to-fuchsia-700 file:transition-all file:shadow-lg file:shadow-purple-500/30 dark:file:from-purple-500 dark:file:to-fuchsia-500 dark:hover:file:from-purple-400 dark:hover:file:to-fuchsia-400"
          />
          <button
            type="submit"
            disabled={isUploading || !file || !authToken}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 dark:from-purple-500 dark:to-fuchsia-500 dark:hover:from-purple-400 dark:hover:to-fuchsia-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload & Generate Captions"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {successMessage}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Supported formats: JPEG, JPG, PNG, WEBP, GIF, HEIC.
        </p>
      </div>
    </section>
  );
}

