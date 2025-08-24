import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '@/api/apiService';

const renderStars = (rating, size = 14) => {
  if (typeof rating !== 'number' || !isFinite(rating) || rating < 0) return null;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-secondary text-secondary" />
      ))}
      {halfStar && (
        <Star 
          key="half" 
          size={size} 
          className="fill-secondary text-secondary" 
          style={{ clipPath: 'inset(0 50% 0 0)' }} 
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300 dark:text-gray-600" />
      ))}
    </div>
  );
};

const TutorReviews = ({ tutorId, subjectProfile, onReviewUpdate }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [localReviews, setLocalReviews] = useState([]);

  useEffect(() => {
    if (subjectProfile?.reviews) {
      setLocalReviews([...subjectProfile.reviews]);
    } else {
      setLocalReviews([]);
    }
  }, [subjectProfile]);

  const getReviewUserId = (review) => {
    if (!review || review.User_ID == null) return null;
    try {
      return review.User_ID && review.User_ID._id ? String(review.User_ID._id) : String(review.User_ID);
    } catch (e) {
      return String(review.User_ID);
    }
  };

  const isStudent = authState.isLoggedIn && String(authState.userRole || '').toLowerCase() === 'student';
  const canLeaveReview = isStudent && String(authState.userId) !== String(tutorId);
  const userReview = localReviews.find(review => {
    const uid = getReviewUserId(review);
    return uid && uid === String(authState.userId);
  });

  const getProfileIdValue = () => subjectProfile?.profileId || subjectProfile?._id || null;

  const handleFormSubmit = async () => {
    const profileIdValue = getProfileIdValue();
    const payloadRating = rating;
    const payloadComment = reviewText.trim();

    if (payloadRating === 0 || !payloadComment || !profileIdValue) {
      toast({ 
        title: t('reviewFailed'), 
        description: 'Missing rating, comment, or profile ID', 
        variant: 'destructive' 
      });
      return;
    }

    if (userReview) {
      toast({ 
        title: t('alreadyReviewed'), 
        description: t('youAlreadyReviewedThis'), 
        variant: 'destructive' 
      });
      return;
    }

    const tempReviewId = `temp-${Date.now()}`;
    const optimisticReview = {
      _id: tempReviewId,
      User_ID: { _id: authState.userId, name: authState.userData?.name || 'You' },
      Rate: payloadRating,
      Comment: payloadComment,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setLocalReviews(prev => [...prev, optimisticReview]);
    setRating(0);
    setReviewText('');

    try {
      const response = await apiFetch('/subjects/reviews', {
        method: 'POST',
        body: JSON.stringify({
          profileId: profileIdValue,
          rating: payloadRating,
          comment: payloadComment
        })
      });
      
      const normalized = normalizeReviewResponse(response);
      setLocalReviews(prev => prev.map(r => r._id === tempReviewId ? normalized : r));
      
      if (onReviewUpdate) onReviewUpdate();
      
      toast({ 
        title: t('reviewPosted'), 
        description: t('thankYouForReview'), 
        variant: 'default' 
      });
    } catch (error) {
      setLocalReviews(prev => prev.filter(r => !r.isOptimistic));
      toast({ 
        title: t('reviewFailed'), 
        description: error.message || String(error), 
        variant: 'destructive' 
      });
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review._id);
    setEditRating(typeof review.Rate === 'number' ? review.Rate : (review.Rate ?? review.rating ?? 0));
    setEditText(review.Comment ?? review.comment ?? '');
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText('');
  };

  const handleEditSubmit = async (reviewId) => {
    if (editRating === 0 || !editText.trim()) {
      toast({ 
        title: t('updateFailed'), 
        description: 'Rating and comment are required', 
        variant: 'destructive' 
      });
      return;
    }
    
    const profileIdValue = getProfileIdValue();
    if (!profileIdValue) {
      toast({ 
        title: t('updateFailed'), 
        description: 'Profile ID is missing', 
        variant: 'destructive' 
      });
      return;
    }

    const payloadRating = editRating;
    const payloadComment = editText.trim();
    const previous = localReviews.find(r => r._id === reviewId);

    setLocalReviews(prev => prev.map(r => 
      r._id === reviewId ? { ...r, Rate: payloadRating, Comment: payloadComment, isOptimistic: true } : r
    ));
    setEditingReviewId(null);

    try {
      const response = await apiFetch(`/subjects/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          rating: payloadRating, 
          comment: payloadComment, 
          profileId: profileIdValue 
        })
      });
      
      const normalized = normalizeReviewResponse(response);
      setLocalReviews(prev => prev.map(r => r._id === reviewId ? normalized : r));
      
      if (onReviewUpdate) onReviewUpdate();
      
      toast({ 
        title: t('reviewUpdated'), 
        description: t('yourReviewWasUpdated'), 
        variant: 'default' 
      });
    } catch (error) {
      if (previous) setLocalReviews(prev => prev.map(r => r._id === reviewId ? previous : r));
      toast({ 
        title: t('updateFailed'), 
        description: error.message || String(error), 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm(t('confirmDeleteReview'))) return;
    
    const profileIdValue = getProfileIdValue();
    const idx = localReviews.findIndex(r => r._id === reviewId);
    const reviewToDelete = idx >= 0 ? localReviews[idx] : null;
    
    setLocalReviews(prev => prev.filter(r => r._id !== reviewId));

    try {
      await apiFetch(`/subjects/reviews/${reviewId}`, {
        method: 'DELETE',
        body: JSON.stringify({ profileId: profileIdValue })
      });
      
      if (onReviewUpdate) onReviewUpdate();
      
      toast({ 
        title: t('reviewDeleted'), 
        description: t('yourReviewWasDeleted'), 
        variant: 'default' 
      });
    } catch (error) {
      if (reviewToDelete) {
        setLocalReviews(prev => {
          const next = [...prev];
          next.splice(Math.min(idx, next.length), 0, reviewToDelete);
          return next;
        });
      }
      
      toast({ 
        title: t('deleteFailed'), 
        description: error.message || String(error), 
        variant: 'destructive' 
      });
    }
  };

  function normalizeReviewResponse(resp) {
    if (!resp) return resp;
    
    try {
      const r = { ...resp };
      r._id = r._id || r.id || r._id;
      r.Rate = typeof r.Rate === 'number' ? r.Rate : (typeof r.rating === 'number' ? r.rating : Number(r.Rate || r.rating) || 0);
      r.Comment = r.Comment ?? r.comment ?? '';
      
      if (r.User_ID && typeof r.User_ID === 'string') {
        r.User_ID = { _id: r.User_ID };
      }
      
      return r;
    } catch (e) {
      return resp;
    }
  }

  if (!subjectProfile) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center text-muted-foreground">
          {t('noSubjectsAvailable')}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.5 }}>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('reviewsTitle')}</CardTitle>
          <CardDescription>
            {t('reviewsDesc')} 
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {(canLeaveReview && !userReview) && (
              <div className="mb-6 border p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-3 text-base">{t('leaveReview')}</h4>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">{t('rating')} *</Label>
                    <div className="flex items-center mt-1 space-x-1 rtl:space-x-reverse" onMouseLeave={() => setHoverRating(0)}>
                      {[1,2,3,4,5].map(v => (
                        <Button 
                          key={v} 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-secondary" 
                          onClick={() => setRating(v)} 
                          onMouseEnter={() => setHoverRating(v)}
                        >
                          <Star 
                            size={18} 
                            className={cn("transition-colors", (hoverRating >= v || rating >= v) ? 'fill-secondary text-secondary' : '')} 
                          />
                        </Button>
                      ))}
                    </div>

                    <input type="hidden" value={rating} />
                    {rating === 0 && <p className="text-xs text-destructive mt-1">{t('ratingRequired')}</p>}
                  </div>

                  <div>
                    <Label htmlFor="review-text" className="text-sm">{t('yourReview')} *</Label>
                    <Textarea 
                      id="review-text" 
                      placeholder={t('reviewPlaceholder')} 
                      value={reviewText} 
                      onChange={(e) => setReviewText(e.target.value)} 
                      rows={3} 
                      className="mt-1 text-sm" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleFormSubmit}>
                      {t('submitReview')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {editingReviewId && (
              <div className="mb-6 border p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-3 text-base">{t('editReview')}</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">{t('rating')} *</Label>
                    <div className="flex items-center mt-1 space-x-1 rtl:space-x-reverse" onMouseLeave={() => setHoverRating(0)}>
                      {[1,2,3,4,5].map(v => (
                        <Button 
                          key={v} 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-secondary" 
                          onClick={() => setEditRating(v)} 
                          onMouseEnter={() => setHoverRating(v)}
                        >
                          <Star 
                            size={18} 
                            className={cn("transition-colors", (hoverRating >= v || editRating >= v) ? 'fill-secondary text-secondary' : '')} 
                          />
                        </Button>
                      ))}
                    </div>

                    <input type="hidden" value={editRating} />
                    {editRating === 0 && <p className="text-xs text-destructive mt-1">{t('ratingRequired')}</p>}
                  </div>

                  <div>
                    <Label htmlFor="edit-review-text" className="text-sm">{t('editYourReview')} *</Label>
                    <Textarea 
                      id="edit-review-text" 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)} 
                      rows={3} 
                      className="mt-1 text-sm" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => handleEditSubmit(editingReviewId)}>
                      {t('saveChanges')}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>

          {localReviews.length > 0 ? (
            <div className="space-y-4">
              {localReviews.map((review) => (
                <motion.div 
                  key={review._id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.2 }} 
                  className="rounded-xl p-4 bg-muted/50 border border-border shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div className="flex-1">
                            {(() => {
                              const userObj = review.User_ID || review.User || review.user || null;
                              const nameCandidates = [
                                userObj?.name,
                                userObj?.fullName,
                                userObj?.username,
                                userObj?.displayName,
                              ];
                              const displayName = nameCandidates.find(n => n && String(n).trim()) || t('anonymousUser');
                              return (
                                <span className="font-semibold text-sm text-primary">{displayName}</span>
                              );
                            })()}
                      <div className="mt-1 mb-2">
                        {typeof review.Rate === 'number' && isFinite(review.Rate) ? 
                          renderStars(review.Rate, 14) : 
                          <span className="text-xs text-muted-foreground">{t('noRating')}</span>
                        }
                      </div>
                      <p className="text-sm text-foreground">{review.Comment}</p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:items-end gap-2 sm:gap-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2">
                        {String(authState.userId) === getReviewUserId(review) && (
                          <>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => startEditing(review)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive" 
                              onClick={() => handleDelete(review._id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center text-sm py-6 italic">
              {t('noReviewsYet')}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorReviews;