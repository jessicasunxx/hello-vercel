"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageModal from "./ImageModal";

interface MemeCardProps {
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
  };
  index: number;
}

export default function MemeCard({ image, index }: MemeCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVote = () => {
    // Refresh the page data when a vote is submitted
    router.refresh();
  };

  return (
    <>
      <div
        className="group relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        {image.url && (
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.caption || "Meme"}
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
          {image.caption ? (
            <h3
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {image.caption}
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

      {/* Modal */}
      <ImageModal
        image={image}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVote={handleVote}
      />
    </>
  );
}
