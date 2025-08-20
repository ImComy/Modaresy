import { Review } from "../models/subjectRelated.js";
import { SubjectProfile } from "../models/subject.js";
import { Teacher } from "../models/teacher.js";

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

export const calculateProfileRating = async (profileId, session = null) => {
  const query = Review.find({ subject_profile: profileId }).select('Rate');
  if (session) query.session(session);
  const reviews = await query.lean();

  const numericRates = (reviews || [])
    .map((r) => Number(r?.Rate))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (!numericRates.length) return null;

  const total = numericRates.reduce((s, v) => s + v, 0);
  return parseFloat((total / numericRates.length).toFixed(1));
};

export const calculateTeacherRating = async (teacherId, session = null) => {
  const q = SubjectProfile.find({ teacher_id: teacherId }).select('_id');
  if (session) q.session(session);
  const profiles = await q.lean();

  const ratings = await Promise.all(
    (profiles || []).map((p) => calculateProfileRating(p._id, session))
  );

  const validRatings = ratings.filter((r) => typeof r === 'number' && Number.isFinite(r) && r > 0);

  if (!validRatings.length) return 0;
  const sum = validRatings.reduce((a, b) => a + b, 0);
  return parseFloat((sum / validRatings.length).toFixed(1));
};

export const updateRatingsForProfile = async (profileId, session = null) => {
  const profileRating = await calculateProfileRating(profileId, session);
  const finalProfileRating = profileRating === null ? 0 : profileRating;

  const profile = await SubjectProfile.findByIdAndUpdate(
    profileId,
    { rating: finalProfileRating },
    { new: true, session }
  ).lean();

  if (profile && profile.teacher_id) {
    const teacherRating = await calculateTeacherRating(profile.teacher_id, session);
    await Teacher.findByIdAndUpdate(profile.teacher_id, { rating: teacherRating }, { session });
  }

  return { profileRating: finalProfileRating };
};
