import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Heart } from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useWishlistLogic } from '@/hooks/useWishlistActions';
import { getAvatarSrc, getImageUrl } from '@/api/imageService';

const TutorCard = ({ tutor, filters }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);

  // ----- subject selection logic (copied / adapted from old card) -----
  const subjectList = Array.isArray(tutor?.subjects) && tutor.subjects.length
    ? tutor.subjects
    : (Array.isArray(tutor?.subject_profiles) && tutor.subject_profiles.length
      ? tutor.subject_profiles.map(p => ({
          ...p.subject_doc,
          profile: p,
          rating: p.rating ?? p.subject_doc?.rating,
          private_pricing: p.private_pricing ?? p.subject_doc?.private_pricing,
          group_pricing: p.group_pricing ?? p.subject_doc?.group_pricing,
        }))
      : []);

  const selectedSubject = subjectList.find(s => {
    const name = (s?.subject || s?.name || '').toString();
    const grade = (s?.grade || '').toString();
    return name === (filters?.subject ?? name) && grade === (filters?.grade ?? grade);
  }) || subjectList[0];

  // ----- display name + location -----
  const displayName = tutor?.name && tutor.name.length > 20 ? tutor.name.slice(0, 19) + '…' : tutor?.name || t('unknownName', 'Unknown');

  const locationLabel = tutor?.governate
    ? `${t(`constants.Governates.${tutor.governate}`, { defaultValue: tutor.governate })}${tutor?.district ? ` - ${t(`constants.Districts.${tutor.district}`, { defaultValue: tutor.district })}` : ''}`
    : tutor?.location || t('unknownLocation', 'Unknown location');

  // ----- rating: prefer subject rating then tutor-level -----
  const rating = (typeof selectedSubject?.rating === 'number' && isFinite(selectedSubject.rating))
    ? selectedSubject.rating
    : (typeof tutor?.avgRating === 'number' && isFinite(tutor.avgRating))
      ? tutor.avgRating
      : (typeof tutor?.rating === 'number' && isFinite(tutor.rating) ? tutor.rating : null);

  // ----- price: prefer subject price, fallback to tutor.price -----
  const price = (typeof selectedSubject?.price === 'number' && isFinite(selectedSubject.price))
    ? selectedSubject.price
    : (typeof tutor?.price === 'number' && isFinite(tutor.price) ? tutor.price : null);

  const priceLabel = (typeof price === 'number' && isFinite(price))
    ? t('ratePerMonth', { rate: price })
    : t('noPrice', 'Contact');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="h-full"
    >
      <Link to={`/tutor/${tutor?.id}`} className="block h-full">
        <Card className="p-3 h-full rounded-xl bg-muted/50 border border-muted text-sm flex flex-col gap-3 hover:shadow transition-shadow">

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-20 w-20 border-2 border-primary flex-shrink-0 rounded-md">
                <AvatarImage src={getAvatarSrc(tutor) || getImageUrl(tutor?.img) || ''} alt={tutor?.name} radius="rounded-sm" />
                <AvatarFallback radius="rounded-sm">{tutor?.name?.split(' ')?.map(n => n[0])?.join('') || 'T'}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate" title={tutor?.name}>{displayName}</h3>

                <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                  {rating && rating > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">{renderStars(rating)}</div>
                      <span className="text-[12px]">{`(${rating.toFixed(1)})`}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t('noReviews', 'No reviews yet')}</span>
                  )}
                </div>
              </div>
            </div>

            {authState.isLoggedIn && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
                aria-label={isInWishlist ? t('removeFromWishlist', 'Remove from wishlist') : t('addToWishlist', 'Add to wishlist')}
                className={cn('h-8 w-8 rounded-full flex items-center justify-center transition-colors', isInWishlist ? 'text-destructive' : 'text-muted-foreground')}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          <div className="flex flex-col-reverse gap-1 text-muted-foreground text-xs mt-2">
            <span className="truncate">{tutor?.address}</span>
            <div className='flex items-center gap-1'>
              <MapPin size={12} />
              <span className="truncate">{locationLabel}</span>
            </div>
          </div>

          {/* Footer: price + view profile */}
          <div className="flex justify-between items-center text-muted-foreground mt-2 pt-2 border-t border-border/30 gap-2">
            <span className="font-bold text-primary text-lg flex items-center gap-2">
              <span>{priceLabel}</span>
            </span>

            <Button
              as={Link}
              to={`/tutor/${tutor?.id}`}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 px-3 py-1 rounded-md font-semibold"
              onClick={e => e.stopPropagation()}
            >
              {t('viewProfile', 'View Profile')}
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default TutorCard;
