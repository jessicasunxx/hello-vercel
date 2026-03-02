"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Step 1: Generate presigned URL
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(file.type);

      // Step 2: Upload image bytes to presigned URL
      await uploadImageToPresignedUrl(presignedUrl, file);

      // Step 3: Register the uploaded image URL with the pipeline
      const { imageId } = await registerImageUrl(cdnUrl);

      // Step 4: Generate captions
      const captions = await generateCaptionsForImage(imageId);

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
    <section className="mb-10 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Upload a new meme and generate captions
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Choose an image to send to the caption pipeline. Once processing
        finishes, the new meme and its captions will appear in the gallery
        below.
      </p>

      <form className="flex flex-col gap-4 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
        <input
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-zinc-700 dark:file:bg-white dark:file:text-black dark:hover:file:bg-zinc-200"
        />
        <button
          type="submit"
          disabled={isUploading || !file}
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isUploading ? "Uploading..." : "Upload & Generate Captions"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {successMessage && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
          {successMessage}
        </p>
      )}

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
        Supported formats: JPEG, JPG, PNG, WEBP, GIF, HEIC.
      </p>
    </section>
  );
}

