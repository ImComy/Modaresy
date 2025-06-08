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

  const stageMap = {
    'Elementary 1': 'Elementary',
    'Elementary 2': 'Elementary',
    'Elementary 3': 'Elementary',
    'Prep 1': 'Prep',
    'Prep 2': 'Prep',
    'Prep 3': 'Prep',
    'Secondary 1': 'Secondary',
    'Secondary 2': 'Secondary',
    'Secondary 3': 'Secondary 3',
    'University Year 1': 'University',
    'University Year 2': 'University',
    'University Year 3': 'University',
    'University Year 4': 'University',
  };

  const gradeCountsByStage = {};
  const stageGrades = {};

  tutor.targetGrades?.forEach((gradeVal) => {
    const labelKey = gradeData.find((g) => g.value === gradeVal)?.labelKey;
    const label = t(labelKey || gradeVal);
    const stage = stageMap[label] || label.split(' ')[0];

    gradeCountsByStage[stage] = (gradeCountsByStage[stage] || 0) + 1;
    if (!stageGrades[stage]) stageGrades[stage] = [];
    stageGrades[stage].push(label);
  });

  const targetGradeLabels = Object.entries(stageGrades).map(([stage, grades]) =>
    grades.length > 1 ? stage : grades[0]
  );

  const targetSectorLabels =
    tutor.targetSectors
      ?.map((sVal) => t(sectorData.find((s) => s.value === sVal)?.labelKey || sVal))
      .slice(0, 2) || [];

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
                  <span className="truncate">{tutor.subject}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {renderStars(tutor.rating)}
                  <span>({tutor.rating?.toFixed(1)})</span>
                </div>
              </div>
            </div>
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
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin size={12} />
            <span>{tutor.location}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {targetGradeLabels.slice(0, 2).map((label, i) => (
              <Badge
                key={`g-${i}`}
                className="bg-primary/10 border border-primary text-primary text-xs px-2 py-0.5"
              >
                <GraduationCap size={12} className="mr-1" />
                {label}
              </Badge>
            ))}
            {targetSectorLabels.slice(0, 2).map((label, i) => (
              <Badge
                key={`s-${i}`}
                className="bg-secondary/10 border border-secondary text-secondary text-xs px-2 py-0.5"
              >
                <Users size={12} className="mr-1" />
                {label}
              </Badge>
            ))}
            {(tutor.targetGrades?.length > 2 || tutor.targetSectors?.length > 2) && (
              <Badge className="bg-muted border border-border text-muted-foreground text-xs px-2 py-0.5">
                ...
              </Badge>
            )}
          </div>
          <div className="flex-1 flex">
            <p className="text-xs text-muted-foreground line-clamp-2 self-start">{tutor.bioExcerpt}</p>
          </div>

          <div className="flex justify-center items-center text-muted-foreground mt-2 pt-2 border-t border-border/30">
            <span className="font-bold text-primary text-lg">
              {t('ratePerMonth', { rate: tutor.rate })}
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default TutorCard
