import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Heart,
  Users,
  GraduationCap,
  Star,
  Calendar,
} from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const ShortTutorCard = ({ tutor }) => {
  const { t, i18n } = useTranslation();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const { authState } = useAuth();

  const isInWishlist = wishlist.some((item) => item.id === tutor.id);

  const averageRating = (() => {
    const ratings = tutor.subjects.map((s) => s.rating).filter((r) => typeof r === 'number');
    const avg = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
    return ratings.length ? avg.toFixed(1) : null;
  })();

  const maxYearsExp = tutor.subjects?.reduce(
    (max, subj) => Math.max(max, subj.yearsExp || 0),
    0
  );

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      removeFromWishlist(tutor.id);
      toast({
        title: t('wishlistRemoved'),
        description: `${tutor.name} ${t('hasBeenRemoved')}`,
      });
    } else {
      addToWishlist(tutor);
      toast({
        title: t('wishlistAdded'),
        description: `${tutor.name} ${t('hasBeenAdded')}`,
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="h-full"
    >
      <Link to={`/tutor/${tutor.id}`} className="block h-full">
        <Card className="relative h-full flex flex-col rounded-xl overflow-hidden border bg-muted">
          <div className="relative w-full h-32 rounded-t-xl">
            <img
              src={tutor.bannerimg || 'https://placehold.co/600x400'}
              alt="Banner"
              className="w-full h-full object-cover rounded-t-xl"
              onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = 'https://placehold.co/600x400';
              }}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full -mt-14 rounded-md">
              <div className="h-24 w-24 border-2 border-primary rounded-md bg-background z-50">
                <Avatar className="h-full w-full rounded-sm">
                  <AvatarImage src={tutor.img} alt={tutor.name} className="object-cover" />
                  <AvatarFallback className='rounded-sm'>
                    {tutor.name?.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <CardContent className="flex-1 pt-12 pb-4 px-4 flex flex-col justify-between">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-foreground">{tutor.name}</h3>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-3 text-center">
                {tutor.GeneralBio}
              </p>
            </div>

            <div
              className="mt-4 w-full flex justify-between items-center pt-4 border-t border-border text-xs gap-2"
              dir={i18n.dir()}
            >
              {authState.isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className={cn(
                    'hover:text-destructive text-muted-foreground transition-colors px-2 gap-1',
                    'whitespace-nowrap',
                    isInWishlist && 'text-destructive'
                  )}
                >
                  <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
                  <span>{isInWishlist ? t('Remove') : t('addToWishlist', 'Add to Wishlist')}</span>
                </Button>
              )}
              <Button
                as={Link}
                to={`/tutor/${tutor.id}`}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 px-3 py-1 rounded-md font-semibold whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {t('viewProfile', 'View Profile')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ShortTutorCard;