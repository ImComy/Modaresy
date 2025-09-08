import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Heart, GraduationCap, ChevronDown, Calendar, Globe } from 'lucide-react';
import { useWishlistLogic } from '../../hooks/useWishlistActions';
import { useAuth } from '@/context/AuthContext';
import renderStars from '@/components/ui/renderStars';
import { cn } from '@/lib/utils';
import { getImageUrl, getAvatarSrc, getBannerUrl } from '@/api/imageService';
import clsx from 'clsx';

const TutorCard = ({ tutor }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [openTypes, setOpenTypes] = useState({});
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);

  const subjectEntries = (() => {
    if (Array.isArray(tutor?.subject_profiles) && tutor.subject_profiles.length) {
      return tutor.subject_profiles
        .map(p => {
          const subj = p.subject_doc || p.subject || {};
          const name = subj?.name || subj?.subject || p.subject_name || p.name || '';
          const grade = subj?.grade || p.grade || subj?.grade || '';
          const education_system = subj?.education_system || subj?.educationSystem || p.education_system || p.educationSystem || null;
          const sector = subj?.sector || p.sector || 'General';
          const language = subj?.language || p.language || (Array.isArray(subj?.languages) ? subj.languages[0] : null) || null;
          const years_experience = p.years_experience ?? p.yearsExp ?? subj?.years_experience ?? 0;
          return {
            name,
            subject: name,
            grade,
            education_system,
            sector,
            language,
            years_experience,
            profile: p,
            rating: p.rating ?? subj?.rating ?? null,
            private_pricing: p.private_pricing ?? subj?.private_pricing,
            group_pricing: p.group_pricing ?? subj?.group_pricing,
          };
        })
        .filter(s => s && s.name);
    }

    if (!Array.isArray(tutor?.subjects)) return [];
    return tutor.subjects
      .map(s => (typeof s === 'string' ? { name: s, subject: s } : s))
      .filter(s => s && (s.name || s.subject));
  })();

  const averageRating = (() => {
    const ratings = subjectEntries.map(s => s?.rating).filter(r => typeof r === 'number');
    if (!ratings.length) return null;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Number.isFinite(avg) ? avg.toFixed(1) : null;
  })();

  const computedMaxYears = subjectEntries.reduce(
    (max, subj) => Math.max(max, subj?.years_experience || 0),
    0
  );
  const maxYearsExp = Math.max(computedMaxYears || 0, tutor?.experience_years || tutor?.experienceYears || tutor?.experience || 0);

  // NEW: group by subject (subject is now the group tag)
  const groupedBySubject = subjectEntries.reduce((acc, subj) => {
    const subjName = subj?.name || subj?.subject || 'Unknown';
    const key = String(subjName);
    if (!acc[key]) acc[key] = [];
    acc[key].push(subj);
    return acc;
  }, {});

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
        <Card className="relative h-full flex flex-col rounded-xl overflow-hidden border bg-muted">
          {/* Banner */}
          <div className="relative w-full h-32 rounded-t-xl">
            <img
              src={getBannerUrl(tutor) || getImageUrl(tutor?.bannerimg) || 'banner.png'}
              alt="Banner"
              className="w-full h-full object-cover rounded-t-xl"
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full -mt-14">
              <div className="h-24 w-24 border-2 border-primary rounded-md bg-background z-50">
                <Avatar className="h-full w-full rounded-sm">
                  <AvatarImage src={getAvatarSrc(tutor) || getImageUrl(tutor?.img) || ''} alt={tutor?.name} />
                  <AvatarFallback className="rounded-sm">
                    {tutor?.name?.split(' ')?.map(n => n[0])?.join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <CardContent className="flex-1 pt-12 pb-4 px-4 flex flex-col justify-between">
            {/* Info */}
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                {tutor?.name || t('unknownTutor')}
              </h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                {averageRating && averageRating > 0 ? (
                  <>
                    {renderStars(averageRating)}
                    <span>({averageRating})</span>
                  </>
                ) : (
                  t('noReviews', 'No reviews yet')
                )}
              </div>
              <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{maxYearsExp} {t('yearsOfExperience')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>
                    {tutor?.governate && tutor?.district
                      ? `${tutor.governate} - ${tutor.district}`
                      : t('locationNotSpecified')}
                  </span>
                </div>
              </div>
            </div>

            {/* Subjects grouped by subject name (subject is the group tag). Inside each subject we show unique sector/grade/education_system combos */}
            {Object.entries(groupedBySubject).length > 0 ? (
              Object.entries(groupedBySubject).map(([subjectKey, subjects]) => {
                const isOpen = openTypes[subjectKey] ?? Object.keys(groupedBySubject).length === 1;

                // Build unique combos of sector/grade/education_system for this subject
                const combosMap = {};
                subjects.forEach(s => {
                  const edu = s?.education_system || s?.educationSystem || null;
                  const sec = s?.sector || s?.Sector || 'General';
                  const grade = s?.grade || '';
                  const comboKey = `${sec}||${grade}||${edu}`;
                  if (!combosMap[comboKey]) combosMap[comboKey] = { sector: sec, grade, education_system: edu };
                });
                const combos = Object.values(combosMap);

                return (
                  <div
                    key={subjectKey}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenTypes((prev) => ({ ...prev, [subjectKey]: !isOpen }));
                    }}
                    className={clsx(
                      'relative transition-all rounded-xl',
                      isOpen
                        ? 'p-4 pt-6 bg-primary/5 border border-primary mt-5'
                        : 'p-0 border-none mt-2'
                    )}
                  >
                    {/* Header: now the subject is the tag */}
                    <div
                      className={clsx(
                        'flex items-center gap-2',
                        isOpen ? 'absolute -top-3 ltr:left-4 rtl:right-4' : 'mb-1 px-1'
                      )}
                    >
                      <span className="px-3 py-0.5 text-[11px] font-semibold rounded-full shadow-sm border border-green-300 bg-green-100 text-green-700">
                        {subjectKey}
                      </span>

                      {/* Language label (same as before) */}
                      {(() => {
                        const first = subjects[0] || {};
                        const lang =
                          first?.language ??
                          first?.languages ??
                          (Array.isArray(tutor?.languages) && tutor.languages[0]) ??
                          tutor?.language;
                        if (lang)
                          return (
                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full shadow-sm border border-blue-300 bg-blue-100 text-blue-700 ml-2">
                              {Array.isArray(lang) ? lang[0] : lang}
                            </span>
                          );
                        return null;
                      })()}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenTypes((prev) => ({ ...prev, [subjectKey]: !isOpen }));
                        }}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white hover:bg-primary/90 border border-primary shadow-sm transition"
                      >
                        <ChevronDown
                          size={12}
                          className={clsx('transition-transform duration-200', {
                            'rotate-180': isOpen,
                          })}
                        />
                      </button>
                    </div>

                    {/* Sector/Grade combos (grouped inside the subject) */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="combos"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2"
                        >
                          <div className="flex flex-wrap gap-2 -m-1">
                            {combos.map((c, idx) => {
                              const sectors = Array.isArray(c.sector) ? c.sector : [c.sector];
                              const title = [sectors.join(", "), c.grade, c.education_system].filter(Boolean).join(" - ");

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md border text-xs text-primary border-primary bg-primary/10 max-w-xs"
                                  title={title}
                                >
                                  <MapPin size={12} className="flex-shrink-0" />

                                  <div className="flex flex-wrap items-center gap-1 flex-1">
                                    {/* Sectors */}
                                    {sectors.map((s, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] leading-tight"
                                      >
                                        {s}
                                      </span>
                                    ))}

                                    {/* Grade & Education */}
                                    {(c.grade || c.education_system) && (
                                      <span className="ml-auto text-muted-foreground text-[10px] italic">
                                        {c.grade}{c.education_system ? ` - ${c.education_system}` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              // No subjects recorded
              <div className="mt-4 text-center text-sm text-muted-foreground italic">
                {t('noSubjectsRecorded', 'No subjects recorded')}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 w-full flex justify-between items-center pt-4 border-t border-border text-sm">
              {authState.isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className={cn(
                    'hover:text-destructive text-muted-foreground transition-colors px-2 gap-1',
                    isInWishlist && 'text-destructive'
                  )}
                >
                  <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
                  {isInWishlist ? t('remove') : t('addToWishlist')}
                </Button>
              )}
              <div className="flex items-center gap-2">
                {Array.isArray(tutor?.languages) && tutor.languages.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe size={14} />
                    {tutor.languages.join(', ')}
                  </span>
                )}
                <Button
                  as={Link}
                  to={`/tutor/${tutor?.id}`}
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 px-3 py-1 rounded-md font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('viewProfile')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default TutorCard;
