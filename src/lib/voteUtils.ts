"use client";

import { getSupabaseBrowserClient } from "./supabaseBrowser";

/**
 * Submits a vote for a caption. If the user has already voted, it updates the vote.
 * If not, it inserts a new vote.
 * 
 * @param captionId - The ID of the caption being voted on
 * @param vote - The vote value: 1 for upvote, -1 for downvote
 * @returns Promise with success status and error if any
 */
export async function submitVote(
  captionId: string,
  vote: 1 | -1,
  currentVote: number | null = null
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "You must be logged in to vote",
      };
    }

    // If clicking the same vote button, remove the vote (delete the row)
    if (currentVote === vote) {
      const { error: deleteError } = await supabase
        .from("caption_votes")
        .delete()
        .eq("profile_id", user.id)
        .eq("caption_id", captionId);

      if (deleteError) {
        console.error("Error removing vote:", deleteError);
        return {
          success: false,
          error: deleteError.message || "Failed to remove vote",
        };
      }

      return { success: true, error: null };
    }

    // Otherwise, upsert the vote (insert or update if exists)
    // The unique constraint on (profile_id, caption_id) ensures only one vote per user per caption
    const { error: voteError } = await supabase
      .from("caption_votes")
      .upsert(
        {
          profile_id: user.id,
          caption_id: captionId,
          vote: vote,
        },
        {
          onConflict: "profile_id,caption_id",
        }
      );

    if (voteError) {
      console.error("Error submitting vote:", voteError);
      return {
        success: false,
        error: voteError.message || "Failed to submit vote",
      };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error submitting vote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
