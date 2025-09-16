import React, { useState } from 'react';
import { getAvatarSrc, getBannerUrl } from '@/api/imageService';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, BookOpen, MessageSquare, Heart, Award, GraduationCap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/api/apiService';
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
import { useWishlistLogic } from '@/hooks/useWishlistActions';
import renderStars from '@/components/ui/renderStars';

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

const TutorProfileHeaderDisplay = ({ tutor, isOwner }) => {
  const { t } = useTranslation();
  const { isInWishlist, handleWishlistToggle } = useWishlistLogic(tutor);

  const averageRating =
    tutor.subjects?.reduce((sum, subject) => sum + (subject.rating || 0), 0) /
    (tutor.subjects?.length || 1);

  return (
    <>
      <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
        <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
          <img
            src={getBannerUrl(tutor) || '/banner.png'}
            alt={tutor.name ? tutor.name : t('bannerAlt', 'Banner image')}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <ProfileSection
            tutor={tutor}
            isInWishlist={isInWishlist}
            handleWishlistToggle={handleWishlistToggle}
            averageRating={averageRating}
            t={t}
          />

          <DetailsSection tutor={tutor} t={t} />
        </CardContent>
      </Card>
    </>
  );
};

const ProfileSection = ({ tutor, isInWishlist, handleWishlistToggle, averageRating, t }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
      <div className="w-40 h-40 border-2 border-primary rounded-md shadow-lg">
        <Avatar className="w-full h-full rounded-sm">
          <AvatarImage
            src={getAvatarSrc(tutor) || ''}
            alt={tutor.name ? tutor.name : t('avatarAlt', 'Tutor avatar')}
            onError={(e) => {
              e.currentTarget.onerror = null;
            }}
          />
          <AvatarFallback className="text-3xl rounded-sm">
            {tutor.name?.split(' ').map((n) => n[0]).join('') || ''}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-primary">{tutor.name}</h1>

        <div className="text-sm text-muted-foreground flex justify-center items-center gap-1">
          {typeof averageRating === 'number' && !isNaN(averageRating) ? (
            averageRating > 0 ? (
              <>
                {renderStars(averageRating)} <span>({averageRating.toFixed(1)})</span>
              </>
            ) : (
              <span>{t('noReviews', 'No reviews')}</span>
            )
          ) : (
            <span>{t('noRating', 'No rating')}</span>
          )}
        </div>

        {tutor.governate && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {t(`constants.Governates.${tutor.governate}`, { defaultValue: tutor.governate })}
            , {t(tutor.district && `constants.Districts.${tutor.district}`)}
          </div>
        )}
      </div>

      <SocialButtons isInWishlist={isInWishlist} handleWishlistToggle={handleWishlistToggle} socialMedia={tutor.social_media} t={t} />
    </div>
  </motion.div>
);

const SocialButtons = ({ isInWishlist, handleWishlistToggle, socialMedia, t }) => {
  const processedSocialMedia = { ...(socialMedia || {}) };

  if (processedSocialMedia.whatsapp) {
    let whatsappNumber = processedSocialMedia.whatsapp.trim();
    if (!whatsappNumber.startsWith('+20')) {
      whatsappNumber = whatsappNumber.replace(/^0+/, '');
      whatsappNumber = `+20${whatsappNumber}`;
    }
    if (!whatsappNumber.startsWith('http')) {
      whatsappNumber = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
    }
    processedSocialMedia.whatsapp = whatsappNumber;
  }

  return (
    <div className="max-w-full space-y-2 w-full">
      <Button className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 transition-colors">
        <MessageSquare size={18} />
        {t('contactTutor', 'Contact tutor')}
      </Button>

      <Button
        variant="outline"
        className={cn(
          'w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap',
          isInWishlist ? 'text-accent border-accent hover:bg-accent/10' : 'text-primary border-primary'
        )}
        onClick={handleWishlistToggle}
      >
        <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
        {isInWishlist ? t('removeFromWishlist', 'Remove from wishlist') : t('addToWishlist', 'Add to wishlist')}
      </Button>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {Object.entries(processedSocialMedia || {}).map(([key, url]) => {
          if (!url) return null;
          const Icon = socialIcons[key];
          return Icon ? (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon size={20} />
            </a>
          ) : null;
        })}
      </div>
    </div>
  );
};

const DetailsSection = ({ tutor, t }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left"
  >
    <div className="flex flex-col md:flex-row w-full gap-6 justify-between">
      <ExperienceLocationSection tutor={tutor} t={t} />
      <SubjectsDisplay tutor={tutor} t={t} />
    </div>

    <AboutMeSection aboutMe={tutor.about_me} t={t} />
  </motion.div>
);

const ExperienceLocationSection = ({ tutor, t }) => {
  const maxExperience = tutor.subjects?.reduce((max, subject) => Math.max(max, subject.years_experience || 0), tutor.experience_years || 0);

  return (
    <div className="space-y-6 w-full md:w-1/2">
      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('experience', 'Experience')}</h3>
        </div>

        <div className="space-y-2 pl-11">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-lg">
              {maxExperience} {t('years', 'years')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('location', 'Location')}</h3>
        </div>

        <div className="space-y-2 pl-11 rtl:text-right">
          {tutor.address ? (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground flex-1">{tutor.address}</span>
            </div>
          ) : (
            <p className="text-muted-foreground italic">{t('locationNotSpecified', 'Location not specified')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

function SubjectsDisplay({ tutor = {}, t }) {
  const subjects = tutor.subjects || [];
  const { i18n } = useTranslation();
  const dir = i18n && typeof i18n.dir === 'function' ? i18n.dir() : 'ltr';
  const textAlign = dir === 'rtl' ? 'right' : 'left';

  const normalizeArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [String(value)];
  };

  // helper to translate values with multiple fallbacks
  const translateValue = (value, type) => {
    if (!value && value !== 0) return '';
    // direct subject mapping
    if (type === 'subject') {
      return t(`constants.Subjects.${value}`, { defaultValue: value });
    }
    if (type === 'grade') {
      return t(`constants.EducationStructure.National.grades.${value}`, { defaultValue: value });
    }
    if (type === 'system') {
      return t(`constants.Education_Systems.${value}`, { defaultValue: value });
    }
    if (type === 'sector') {
      return t(`constants.EducationStructure.National.sectors.${value}`, { defaultValue: value });
    }
    if (type === 'language') {
      // try national languages then generic Languages
      const national = t(`constants.EducationStructure.National.languages.${value}`, { defaultValue: null });
      if (national) return national !== 'null' ? national : t(`constants.Languages.${value}`, { defaultValue: value });
      return t(`constants.Languages.${value}`, { defaultValue: value });
    }
    // generic fallback
    return t(value, { defaultValue: value });
  };

  const Chips = ({ value, ariaLabel, type = 'generic' }) => {
    const items = normalizeArrayField(value);
    if (items.length === 0) {
      return <span className="font-medium text-xs" style={{ textAlign }}>{t('notSpecified', 'Not specified')}</span>;
    }

    return (
      <div
        className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full p-1"
        aria-label={ariaLabel}
        style={{ direction: dir }}
      >
        {items.map((it, i) => {
          const translated = (() => {
            if (type === 'sector') return translateValue(it, 'sector');
            if (type === 'language') return translateValue(it, 'language');
            if (type === 'subject') return translateValue(it, 'subject');
            if (type === 'grade') return translateValue(it, 'grade');
            return translateValue(it, 'generic');
          })();

          return (
            <span
              key={it + i}
              className="flex-shrink-0 text-[10px] px-2 py-1 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 backdrop-blur-sm whitespace-nowrap transition-all hover:scale-105 hover:border-primary/50"
              title={it}
              style={{ textAlign }}
            >
              {translated}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      dir={dir}
      style={{ direction: dir }}
      className={cn(
        'w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-4 z-10 border border-gray-200 dark:border-gray-700 rounded-l-md',
        'max-h-[400px] overflow-y-auto flex-1 min-w-0 md:max-w-xs mt-0 md:-mt-32'
      )}
    >
      <div
        className="text-lg font-semibold flex items-center gap-2 text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700"
        style={{ textAlign }}
      >
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
          <GraduationCap size={20} className="text-primary" />
        </div>
        {t('teachesSubjects', 'Teaches')}
      </div>

      {subjects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/70 dark:to-gray-800/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              style={{ direction: dir }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start' }}>
                <div className="p-1 rounded-md bg-primary/10" style={{ order: dir === 'rtl' ? 2 : 0 }}>
                  <GraduationCap size={16} className="text-primary shrink-0" />
                </div>
                <h4 className="text-base font-semibold truncate flex-1" style={{ textAlign }}>
                  {translateValue(subject.name, 'subject') || t('unnamedSubject', 'Unnamed subject')}
                </h4>
              </div>

              <div className="text-xs text-muted-foreground flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                      {t('System', 'System')}
                    </div>
                    <div className="font-medium truncate text-xs" style={{ textAlign }}>
                      {subject.education_system ? translateValue(subject.education_system, 'system') : t('notSpecified', 'Not specified')}
                    </div>
                  </div>

                  <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                      {t('Grade', 'Grade')}
                    </div>
                    <div className="font-medium truncate text-xs" style={{ textAlign }}>
                      {subject.grade ? translateValue(subject.grade, 'grade') : t('notSpecified', 'Not specified')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                      {t('Sector', 'Sector')}
                    </div>
                    <Chips value={subject.sector} ariaLabel={`${t('Sector', 'Sector')} for ${subject.name || ''}`} type="sector" />
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                      {t('Language', 'Language')}
                    </div>
                    <Chips value={subject.language} ariaLabel={`${t('Language', 'Language')} for ${subject.name || ''}`} type="language" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 bg-gradient-to-br from-gray-100/50 to-gray-200/30 dark:from-gray-700/30 dark:to-gray-800/20 flex flex-col items-center text-center text-muted-foreground gap-3" style={{ textAlign }}>
          <div className="p-2 rounded-full bg-primary/10">
            <GraduationCap size={32} className="text-primary/60" />
          </div>
          <p className="font-medium text-sm">{t('noSubjectsAdded', 'No subjects added')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subjectsWillAppear', 'Subjects will appear here once added')}</p>
        </div>
      )}
    </div>
  );
}

const AboutMeSection = ({ aboutMe, t }) => (
  <div className="w-full flex flex-col rtl:text-right">
    <Separator className="my-4" />
    <h2 className="text-xl font-semibold mb-2 text-primary rtl:text-right">{t('aboutMe', 'About me')}</h2>
    {aboutMe?.trim() ? (
      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-primary/30">{aboutMe}</p>
    ) : (
      <div className="border-2 border-dashed border-primary/20 rounded-xl bg-muted/40 p-6 w-full flex items-start gap-4 shadow-sm">
        <div className="text-3xl animate-pulse select-none">📝</div>
        <div className="flex-1">
          <p className="text-base font-semibold text-primary">{t('noBioAdded', 'No bio added')}</p>
        </div>
      </div>
    )}
  </div>
);

export default TutorProfileHeaderDisplay;
