import { Review } from "../models/subjectRelated.js";
import { SubjectProfile } from '../models/subject.js';

export async function calculateSubjectProfileRating(subject_profile_id, rate, isNew) {
    try {
        console.debug('[calculateSubjectProfileRating] Starting calculation', {
            subject_profile_id,
            rate,
            isNew,
            timestamp: new Date().toISOString()
        });

        if (!subject_profile_id || typeof isNew !== 'boolean') {
            console.error('[calculateSubjectProfileRating] Invalid parameters', {
                subject_profile_id,
                isNew
            });
            throw new Error('Invalid parameters');
        }

        const MatchSubjectProfile = await SubjectProfile.findById(subject_profile_id);
        if (!MatchSubjectProfile) {
            console.error('[calculateSubjectProfileRating] Subject profile not found', {
                subject_profile_id,
                searchedAt: new Date().toISOString()
            });
            throw new Error('Subject profile not found');
        }

        console.debug('[calculateSubjectProfileRating] Found subject profile', {
            profileId: MatchSubjectProfile._id,
            currentRating: MatchSubjectProfile.rating,
            existingReviews: MatchSubjectProfile.reviews?.length || 0
        });

        const reviewCount = await Review.countDocuments({ subject_profile: subject_profile_id });
        console.debug('[calculateSubjectProfileRating] Review count', {
            totalReviews: reviewCount,
            isNewReview: isNew
        });

        let newRating;
        if (isNew) {
            console.debug('[calculateSubjectProfileRating] Calculating new review addition');
            newRating = reviewCount === 0 
                ? rate 
                : ((MatchSubjectProfile.rating * (reviewCount - 1)) + rate) / reviewCount;
        } else {
            console.debug('[calculateSubjectProfileRating] Calculating review removal');
            newRating = reviewCount === 1 
                ? 0 
                : ((MatchSubjectProfile.rating * (reviewCount + 1)) - rate) / reviewCount;
        }

        if (isNaN(newRating)) {
            console.error('[calculateSubjectProfileRating] Invalid rating calculation', {
                currentRating: MatchSubjectProfile.rating,
                rate,
                reviewCount,
                calculatedRating: newRating
            });
            throw new Error('Invalid rating calculation');
        }

        // Update and save with debug info
        MatchSubjectProfile.rating = newRating;
        await MatchSubjectProfile.save();

        console.log('[calculateSubjectProfileRating] Successfully updated rating', {
            subject_profile_id,
            oldRating: MatchSubjectProfile.rating,
            newRating,
            reviewCount,
            updatedAt: new Date().toISOString()
        });

        return { success: true, newRating };

    } catch (err) {
        console.error('[calculateSubjectProfileRating] Error in rating calculation', {
            error: err.message,
            stack: err.stack,
            subject_profile_id,
            timestamp: new Date().toISOString()
        });
        throw err; 
    }
}