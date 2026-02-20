"use client";

import { useEffect, useState } from "react";
import { submitVote } from "@/lib/voteUtils";
import { useRouter } from "next/navigation";

interface ImageModalProps {
  image: {
    id: string;
    url: string;
    caption: string | null;
    caption_id: string | null;
    created_datetime_utc?: string;
    is_public?: boolean;
    is_common_use?: boolean;
    user_vote?: number | null;
    vote_stats?: {
      upvotes: number;
      downvotes: number;
      total: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onVote?: () => void; // Callback when a vote is submitted
}

export default function ImageModal({ image, isOpen, onClose, onVote }: ImageModalProps) {
  const router = useRouter();
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(image?.user_vote ?? null);
  const [voteStats, setVoteStats] = useState(
    image?.vote_stats ?? { upvotes: 0, downvotes: 0, total: 0 }
  );

  // Update local state when image changes
  useEffect(() => {
    if (image) {
      setUserVote(image.user_vote ?? null);
      setVoteStats(image.vote_stats ?? { upvotes: 0, downvotes: 0, total: 0 });
    }
  }, [image]);

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

  const handleVote = async (vote: 1 | -1) => {
    console.log("handleVote called:", { vote, caption_id: image?.caption_id, userVote, isVoting });
    
    if (!image?.caption_id) {
      console.warn("No caption_id available");
      return;
    }
    
    if (isVoting) {
      console.warn("Already voting, ignoring click");
      return;
    }

    setIsVoting(true);
    try {
      const result = await submitVote(image.caption_id, vote, userVote);
      console.log("Vote result:", result);

      if (result.success) {
        // Update local state optimistically
        const newVote = userVote === vote ? null : vote; // Toggle if same vote
        setUserVote(newVote);

        // Update vote stats
        let newStats = { ...voteStats };
        if (userVote === 1) {
          newStats.upvotes--;
          newStats.total--;
        } else if (userVote === -1) {
          newStats.downvotes--;
          newStats.total++;
        }

        if (newVote === 1) {
          newStats.upvotes++;
          newStats.total++;
        } else if (newVote === -1) {
          newStats.downvotes++;
          newStats.total--;
        }

        setVoteStats(newStats);

        // Notify parent that a vote was submitted (this will trigger refresh)
        if (onVote) {
          onVote();
        }

        // Also refresh here to ensure data is updated
        router.refresh();
      } else {
        console.error("Failed to submit vote:", result.error);
        alert(`Failed to submit vote: ${result.error}`);
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsVoting(false);
    }
  };

  if (!isOpen || !image) return null;

  // Debug log
  console.log("ImageModal render:", { 
    caption_id: image.caption_id, 
    hasCaption: !!image.caption,
    userVote,
    voteStats 
  });

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

          {/* Voting Section */}
          {image.caption_id ? (
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVote(1);
                  }}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    userVote === 1
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Upvote"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span>{voteStats.upvotes}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVote(-1);
                  }}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    userVote === -1
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Downvote"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span>{voteStats.downvotes}</span>
                </button>
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-medium">
                  {voteStats.total > 0 ? "+" : ""}
                  {voteStats.total}
                </span>
                <span className="ml-1">total</span>
              </div>
            </div>
          ) : (
            <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              No caption available for voting
            </div>
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
