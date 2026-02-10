"use client";

import { useEffect } from "react";

interface ImageModalProps {
  image: {
    id: string;
    url: string;
    caption: string | null;
    created_datetime_utc?: string;
    is_public?: boolean;
    is_common_use?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 min-h-0">
          <img
            src={image.url}
            alt={image.caption || "Full size image"}
            className="max-h-[70vh] w-auto h-auto object-contain"
          />
        </div>

        {/* Caption and Info */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {image.caption ? (
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              {image.caption}
            </p>
          ) : (
            <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500 italic mb-4">
              No caption available
            </p>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              {image.created_datetime_utc && (
                <span>
                  {new Date(image.created_datetime_utc).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {image.is_public && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                  Public
                </span>
              )}
              {image.is_common_use && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                  Common
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
