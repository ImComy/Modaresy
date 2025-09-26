import React, { useRef, useState, useEffect, useMemo } from 'react';
import { getAvatarSrc, getBannerUrl } from '@/api/imageService';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  BookOpen,
  MessageSquare,
  Heart,
  Award,
  GraduationCap,
  Star,
  BadgeCheck,
  Wallet,
} from 'lucide-react';
import { getPaymentIcon } from '@/data/payment';
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
import { useWishlistLogic } from '@/hooks/useWishlistActions';
import renderStars from '@/components/ui/renderStars';
import SubjectsDisplay from './SubjectSection';

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
    <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
      <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
        <img
          src={getBannerUrl(tutor) || '/banner.png'}
          alt={tutor.name ? tutor.name : t('bannerAlt', 'Banner image')}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.onerror = null; }}
        />
      </div>

      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 relative">
        <div className="w-full md:w-1/3">
          <ProfileSection
            tutor={tutor}
            isInWishlist={isInWishlist}
            handleWishlistToggle={handleWishlistToggle}
            averageRating={averageRating}
            t={t}
          />
        </div>

        <div className="w-full md:w-2/3">
          <DetailsSection tutor={tutor} t={t} />
        </div>
      </CardContent>

      <AboutMeSection aboutMe={tutor.about_me} t={t} />
    </Card>
  );
};

/* ---------------------------
   ProfileSection
   --------------------------- */
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
            onError={(e) => { e.currentTarget.onerror = null; }}
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
            {t(`constants.Governates.${tutor.governate}`, { defaultValue: tutor.governate })}, {t(tutor.district && `constants.Districts.${tutor.district}`)}
          </div>
        )}
      </div>

      <SocialButtons isInWishlist={isInWishlist} handleWishlistToggle={handleWishlistToggle} socialMedia={tutor.social_media} t={t} />
    </div>
  </motion.div>
);

/* ---------------------------
   SocialButtons
   --------------------------- */
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

/* ---------------------------
   DetailsSection (measures left column)
   --------------------------- */
const DetailsSection = ({ tutor, t }) => {
  const leftRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative flex flex-col md:flex-row w-full gap-6"
    >
      <div ref={leftRef} className="w-full md:w-1/2 flex-shrink-0">
        <ExperienceLocationSection tutor={tutor} t={t} />
      </div>

      <div className="w-full  flex flex-col">
        <div className="z-20">
          <SubjectsDisplay tutor={tutor} t={t} />
        </div>
      </div>
    </motion.div>
  );
};


/* ---------------------------
   ExperienceLocationSection
   --------------------------- */
const ExperienceLocationSection = ({ tutor, t }) => {
  const maxExperience = tutor.subjects?.reduce((max, subject) => Math.max(max, subject.years_experience || 0), tutor.experience_years || 0);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 border border-primary/20 rounded-md px-3 py-2 shadow-sm">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Award className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('experience', 'Experience')}
          </p>
          <p className="text-base font-semibold text-primary">
            {maxExperience} {t('years', 'years')}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 bg-white/50 dark:bg-gray-800/50 border border-primary/20 rounded-md px-3 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('location', 'Location')}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">
            {tutor.address ? tutor.address : <span className="italic text-muted-foreground">{t('locationNotSpecified', 'Location not specified')}</span>}
          </p>
        </div>
      </div>

      <PaymentDisplay tutor={tutor} t={t} />
    </div>
  );
};

/* ---------------------------
   PaymentDisplay
   --------------------------- */
const PaymentDisplay = ({ tutor, t }) => {
  const timing = tutor?.payment_timing || '';
  const methods = Array.isArray(tutor?.payment_methods) ? tutor.payment_methods : (tutor?.payment_methods ? [tutor.payment_methods] : []);

  return (
    <div className="p-4 bg-muted/20 rounded-xl border border-muted space-y-2">
      <div className="flex items-center gap-2 text-primary font-medium mb-2">
        <BadgeCheck size={20} className="text-blue-600" />
        <span>{t('paymentInfo', 'Payment Information')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-muted shadow-sm">
          <Wallet size={16} className="text-purple-600" />
          <span className="text-primary font-medium">
            {t('paymentTiming', 'Payment:')}{" "}
            <span className="font-bold text-foreground">
              {timing ? t(`constants.PaymentTimings.${timing}`, { defaultValue: timing }) : t('notSpecified', 'Not specified')}
            </span>
          </span>
        </div>

        {methods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {methods.map((method, idx) => {
              const Icon = getPaymentIcon(method);
              return (
                <div key={`${String(method)}-${idx}`} className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-muted shadow-sm">
                  {Icon ? <Icon size={14} /> : null}
                  <span>{t(`constants.PaymentMethods.${method}`, { defaultValue: method })}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------
   AboutMeSection
   --------------------------- */
const AboutMeSection = ({ aboutMe, t }) => (
  <div className="w-full flex flex-col rtl:text-right p-10 -mt-16">
    <Separator className="my-4" />
    <h2 className="text-xl font-semibold mb-2 text-primary rtl:text-right">{t('aboutMe', 'About me')}</h2>
    {aboutMe?.trim() ? (
      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-primary/30">{aboutMe}</p>
    ) : (
      <div className="border-2 border-dashed border-primary/20 rounded-xl bg-muted/40 p-6 w-full flex items-center gap-4 shadow-sm">
        <div className="text-3xl animate-pulse select-none">📝</div>
        <div className="flex-1">
          <p className="text-base font-semibold text-primary">{t('noBioAdded', 'No bio added')}</p>
        </div>
      </div>
    )}
  </div>
);

export default TutorProfileHeaderDisplay;
