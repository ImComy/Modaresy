import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, BookOpen, Heart, CalendarDays, GraduationCap, Users, Clock } from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const TutorCard = ({ tutor, filters }) => {
  const { t } = useTranslation();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const { authState } = useAuth();
  const isInWishlist = wishlist.some((item) => item.id === tutor.id);

  function getGradeLabel(grade, t) {
    switch (grade) {
      case "1": return t("primary1", "Primary 1");
      case "2": return t("primary2", "Primary 2");
      case "3": return t("primary3", "Primary 3");
      case "4": return t("primary4", "Primary 4");
      case "5": return t("primary5", "Primary 5");
      case "6": return t("primary6", "Primary 6");
      case "7": return t("preparatory1", "Preparatory 1");
      case "8": return t("preparatory2", "Preparatory 2");
      case "9": return t("preparatory3", "Preparatory 3");
      case "10": return t("secondary1", "Secondary 1");
      case "11": return t("secondary2", "Secondary 2");
      case "12": return t("secondary3", "Secondary 3");
      case "KG": return t("kg", "KG");
      case "University": return t("university", "University");
      case "Other": return t("other", "Other");
      default: return grade;
    }
  }
  
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

  // Get the subject object matching the selected subject and grade
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
        <Card className="p-3 h-full rounded-xl bg-muted/50 border border-muted text-sm flex flex-col gap-3 hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-20 w-20 border-2 border-primary flex-shrink-0 rounded-md">
                <AvatarImage src={tutor.img} alt={tutor.name} radius="rounded-sm" />
                <AvatarFallback radius="rounded-sm">
                  {tutor.name?.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3
                  className="font-semibold text-base text-foreground truncate"
                  title={tutor.name}
                >
                  {displayName}
                </h3>
                <div className="text-muted-foreground flex items-center gap-1 text-primary">
                  <BookOpen size={14} />
                  <span className="truncate">{selectedSubject?.subject || filters.subject}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {typeof selectedSubject?.rating === 'number' && isFinite(selectedSubject.rating)
                    ? (
                        <>
                          {renderStars(selectedSubject.rating)}
                          <span>({selectedSubject.rating.toFixed(1)})</span>
                        </>
                      )
                    : t('noRating')}
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
              <Badge
                className="bg-primary/10 border border-primary text-primary text-xs px-2 py-0.5"
              >
                <GraduationCap size={12} className="mr-1" />
                {getGradeLabel(selectedSubject.grade, t)}
              </Badge>
            )}
            {selectedSubject?.type && (
              <Badge
                className="bg-secondary/10 border border-secondary text-secondary text-xs px-2 py-0.5"
              >
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
