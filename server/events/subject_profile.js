import { Review } from "../models/subjectRelated.js";
import { SubjectProfile } from "../models/subject.js";

export async function calculateSubjectProfileRating(subject_profile_id) {
  try {
    console.debug("[calculateSubjectProfileRating] Starting calculation", {
      subject_profile_id,
      timestamp: new Date().toISOString()
    });

    if (!subject_profile_id) {
      console.error("[calculateSubjectProfileRating] Invalid parameters", {
        subject_profile_id
      });
      throw new Error("Invalid parameters");
    }

    const matchSubjectProfile = await SubjectProfile.findById(subject_profile_id);
    if (!matchSubjectProfile) {
      console.error("[calculateSubjectProfileRating] Subject profile not found", {
        subject_profile_id,
        searchedAt: new Date().toISOString()
      });
      throw new Error("Subject profile not found");
    }

    console.debug("[calculateSubjectProfileRating] Found subject profile", {
      profileId: matchSubjectProfile._id,
      currentRating: matchSubjectProfile.rating
    });

    const approvedReviews = await Review.find({
      subject_profile: subject_profile_id,
      approved: true
    });

    let newRating = 0;
    if (approvedReviews.length > 0) {
      const sum = approvedReviews.reduce((acc, review) => acc + review.Rate, 0);
      newRating = Math.round((sum / approvedReviews.length) * 10) / 10;
    }

    const oldRating = matchSubjectProfile.rating;
    matchSubjectProfile.rating = newRating;
    await matchSubjectProfile.save();

    console.log("[calculateSubjectProfileRating] Successfully updated rating", {
      subject_profile_id,
      oldRating,
      newRating,
      reviewCount: approvedReviews.length,
      updatedAt: new Date().toISOString()
    });

    return { success: true, newRating };
  } catch (err) {
    console.error("[calculateSubjectProfileRating] Error in rating calculation", {
      error: err.message,
      stack: err.stack,
      subject_profile_id,
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}
