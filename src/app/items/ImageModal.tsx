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
  const [voteSavedFlash, setVoteSavedFlash] = useState(false);
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

  useEffect(() => {
    if (!voteSavedFlash) return;
    const t = window.setTimeout(() => setVoteSavedFlash(false), 2500);
    return () => window.clearTimeout(t);
  }, [voteSavedFlash]);

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
        setVoteSavedFlash(true);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col border border-zinc-700/50 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-md text-zinc-100 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ring-2 ring-zinc-700/50"
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
        <div className="relative w-full flex-1 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 min-h-0">
          <img
            src={image.url}
            alt={image.caption || "Full size image"}
            className="max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Caption and Info */}
        <div className="p-8 border-t border-zinc-700/50 bg-gradient-to-b from-zinc-900/95 to-zinc-900/90">
          {image.caption ? (
            <p className="text-xl font-bold text-zinc-100 mb-6 leading-relaxed bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              {image.caption}
            </p>
          ) : (
            <p className="text-xl font-medium text-zinc-500 italic mb-6">
              No caption available
            </p>
          )}

          {/* Voting Section */}
          {image.caption_id ? (
            <div className="mb-6 space-y-3">
              <p className="text-sm text-zinc-400">
                Rank this caption: upvote or downvote. Your choice saves
                automatically—you can close this window and your vote stays.
              </p>
              <div
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {voteSavedFlash ? "Vote saved." : ""}
              </div>
              {voteSavedFlash && (
                <p
                  className="text-sm font-semibold text-emerald-400"
                  aria-hidden="true"
                >
                  Vote saved
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleVote(1);
                  }}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    userVote === 1
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-sm"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    userVote === -1
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 ring-2 ring-red-400/50"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-sm"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
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
              <div className="text-sm font-bold text-zinc-300 bg-zinc-800 px-4 py-2 rounded-xl">
                <span className="text-zinc-100">
                  {voteStats.total > 0 ? "+" : ""}
                  {voteStats.total}
                </span>
                <span className="ml-2 text-zinc-400 font-normal">total</span>
              </div>
            </div>
            </div>
          ) : (
            <div className="mb-6 text-sm text-zinc-500 font-medium">
              No caption available for voting
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
            <div className="flex items-center gap-4">
              {image.created_datetime_utc && (
                <span className="text-sm font-medium text-zinc-400">
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
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-700">
                  Public
                </span>
              )}
              {image.is_common_use && (
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-700">
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
