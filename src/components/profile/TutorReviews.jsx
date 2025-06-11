import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const renderStars = (rating, size = 14) => {
  if (typeof rating !== 'number' || !isFinite(rating) || rating < 0) {
    return null; // or return a placeholder, e.g. <span>No rating</span>
  }
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={size} className="fill-secondary text-secondary" />)}
      {halfStar && <Star key="half" size={size} className="fill-secondary text-secondary" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={size} className="text-gray-300 dark:text-gray-600" />)}
    </div>
  );
};

const TutorReviews = ({ tutorId, comments = [], onSubmitReview }) => { // Accept tutorId
    const { t } = useTranslation();
    const { authState } = useAuth();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    
    const canLeaveReview = authState.isLoggedIn && authState.userId !== parseInt(tutorId);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (rating === 0 || !reviewText) return;
        onSubmitReview({ rating, text: reviewText, userId: authState.userId }); // Include userId
        setRating(0);
        setReviewText('');
    };

    return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t('reviewsTitle')}</CardTitle>
                <CardDescription>{t('reviewsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment Form */}
                {canLeaveReview && (
                  <form onSubmit={handleFormSubmit} className="mb-6 border p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-3 text-base">{t('leaveReview')}</h4>
                    <div className="space-y-3">
                        {/* Interactive Star Rating Input */}
                        <div>
                          <Label className="text-sm">{t('rating')}</Label>
                          <div
                              className="flex items-center mt-1 space-x-1 rtl:space-x-reverse"
                              onMouseLeave={() => setHoverRating(0)}
                            >
                            {[1, 2, 3, 4, 5].map(starValue => (
                              <Button
                                type="button"
                                key={starValue}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-secondary"
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                              >
                                <Star
                                    size={18}
                                    className={cn(
                                      "transition-colors",
                                      (hoverRating >= starValue || rating >= starValue) ? 'fill-secondary text-secondary' : ''
                                    )}
                                  />
                              </Button>
                            ))}
                          </div>
                            <input type="hidden" value={rating} required />
                            {rating === 0 && <p className="text-xs text-destructive mt-1">{t('ratingRequired')}</p>}
                        </div>
                        <div>
                          <Label htmlFor="review-text" className="text-sm">{t('yourReview')}</Label>
                          <Textarea
                              id="review-text"
                              placeholder={t('reviewPlaceholder')}
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              rows={3}
                              required
                              className="mt-1 text-sm"
                          />
                        </div>
                      <Button type="submit" size="sm" className="w-full">{t('submitReview')}</Button>
                    </div>
                  </form>
                )}

                {/* Existing Comments */}
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{comment.user}</span>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {typeof comment.rating === 'number' && isFinite(comment.rating)
                          ? renderStars(comment.rating, 14)
                          : t('noRating')}
                      </div>
                      <p className="text-sm text-foreground/90">{comment.text}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center text-sm py-4">{t('noReviewsYet')}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
    );
};

export default TutorReviews;
