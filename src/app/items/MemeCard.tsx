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
        className="group relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-zinc-800/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer transform-gpu"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        
        {/* Image Container */}
        {image.url && (
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.caption || "Meme"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges Overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              {image.is_public && (
                <span className="px-3 py-1.5 bg-emerald-500/95 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg ring-2 ring-emerald-400/50">
                  Public
                </span>
              )}
              {image.is_common_use && (
                <span className="px-3 py-1.5 bg-blue-500/95 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg ring-2 ring-blue-400/50">
                  Common
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 bg-gradient-to-b from-zinc-900/95 to-zinc-900/90">
          {image.caption ? (
            <h3
              className="text-sm font-bold text-zinc-100 leading-relaxed group-hover:text-white transition-colors duration-300"
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
            <h3 className="text-sm font-medium text-zinc-500 italic">
              No caption available
            </h3>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
            {image.created_datetime_utc && (
              <span className="text-xs font-medium text-zinc-400">
                {new Date(image.created_datetime_utc).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <div className="flex gap-2">
              {image.is_public && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
              )}
              {image.is_common_use && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
              )}
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-zinc-600/0 via-zinc-500/0 to-zinc-600/0 group-hover:from-zinc-600/10 group-hover:via-zinc-500/10 group-hover:to-zinc-600/10 transition-all duration-700 pointer-events-none blur-xl" />
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
