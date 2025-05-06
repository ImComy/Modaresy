import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, BookOpen, Heart, CalendarDays, GraduationCap, Users } from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { grades as gradeData, sectors as sectorData } from '@/data/formData';

const TutorCard = ({ tutor }) => {
  const { t } = useTranslation();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isInWishlist = wishlist.some((item) => item.id === tutor.id);

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

  const teachingDaysShort =
    tutor.teachingDays?.map((day) => t(day.toLowerCase() + 'Short')).join(', ') ||
    t('notSpecifiedShort');

  const targetGradeLabels =
    tutor.targetGrades
      ?.map((gVal) => t(gradeData.find((g) => g.value === gVal)?.labelKey || gVal))
      .slice(0, 2) || [];

  const targetSectorLabels =
    tutor.targetSectors
      ?.map((sVal) => t(sectorData.find((s) => s.value === sVal)?.labelKey || sVal))
      .slice(0, 2) || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="h-full"
    >
      <Link to={`/tutor/${tutor.id}`} className="block h-full">
        <Card className="h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-150 glass-effect flex flex-col">
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={tutor.bannerimg || 'https://placehold.co/600x400'}
              alt={tutor.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 rtl:left-2 rtl:right-auto h-8 w-8 rounded-full bg-background/70 hover:bg-background/90 text-muted-foreground hover:text-accent transition-colors",
                isInWishlist && "text-accent"
              )}
              onClick={handleWishlistToggle}
            >
              <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
            </Button>
            <div className="flex items-start gap-3 mb-2 absolute bottom-0 left-4 ">
              <Avatar className="h-20 w-20 border-2 border-primary flex-shrink-0 rounded-md">
                <AvatarImage src={tutor.img} alt={tutor.name} radius="rounded-sm" />
                <AvatarFallback radius="rounded-sm">
                  {tutor.name?.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="p-4 flex-grow flex flex-col">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold truncate">{tutor.name}</h3>
                <p className="text-sm text-primary font-medium flex items-center gap-1 truncate">
                  <BookOpen size={14} /> {tutor.subject}
                </p>
                <div className="flex items-center gap-1">
                  {renderStars(tutor.rating)}
                  <span className="ml-1">({tutor.rating?.toFixed(1)})</span>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {tutor.location}
              </span>
            </div>
            {(targetGradeLabels.length > 0 || targetSectorLabels.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {targetGradeLabels.map((label, i) => (
                  <Badge
                    key={`g-${i}`}
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-primary text-primary"
                  >
                    <GraduationCap size={12} className="mr-1 rtl:ml-1" />
                    {label}
                  </Badge>
                ))}
                {targetSectorLabels.map((label, i) => (
                  <Badge
                    key={`s-${i}`}
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-primary text-primary"
                  >
                    <Users size={12} className="mr-1 rtl:ml-1" />
                    {label}
                  </Badge>
                ))}
                {(tutor.targetGrades?.length > 2 || tutor.targetSectors?.length > 2) && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-primary text-primary"
                  >
                    ...
                  </Badge>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">
              {tutor.bioExcerpt}
            </p>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <CalendarDays size={12} /> {teachingDaysShort}
            </div>
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/10">
              <span className="text-lg font-bold text-primary">
                {t('ratePerMonth', { rate: tutor.rate })}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default TutorCard;