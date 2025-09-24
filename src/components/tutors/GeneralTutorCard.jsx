import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Heart, GraduationCap, ChevronDown, Calendar, Globe, BookOpen, MessageCircle } from 'lucide-react';
import { useWishlistLogic } from '../../hooks/useWishlistActions';
import { useAuth } from '@/context/AuthContext';
import renderStars from '@/components/ui/renderStars';
import { cn } from '@/lib/utils';
import { getImageUrl, getAvatarSrc, getBannerUrl } from '@/api/imageService';
import clsx from 'clsx';

const TutorCard = ({ tutor }) => {
  const { t, i18n } = useTranslation();
  const { authState } = useAuth();
  const [openTypes, setOpenTypes] = useState({});
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);
  const govLabel = tutor?.governate ? t(`constants.Governates.${tutor.governate}`, { defaultValue: tutor.governate }) : null;
  const distLabel = tutor?.district ? t(`constants.Districts.${tutor.district}`, { defaultValue: tutor.district }) : null;
  const translatedLocation = govLabel ? (distLabel ? `${govLabel} - ${distLabel}` : govLabel) : null;
  
  // Helper function to flatten and extract languages from any structure
  const extractLanguages = (langData) => {
    if (!langData) return [];
    
    // If it's already an array of strings, return it
    if (Array.isArray(langData)) {
      return langData.flatMap(item => extractLanguages(item)).filter(Boolean);
    }
    
    // If it's a string, return it as array
    if (typeof langData === 'string') {
      return [langData];
    }
    
    // If it's an object, try to extract language properties
    if (typeof langData === 'object') {
      return Object.values(langData).flatMap(value => extractLanguages(value));
    }
    
    return [];
  };

  const subjectEntries = (() => {
    if (Array.isArray(tutor?.subject_profiles) && tutor.subject_profiles.length) {
      return tutor.subject_profiles
        .map(p => {
          const subj = p.subject_doc || p.subject || {};
          const name = subj?.name || subj?.subject || p.subject_name || p.name || '';
          const grade = subj?.grade || p.grade || subj?.grade || '';
          const education_system = subj?.education_system || subj?.educationSystem || p.education_system || p.educationSystem || null;
          const sector = subj?.sector || p.sector || 'General';
          
          // Extract languages from multiple possible sources
          const languages = extractLanguages([
            subj?.languages,
            p.languages,
            subj?.language,
            p.language,
            tutor?.languages,
            tutor?.language
          ]);
          
          const years_experience = p.years_experience ?? p.yearsExp ?? subj?.years_experience ?? 0;
          return {
            name,
            subject: name,
            grade,
            education_system,
            sector,
            languages: Array.from(new Set(languages)), // Remove duplicates
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

  const groupedBySubject = subjectEntries.reduce((acc, subj) => {
    const subjName = subj?.name || subj?.subject || 'Unknown';
    const key = String(subjName);
    if (!acc[key]) acc[key] = [];
    acc[key].push(subj);
    return acc;
  }, {});

  // Get all unique languages from tutor and subjects
  const allLanguages = Array.from(new Set([
    ...extractLanguages(tutor?.languages),
    ...subjectEntries.flatMap(subj => extractLanguages(subj.languages))
  ])).filter(Boolean);

  // Helper function to safely get language code
  const getLanguageCode = (lang) => {
    if (!lang || typeof lang !== 'string') return '';
    return lang.slice(0, 2).toUpperCase();
  };

  // Helper function to safely get language display name
  const getLanguageDisplay = (lang) => {
    if (!lang || typeof lang !== 'string') return '';
    return t(`constants.Languages.${lang}`, { defaultValue: lang });
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
        <Card className="relative h-full flex flex-col rounded-xl overflow-hidden border bg-muted">
          <div className="relative w-full h-32 rounded-t-xl">
            <img
              src={getBannerUrl(tutor) || getImageUrl(tutor?.bannerimg) || 'banner.png'}
              alt={t('banner', 'Banner')}
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
            <div className={clsx("text-center space-y-1", i18n.language === 'ar' ? 'text-right' : 'text-left')}>
              <h3 className="font-bold text-lg text-foreground text-center">
                {tutor?.name || t('unknownTutor', 'Unknown tutor')}
              </h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                {averageRating && averageRating > 0 ? (
                  <>
                    {renderStars(averageRating)}
                    <span>({averageRating})</span>
                  </>
                ) : (
                  t('noReviews', 'No reviews yet')
                )}
              </div>
              <div className="flex flex-col items-center justify-center text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{maxYearsExp} {t('yearsOfExperience', 'years of experience')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>
                    {translatedLocation
                      ? translatedLocation
                      : t('locationNotSpecified', 'Location not specified')}
                  </span>
                </div>
              </div>
            </div>

            {Object.entries(groupedBySubject).length > 0 ? (
              Object.entries(groupedBySubject).map(([subjectKey, subjects]) => {
                // Changed: Never auto-open, even if there's only one group
                const isOpen = openTypes[subjectKey] ?? false;

                const combosMap = {};
                subjects.forEach(s => {
                  const edu = s?.education_system || s?.educationSystem || null;
                  const sec = s?.sector || s?.Sector || 'General';
                  const grade = s?.grade || '';
                  const comboKey = `${sec}||${grade}||${edu}`;
                  if (!combosMap[comboKey]) {
                    combosMap[comboKey] = { 
                      sector: sec, 
                      grade, 
                      education_system: edu,
                      languages: extractLanguages(s.languages)
                    };
                  }
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
                      'relative transition-all rounded-xl cursor-pointer',
                      isOpen
                        ? 'p-4 pt-6 bg-primary/5 border border-primary mt-5'
                        : 'p-0 border-none mt-2'
                    )}
                  >
                    <div
                      className={clsx(
                        'flex items-center gap-2 justify-between',
                        isOpen ? 'absolute -top-3 ltr:left-4 rtl:right-4' : 'mb-1 px-1'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-0.5 text-[11px] font-semibold rounded-full shadow-sm border border-green-300 bg-green-100 text-green-700">
                          {t(`constants.Subjects.${subjectKey}`, { defaultValue: subjectKey })}
                        </span>

                        {/* Languages badges - compact design */}
                        {(() => {
                          const subjectLanguages = subjects.flatMap(s => extractLanguages(s.languages));
                          const uniqueLangs = Array.from(new Set(subjectLanguages)).slice(0, 2); // Show max 2 languages
                          
                          if (uniqueLangs.length === 0) return null;

                          return (
                            <div className="flex gap-1">
                              {uniqueLangs.map((lang, index) => (
                                <span 
                                  key={index}
                                  className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full border border-blue-300 bg-blue-100 text-blue-700"
                                  title={getLanguageDisplay(lang)}
                                >
                                  {getLanguageCode(lang)}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenTypes((prev) => ({ ...prev, [subjectKey]: !isOpen }));
                        }}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white hover:bg-primary/90 border border-primary shadow-sm transition flex-shrink-0"
                      >
                        <ChevronDown
                          size={12}
                          className={clsx('transition-transform duration-200', {
                            'rotate-180': isOpen,
                          })}
                        />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="combos"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 overflow-hidden"
                        >
                          <div className="space-y-2">
                            {combos.map((c, idx) => {
                              const sectors = Array.isArray(c.sector) ? c.sector : [c.sector];
                              const translateSector = (s, system) => t(`constants.EducationStructure.${system || 'National'}.sectors.${s}`, { defaultValue: s });
                              const translateGrade = (g, system) => (g ? t(`constants.EducationStructure.${system || 'National'}.grades.${g}`, { defaultValue: g }) : '');
                              const translateEducation = (e) => (e ? t(`constants.Education_Systems.${e}`, { defaultValue: e }) : '');

                              const gradeLabel = translateGrade(c.grade, c.education_system);
                              const eduLabel = translateEducation(c.education_system);

                              return (
                                <div
                                  key={idx}
                                  className="p-2 rounded-md border border-primary/20 bg-primary/5"
                                >
                                  {/* First row: Sector and Grade/Education with icons */}
                                  <div className="flex items-start justify-between gap-1 mb-1.5">
                                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                      {sectors.map((s, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium whitespace-nowrap"
                                        >
                                          <GraduationCap size={11} className="flex-shrink-0" />
                                          {translateSector(s, c.education_system)}
                                        </span>
                                      ))}
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground whitespace-nowrap shrink-0 pl-1">
                                      {gradeLabel && (
                                        <div className="inline-flex items-center gap-1 leading-tight bg-muted/30 px-1.5 py-0.5 rounded">
                                          <Calendar size={10} className="flex-shrink-0" />
                                          {gradeLabel}
                                        </div>
                                      )}
                                      {eduLabel && (
                                        <div className="inline-flex items-center gap-1 text-[11px] leading-tight text-foreground/80 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/30">
                                          <BookOpen size={10} className="flex-shrink-0" />
                                          {eduLabel}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Second row: Languages with improved design */}
                                  {c.languages && c.languages.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <Globe size={11} className="text-muted-foreground flex-shrink-0" />
                                      <div className="flex flex-wrap gap-1">
                                        {c.languages.map((lang, langIdx) => (
                                          <span 
                                            key={langIdx}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100/80 text-blue-700 text-[10px] font-medium border border-blue-200/60 shadow-sm"
                                          >
                                            {getLanguageDisplay(lang)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
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
              <div className="mt-4 text-center text-sm text-muted-foreground italic">
                {t('noSubjectsRecorded', 'No subjects recorded')}
              </div>
            )}

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
                  {isInWishlist ? t('remove', 'Remove') : t('addToWishlist', 'Add to wishlist')}
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Button
                  as={Link}
                  to={`/tutor/${tutor?.id}`}
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 px-3 py-1 rounded-md font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('viewProfile', 'View profile')}
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