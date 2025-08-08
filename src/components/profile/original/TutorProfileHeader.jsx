import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, BookOpen, MessageSquare, Heart, Award, Building, GraduationCap, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import renderStars from '@/components/ui/renderStars';
import { cn } from '@/lib/utils';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaTelegramPlane,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa';
import ReportButton from '@/components/report';
import { useWishlistLogic } from '@/hooks/useWishlistActions';

const socialIcons = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  telegram: FaTelegramPlane,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  website: FaGlobe,
};

const TutorProfileHeaderDisplay = ({ tutor, isOwner, onEdit }) => {
  const { t, i18n } = useTranslation();
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);
  const isRTL = i18n.dir() === 'rtl';

  const allRatings = tutor?.subjects?.map(s => s.rating).filter(r => typeof r === 'number' && isFinite(r)) || [];
  const averageRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : null;
  const maxYearsExp = Math.max(...(tutor?.subjects?.map(s => s.yearsExp || 0) || [0]));

  return (
    <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
      <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
        <img
          src={tutor.bannerimg instanceof File ? URL.createObjectURL(tutor.bannerimg) : tutor.bannerimg || 'https://placehold.co/600x200?text=Tutor'}
          alt={tutor.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://placehold.co/600x200?text=Tutor';
          }}
        />
        <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-2">
          {tutor.achievements?.filter(a => a.isCurrent).map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full shadow-md border backdrop-blur-sm",
                achievement.type === 'topRated'
                  ? "bg-yellow-100/80 text-yellow-900 border-yellow-300"
                  : "bg-purple-100/80 text-purple-900 border-purple-300"
              )}
            >
              {achievement.type === 'topRated' && <Star size={14} className="text-yellow-500" />}
              {achievement.type === 'monthlyTop' && <Award size={14} className="text-purple-500" />}
              <span>{achievement.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative">
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {!isOwner && (
            <div className="absolute top-4 right-4 z-20">
              <ReportButton tutorId={tutor.id} />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
              <div className="w-[200px] h-40 border-2 border-primary rounded-md shadow-lg">
                <Avatar className="w-full h-full rounded-sm">
                  <AvatarImage
                    src={tutor.img instanceof File ? URL.createObjectURL(tutor.img) : tutor.img}
                    alt={tutor.name}
                  />
                  <AvatarFallback className="text-3xl rounded-sm">
                    {tutor.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-primary">{tutor.name}</h1>
                <div className="text-sm text-muted-foreground flex justify-center items-center gap-1">
                  {typeof averageRating === 'number' ? (
                    <>
                      {renderStars(averageRating)} <span>({averageRating.toFixed(1)})</span>
                    </>
                  ) : t('noRating')}
                </div>
              </div>

              <div className="max-w-full space-y-2">
                <Button
                  className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 transition-colors"
                >
                  <MessageSquare size={18} />
                  {t('contactTutor')}
                </Button>

                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap",
                    isInWishlist ? "text-accent border-accent hover:bg-accent/10" : "text-primary border-primary"
                  )}
                  onClick={handleWishlistToggle}
                >
                  <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                  {isInWishlist ? t('removeFromWishlist') : t('addToWishlist')}
                </Button>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  {Object.entries(tutor.socials || {}).map(([key, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[key];
                    return Icon ? (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon size={20} />
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/*Mobile Sbjects */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "block sm:w-80 sm:max-w-[90vw] sm:p-6",
              "bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 max-h-80 overflow-y-auto",
              "md:hidden"
            )}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                <BookOpen size={20} />
                {t('teachesSubjects')}:
              </div>
              {tutor.subjects?.length > 0 ? (
                tutor.subjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-primary/20 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap size={18} className="text-primary shrink-0" />
                      <h4 className="text-base font-semibold text-primary leading-tight truncate max-w-full">
                        {subject.subject}
                      </h4>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="mr-2">
                        {t('Grade')}: <strong>{subject.grade}</strong>
                      </span>
                      {subject.type && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md border border-green-300 truncate max-w-full">
                          {subject.type}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full border-2 border-dashed border-primary/20 rounded-xl bg-muted/40 p-6 flex items-start gap-4 shadow-sm mt-2">
                  <div className="text-2xl animate-pulse select-none">📚</div>
                  <div className="flex-1 rtl:text-right">
                    <p className="text-base font-semibold text-primary">{t('noSubjectsTitle') || 'No subjects added'}</p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {t('noSubjectsDescription') || 'This tutor hasn’t listed any subjects yet.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left "
          >
            <div className="flex flex-col md:flex-row w-full gap-6">
              <div className="flex-1 min-w-0">
              {/* Experience, Location, Detailed Location */}
              <div className="flex flex-col gap-5 text-base text-muted-foreground"> {/* was text-sm */}
                <div className="flex items-start gap-3">
                  <Award size={18} className="mt-0.5 text-primary shrink-0" /> {/* was 16 */}
                  <span className="font-medium text-foreground break-words">
                    {isFinite(maxYearsExp) && maxYearsExp > 0
                      ? t('yearsExp', { count: maxYearsExp })
                      : t('noExperience')}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-primary shrink-0" />
                  <span className="font-medium text-foreground break-words">
                    {t('basedInLocation', {
                      location: tutor.location || t('noLocation'),
                    })}
                  </span>
                </div>

                <div className="flex items-start gap-3 flex-wrap">
                  <Building size={18} className="mt-0.5 text-primary shrink-0" />
                  {Array.isArray(tutor.detailedLocation) && tutor.detailedLocation.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-w-full">
                      {tutor.detailedLocation.map((location, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-muted text-sm text-muted-foreground border border-border whitespace-nowrap"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{t('detailedLocationNotSet')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column – Subjects */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "hidden md:block w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 max-h-[350px] overflow-y-auto flex-1 min-w-0 md:max-w-xs -mt-[200px] mr-14"
              )}
            >
              <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                <BookOpen size={20} />
                {t('teachesSubjects')}:
              </div>

              {tutor.subjects?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {tutor.subjects.map((subject, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-primary/20 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap size={18} className="text-primary shrink-0" />
                        <h4 className="text-base font-semibold text-primary leading-tight truncate max-w-full">
                          {subject.subject}
                        </h4>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-col gap-1">
                        <span className="block">
                          {t('Grade')}: <strong>{subject.grade}</strong>
                        </span>
                        {subject.type && (
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md border border-green-300 max-w-fit",
                              i18n.dir() === 'rtl' ? "self-start" : "self-end"
                            )}
                          >
                            {subject.type}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/20 flex flex-col items-center text-center text-muted-foreground gap-3">
                  <GraduationCap size={40} className="text-primary/50" />
                  <p className="font-medium text-sm">{t('noSubjectsTitle') || "No subjects added yet"}</p>
                  <p className="text-xs">{t('noSubjectsDesc') || "This tutor hasn’t specified their subjects yet."}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* About Me (Full Width Underneath) */}
          <div className="w-full flex flex-col">
            <Separator className="my-4" />
            <h2 className="text-xl font-semibold mb-2 text-primary rtl:text-right">{t('aboutMe')}</h2>
            {tutor.GeneralBio?.trim() ? (
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-border">
                {tutor.GeneralBio}
              </p>
            ) : (
              <div className="border-2 border-dashed border-primary/20 rounded-xl bg-muted/40 p-6 w-full flex items-start gap-4 shadow-sm">
                <div className="text-3xl animate-pulse select-none">📝</div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-base font-semibold text-primary">{t('noBioTitle') || "No bio added yet"}</p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {t('noBioDescription') || "This tutor hasn’t written their introduction yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </CardContent>
      </div>
    </Card>
  );
};

export default TutorProfileHeaderDisplay;