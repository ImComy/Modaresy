import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  DollarSign,
  BookOpen,
  Heart,
  GraduationCap,
  Users
} from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Award } from 'lucide-react';
import i18n from 'i18next';

const TutorCard = ({ tutor, filters }) => {
  const { t } = useTranslation();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const { authState } = useAuth();
  const isInWishlist = wishlist.some((item) => item.id === tutor.id);
  const isTopRated = tutor?.isTopRated === true;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(tutor.id);
      toast({
        title: t('wishlistRemoved'),
        description: `${tutor.name} ${t('hasBeenRemoved', { context: 'female' })}.`,
      });
    } else {
      addToWishlist(tutor);
      toast({
        title: t('wishlistAdded'),
        description: `${tutor.name} ${t('hasBeenAdded', { context: 'female' })}.`,
      });
    }
  };

  const selectedSubject = Array.isArray(tutor.subjects)
    ? tutor.subjects.find(
        s =>
          s.subject === filters.subject &&
          s.grade === filters.grade
      )
    : undefined;

  const displayName =
    tutor.name && tutor.name.length > 16
      ? tutor.name.slice(0, 15) + '...'
      : tutor.name;

  const getGradeLabel = (grade) => {
    const grades = {
      "1": t("primary1", "Primary 1"),
      "2": t("primary2", "Primary 2"),
      "3": t("primary3", "Primary 3"),
      "4": t("primary4", "Primary 4"),
      "5": t("primary5", "Primary 5"),
      "6": t("primary6", "Primary 6"),
      "7": t("preparatory1", "Preparatory 1"),
      "8": t("preparatory2", "Preparatory 2"),
      "9": t("preparatory3", "Preparatory 3"),
      "10": t("secondary1", "Secondary 1"),
      "11": t("secondary2", "Secondary 2"),
      "12": t("secondary3", "Secondary 3"),
      "KG": t("kg", "KG"),
      "University": t("university", "University"),
      "Other": t("other", "Other"),
    };
    return grades[grade] || grade;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{
        y: -2,
        scale: tutor.isTopRated ? 1.01 : 1,
        transition: { duration: 0.15 },
      }}
      className="h-full"
    >
      <Link to={`/tutor/${tutor.id}`} className="block h-full">
        <Card
          className={cn(
            'relative p-3 h-full rounded-xl border text-sm flex flex-col gap-3 transition-shadow hover:shadow',
            tutor.isTopRated
              ? 'border-yellow-400 bg-gradient-to-bl via-muted from-yellow-200/50 to-muted/50 hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]'
              : 'bg-muted/50'
          )}
        >
          {isTopRated && (
            <div
              className={cn(
                'absolute top-2 z-10',
                i18n.dir() === 'rtl' ? 'left-2' : 'right-2'
              )}
            >
              <Award className="text-yellow-400 w-5 h-5" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                className={cn(
                  'h-20 w-20 flex-shrink-0 rounded-md border-2',
                  tutor.isTopRated ? 'border-yellow-400' : 'border-primary'
                )}
              >
                <AvatarImage src={tutor.img} alt={tutor.name} />
                <AvatarFallback>
                  {tutor.name?.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate" title={tutor.name}>
                  {displayName}
                </h3>
                <div className="text-muted-foreground flex items-center gap-1 text-primary">
                  <BookOpen size={14} />
                  <span className="truncate">{selectedSubject?.subject || filters.subject}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {typeof selectedSubject?.rating === 'number' && isFinite(selectedSubject.rating) ? (
                    <>
                      {renderStars(selectedSubject.rating)}
                      <span>({selectedSubject.rating.toFixed(1)})</span>
                    </>
                  ) : t('noRating')}
                </div>
              </div>
            </div>
            {authState.isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className={cn(
                  'hover:text-destructive text-muted-foreground transition-colors h-8 w-8 rounded-full',
                  isInWishlist && 'text-destructive'
                )}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin size={12} />
            <span>{tutor.location}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSubject?.grade && (
              <Badge className="bg-primary/10 border border-primary text-primary text-xs px-2 py-0.5">
                <GraduationCap size={12} className="mr-1" />
                {getGradeLabel(selectedSubject.grade)}
              </Badge>
            )}
            {selectedSubject?.type && (
              <Badge className="text-green-700 border border-green-300 bg-green-200 text-xs px-2 py-0.5">
                <Users size={12} className="mr-1" />
                {selectedSubject.type}
              </Badge>
            )}
          </div>

          <div className="flex-1 flex">
            <p className="text-xs text-muted-foreground line-clamp-2 self-start">
              {selectedSubject?.bio || ''}
            </p>
          </div>

          <div className="flex justify-between items-center text-muted-foreground mt-2 pt-2 border-t border-border/30 gap-2">
            <span className="font-bold text-primary text-lg">
              {selectedSubject?.price && isFinite(selectedSubject.price)
                ? t('ratePerMonth', { rate: selectedSubject.price })
                : t('noPrice')}
            </span>
            <Button
              as={Link}
              to={`/tutor/${tutor.id}`}
              size="sm"
              variant={tutor.isTopRated ? 'default' : 'outline'}
              className={cn(
                'transition-colors duration-200 px-3 py-1 rounded-md font-semibold',
                tutor.isTopRated
                  ? 'text-white bg-[linear-gradient(135deg,_#FFD700,_#FFB700)] hover:brightness-110'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              )}
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
