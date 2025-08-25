import React, { useState, useEffect } from 'react';
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
// import ReportButton from '@/components/report';
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

  // Calculate average rating from all subjects
  const averageRating = tutor.subjects?.reduce((sum, subject) => {
    return sum + (subject.rating || 0);
  }, 0) / (tutor.subjects?.length || 1);

  return (
    <>
      <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
        {/* Banner Image */}
        <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
          {/* {!isOwner && (
            <div className="absolute top-4 right-4 z-20">
              <ReportButton tutorId={tutor._id} />
            </div>
          )} */}
          <img
            src={
              getBannerUrl(tutor) || 'https://placehold.co/600x200?text=Tutor+Banner'
            }
            alt={tutor.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x200?text=Tutor+Banner';
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Left Column - Profile Picture and Basic Info */}
          <ProfileSection 
            tutor={tutor}
            isInWishlist={isInWishlist}
            handleWishlistToggle={handleWishlistToggle}
            averageRating={averageRating}
            t={t}
          />

          {/* Right Column - Detailed Information */}
          <DetailsSection
            tutor={tutor}
            t={t}
          />
        </CardContent>
      </Card>
    </>
  );
};

// Extracted sub-components
const ProfileSection = ({ tutor, isInWishlist, handleWishlistToggle, averageRating, t }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
      <div className="w-[170px] h-40 border-2 border-primary rounded-md shadow-lg">
        <Avatar className="w-full h-full rounded-sm">
          <AvatarImage
            src={getAvatarSrc(tutor) || ''}
            alt={tutor.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
            }}
          />
          <AvatarFallback className="text-3xl rounded-sm">
            {tutor.name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-primary">{tutor.name}</h1>
        
        {/* Rating Display */}
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
            t('noRating')
          )}
        </div>
        
        {/* Location Display */}
        {tutor.governate && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {tutor.governate}
            {tutor.district && `, ${tutor.district}`}
          </div>
        )}
      </div>

      <SocialButtons 
        isInWishlist={isInWishlist}
        handleWishlistToggle={handleWishlistToggle}
        socialMedia={tutor.social_media}
        t={t}
      />
    </div>
  </motion.div>
);

const SocialButtons = ({ isInWishlist, handleWishlistToggle, socialMedia, t }) => (
  <div className="max-w-full space-y-2 w-full">
    <Button className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 transition-colors">
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
      {Object.entries(socialMedia || {}).map(([key, url]) => {
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
);

const DetailsSection = ({ tutor, t }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left"
  >
    <div className="flex flex-col md:flex-row w-full gap-6 justify-between">
      <ExperienceLocationSection 
        tutor={tutor}
        t={t}
      />
      
      <SubjectsDisplay 
        tutor={tutor}
        t={t}
      />
    </div>

    <AboutMeSection 
      aboutMe={tutor.about_me}
      t={t}
    />
  </motion.div>
);

const ExperienceLocationSection = ({ tutor, t }) => {
  // Calculate max experience from subjects
  const maxExperience = tutor.subjects?.reduce((max, subject) => {
    return Math.max(max, subject.years_experience || 0);
  }, tutor.experience_years || 0);

  return (
    <div className="space-y-6 w-full md:w-1/2">
      {/* Experience Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('experience')}</h3>
        </div>
        
        <div className="space-y-2 pl-11">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-lg">
              {maxExperience} {t('years')}
            </span>
            {tutor.subjects?.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({t('highestAmongSubjects')})
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Location Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-primary ">{t('location')}</h3>
        </div>
        
        <div className="space-y-2 pl-11  rtl:text-right">
          {tutor.address ? (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground flex-1">
                {tutor.address}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              {t('locationNotSpecified')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SubjectsDisplay = ({ tutor, t }) => {
  const subjects = tutor.subjects || [];

  return (
    <div className={cn(
      "w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30",
      "max-h-[400px] overflow-y-auto flex-1 min-w-0 md:max-w-xs mt-0 md:-mt-32"
    )}>
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
        <GraduationCap size={20} />
        {t('teachesSubjects')}
      </div>

      {subjects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-primary/20 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap size={18} className="text-primary shrink-0" />
                <h4 className="text-base font-semibold">
                  {subject.name || t('unnamedSubject')}
                </h4>
              </div>
              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span>{t('System')}:</span>
                    <span className="font-medium">
                      {subject.education_system || t('notSpecified')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{t('Grade')}:</span>
                    <span className="font-medium">
                      {subject.grade || t('notSpecified')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span>{t('Sector')}:</span>
                    <span className="font-medium">
                      {subject.sector || t('notSpecified')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{t('Language')}:</span>
                    <span className="font-medium">
                      {subject.language || t('notSpecified')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/20 flex flex-col items-center text-center text-muted-foreground gap-3">
          <GraduationCap size={40} className="text-primary/50" />
          <p className="font-medium text-sm">{t('noSubjectsAdded')}</p>
        </div>
      )}
    </div>
  );
};

const AboutMeSection = ({ aboutMe, t }) => (
  <div className="w-full flex flex-col  rtl:text-right">
    <Separator className="my-4" />
    <h2 className="text-xl font-semibold mb-2 text-primary rtl:text-right">{t('aboutMe')}</h2>
    {aboutMe?.trim() ? (
      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-primary/30">
        {aboutMe}
      </p>
    ) : (
      <div className="border-2 border-dashed border-primary/20 rounded-xl bg-muted/40 p-6 w-full flex items-start gap-4 shadow-sm">
        <div className="text-3xl animate-pulse select-none">📝</div>
        <div className="flex-1">
          <p className="text-base font-semibold text-primary">{t('noBioAdded')}</p>
        </div>
      </div>
    )}
  </div>
);

export default TutorProfileHeaderDisplay;