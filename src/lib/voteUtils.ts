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
    console.log("submitVote called:", { captionId, vote, currentVote });
    const supabase = getSupabaseBrowserClient();
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("User check:", { user: user?.id, userError });

    if (userError || !user) {
      console.error("User not authenticated:", userError);
      return {
        success: false,
        error: "You must be logged in to vote",
      };
    }

    // If clicking the same vote button, remove the vote (delete the row)
    if (currentVote === vote) {
      console.log("Removing vote (same button clicked)");
      // Try to find the vote column name first
      const { data: existingVote } = await supabase
        .from("caption_votes")
        .select("*")
        .eq("profile_id", user.id)
        .eq("caption_id", captionId)
        .limit(1)
        .single();
      
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

      console.log("Vote removed successfully");
      return { success: true, error: null };
    }

    // Otherwise, upsert the vote (insert or update if exists)
    // The unique constraint on (profile_id, caption_id) ensures only one vote per user per caption
    console.log("Upserting vote:", { profile_id: user.id, caption_id: captionId, vote });
    
    // First, try to get ANY row from the table to detect the column name
    let voteColumnName = 'vote';
    const { data: anyRow, error: schemaError } = await supabase
      .from("caption_votes")
      .select("*")
      .limit(1)
      .maybeSingle();
    
    console.log("Any row from caption_votes:", anyRow);
    console.log("Schema error (if any):", schemaError);
    
    if (anyRow && Object.keys(anyRow).length > 0) {
      // Find the vote column by excluding known columns
      const possibleColumns = Object.keys(anyRow).filter(key => 
        key !== 'caption_id' && 
        key !== 'profile_id' && 
        key !== 'id' &&
        key !== 'created_at' &&
        key !== 'updated_at' &&
        typeof anyRow[key] === 'number' // Vote should be a number
      );
      
      if (possibleColumns.length > 0) {
        voteColumnName = possibleColumns[0];
        console.log("Detected vote column name:", voteColumnName);
      } else {
        console.log("Available columns:", Object.keys(anyRow));
      }
    }
    
    // Try the detected column name first, then common variations
    const columnNamesToTry = [voteColumnName, 'vote', 'votes', 'value', 'rating'];
    const uniqueColumnNames = [...new Set(columnNamesToTry)]; // Remove duplicates
    let lastError: any = null;
    
    for (const columnName of uniqueColumnNames) {
      console.log(`Trying column name: ${columnName}`);
      const votePayload: any = {
        profile_id: user.id,
        caption_id: captionId,
      };
      votePayload[columnName] = vote;
      
      const { error: voteError, data } = await supabase
        .from("caption_votes")
        .upsert(
          votePayload,
          {
            onConflict: "profile_id,caption_id",
          }
        )
        .select();
      
      if (!voteError) {
        console.log(`Success with column name: ${columnName}`);
        return { success: true, error: null };
      }
      
      lastError = voteError;
      console.log(`Failed with column name ${columnName}:`, voteError.message);
      
      // If the error is NOT about the column name, stop trying
      if (!voteError.message.includes('column') && !voteError.message.includes('schema cache')) {
        break;
      }
    }
    
    // If we get here, all column names failed
    const voteError = lastError;
    const data = null;

    console.log("Upsert result:", { voteError, data });

    if (voteError) {
      console.error("Error submitting vote:", voteError);
      const errorMessage = voteError.message || "Failed to submit vote";
      
      // Provide helpful error message if it's a column name issue
      if (errorMessage.includes('column') || errorMessage.includes('schema cache')) {
        return {
          success: false,
          error: `${errorMessage}. Please check your Supabase dashboard → Table Editor → caption_votes table to see what the vote column is actually named. Common names: 'vote', 'votes', 'value', 'rating'.`,
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log("Vote submitted successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error submitting vote:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
