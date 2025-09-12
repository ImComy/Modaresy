import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, BookOpen, Heart, GraduationCap, Users, Clock, Globe } from 'lucide-react';
import renderStars from '@/components/ui/renderStars';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useWishlistLogic } from '@/hooks/useWishlistActions';
import { getImageUrl, getAvatarSrc, getBannerUrl } from '@/api/imageService';

const TutorCard = ({ tutor, filters }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);

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

  const displayName = tutor?.name && tutor.name.length > 16 ? tutor.name.slice(0, 15) + '...' : tutor?.name;

  const locationLabel = tutor?.governate
    ? `${t(`constants.Governates.${tutor.governate}`, { defaultValue: tutor.governate })}${tutor?.district ? ` - ${t(`constants.Districts.${tutor.district}`, { defaultValue: tutor.district })}` : ''}`
    : tutor?.location || t('unknownLocation', 'Unknown location');

  const price = (typeof selectedSubject?.price === 'number' && isFinite(selectedSubject.price))
    ? selectedSubject.price
    : (typeof tutor?.price === 'number' && isFinite(tutor.price) ? tutor.price : null);

  const rating = (typeof selectedSubject?.rating === 'number' && isFinite(selectedSubject.rating))
    ? selectedSubject.rating
    : (typeof tutor?.avgRating === 'number' && isFinite(tutor.avgRating) ? tutor.avgRating :
       (typeof tutor?.rating === 'number' && isFinite(tutor.rating) ? tutor.rating : null));

  const languages = (selectedSubject?.language && typeof selectedSubject.language === 'string')
    ? [selectedSubject.language]
    : (Array.isArray(selectedSubject?.language) ? selectedSubject.language.filter(Boolean) : (Array.isArray(tutor?.languages) ? tutor.languages.slice(0) : []));

  const derivedSector = selectedSubject?.sector || selectedSubject?.Sector || tutor?.sector || 'General';
  const derivedEducationSystem = selectedSubject?.education_system || selectedSubject?.educationSystem || tutor?.education_system || null;

  const translateSector = (s, system) => (s ? t(`constants.EducationStructure.${system || 'National'}.sectors.${s}`, { defaultValue: s }) : '');
  const translateGrade = (g, system) => (g ? t(`constants.EducationStructure.${system || 'National'}.grades.${g}`, { defaultValue: g }) : '');
  const translateEducation = (e) => (e ? t(`constants.Education_Systems.${e}`, { defaultValue: e }) : '');
  const translateSubject = (sub) => {
    const name = (sub && (sub.subject || sub.name)) ? (sub.subject || sub.name) : (filters?.subject || '');
    return name ? t(`constants.Subjects.${name}`, { defaultValue: name }) : t('unknownSubject', 'Subject');
  };

  const renderBadgeList = (items, icon = null, labelPrefix = '') => {
    if (!items || items.length === 0) return null;
    const visible = items.slice(0, 3);
    const extra = items.length - visible.length;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {visible.map((it, idx) => (
          <Badge
            key={`${labelPrefix}-${it}-${idx}`}
            className="bg-muted/30 border border-border text-xs px-2 py-0.5 rounded-md"
          >
            <span className="mr-1 align-middle text-[11px]">{icon}</span>
            <span className="truncate max-w-[7rem]">{it}</span>
          </Badge>
        ))}
        {extra > 0 && (
          <Badge className="bg-muted/20 border border-border text-xs px-2 py-0.5 rounded-md">+{extra}</Badge>
        )}
      </div>
    );
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
      <Link to={`/tutor/${tutor?.id}`} className="block h-full">
        <Card className="p-3 h-full rounded-xl bg-muted/50 border border-muted text-sm flex flex-col gap-3 hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-20 w-20 border-2 border-primary flex-shrink-0 rounded-md">
                  <AvatarImage src={getAvatarSrc(tutor) || getImageUrl(tutor?.img) || ''} alt={tutor?.name} radius="rounded-sm" />
                <AvatarFallback radius="rounded-sm">
                  {tutor?.name?.split(' ')?.map((n) => n[0])?.join('')}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate" title={tutor?.name}>
                  {displayName}
                </h3>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <BookOpen size={14} />
                  <span className="truncate">{translateSubject(selectedSubject)}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                  {rating && rating > 0 ? (
                    <div className="flex items-center gap-1">
                      {renderStars(rating)}
                      <span className="text-[12px]">({rating.toFixed(1)})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t('noReviews', 'No reviews yet')}
                    </span>
                  )}
                </div>


              </div>
            </div>

            {authState.isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
                className={cn(
                  'hover:text-destructive text-muted-foreground transition-colors h-8 w-8 rounded-full',
                  isInWishlist && 'text-destructive'
                )}
              >
                <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </Button>
            )}
          </div>

          {/* Location with governate - district */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin size={12} />
            <span className="truncate">{locationLabel}</span>
          </div>

          {/* Badges: grade, type, languages, education systems */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {selectedSubject?.grade && (
                <Badge className="bg-primary/10 border border-primary text-primary text-xs px-2 py-0.5 hover:bg-primary/20 transition-colors">
                  <GraduationCap size={12} className="mr-1" />
                  {translateGrade(selectedSubject.grade)}
                </Badge>
              )}

              {/* Sector badge (derived from explicit sector or subject.type) */}
              <Badge className="text-green-700 border border-green-300 bg-green-200 text-xs px-2 py-0.5 hover:bg-green-300 transition-colors">
                <Users size={12} className="mr-1" />
                {translateSector(derivedSector)}
              </Badge>

              {/* Languages */}
              {Array.isArray(languages) && languages.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe size={14} />
                  {languages.map(l => t(`constants.Languages.${l}`, { defaultValue: l })).join(', ')}
                </span>
              )}

              {/* Education system badge (derived) */}
              {derivedEducationSystem && (
                <Badge className="bg-muted/20 border border-border text-xs px-2 py-0.5 hover:bg-muted/30 transition-colors">
                  <GraduationCap size={12} className="mr-1" />
                  <span className="truncate max-w-[7rem]">{translateEducation(derivedEducationSystem)}</span>
                </Badge>
              )}
            </div>

            {/* Short bio / subject note */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground line-clamp-2 self-start">
                {selectedSubject?.bio || tutor?.bio || ''}
              </p>
            </div>
          </div>

          {/* Footer: price + view profile */}
          <div className="flex justify-between items-center text-muted-foreground mt-2 pt-2 border-t border-border/30 gap-2">
            <span className="font-bold text-primary text-lg">
              {selectedSubject?.price && isFinite(selectedSubject.price)
                ? t('ratePerMonth', { rate: selectedSubject.price })
                : t('noPrice')}
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
