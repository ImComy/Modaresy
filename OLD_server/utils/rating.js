import mongoose from 'mongoose';

export async function calculateSubjectProfileRating(profileId) {
  const Review = mongoose.model('Review');
  const SubjectProfile = mongoose.model('SubjectProfile');

  const reviews = await Review.find({ subject_profile: profileId });

  const ratingSum = reviews.reduce((sum, r) => sum + (r.Rate || 0), 0);
  const average = reviews.length > 0 ? ratingSum / reviews.length : 0;

  await SubjectProfile.findByIdAndUpdate(profileId, { rating: average });
  return average;
}
