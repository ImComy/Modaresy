import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, BookOpen, MessageSquare, Heart, Award, Building, GraduationCap,   Star,} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
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

const socialIcons = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  telegram: FaTelegramPlane,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  website: FaGlobe,
};

const TutorProfileHeader = ({ tutor }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { authState } = useAuth();
  const isInWishlist = wishlist.some(item => item.id === tutor.id);
  const { isLoggedIn, userId } = authState;
  const { id } = useParams();
  const isOwner = isLoggedIn && userId === parseInt(id);

  const handleWishlistToggle = () => {
    if (!isLoggedIn) {
      toast({ title: t('loginRequiredTitle'), description: t('loginRequiredWishlist'), variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (isInWishlist) {
      removeFromWishlist(tutor.id);
      toast({ title: t('wishlistRemoved'), description: `${tutor.name} ${t('hasBeenRemoved', { context: 'female' })}.` });
    } else {
      addToWishlist(tutor);
      toast({ title: t('wishlistAdded'), description: `${tutor.name} ${t('hasBeenAdded', { context: 'female' })}.` });
    }
  };

  const handleContactClick = () => {
    if (!isLoggedIn) {
      toast({ title: t('loginRequiredTitle'), description: t('loginRequiredContact'), variant: 'destructive' });
      navigate('/login');
    } else {
      alert("Contact functionality (e.g., opening chat) requires backend integration.");
    }
  };

  const allRatings = tutor.subjects?.map(s => s.rating).filter(r => typeof r === 'number' && isFinite(r));
  const averageRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : null;
  const maxYearsExp = Math.max(...(tutor.subjects?.map(s => s.yearsExp || 0) || [0]));

  return (
    <Card className=" shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
    <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
    <img
      src={
        tutor.bannerimg instanceof File
          ? URL.createObjectURL(tutor.bannerimg)
          : tutor.bannerimg || 'https://placehold.co/600x400'
      }
      alt={tutor.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = 'https://placehold.co/600x400';
      }}
    />
      {/* Current Achievements on banner */}
      <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-2">
        {tutor.achievements
          ?.filter(a => a.isCurrent)
          .map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full shadow border backdrop-blur",
                achievement.type === 'topRated'
                  ? "bg-yellow-100 text-yellow-900 border-yellow-300"
                  : "bg-purple-100 text-purple-900 border-purple-300"
              )}
            >
              {achievement.type === 'topRated' && <Star size={14} className="text-yellow-500" />}
              {achievement.type === 'monthlyTop' && <Award size={14} className="text-purple-500" />}
              <span>{achievement.label}</span>
            </motion.div>
          ))}
      </div>
    </div>
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
            <div className="w-40 h-40 border-2 border-primary rounded-md shadow">
              <Avatar className="w-full h-full rounded-sm ">
                <AvatarImage
                  src={
                    tutor.img instanceof File
                      ? URL.createObjectURL(tutor.img)
                      : tutor.img
                  }
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
                className="w-full h-10 flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={handleContactClick}
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

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2 space-y-4 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="text-lg font-semibold flex items-center gap-2 text-primary">
            <BookOpen size={20} />
            {t('teachesSubjects')}:
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {tutor.subjects.map((subject, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 rounded-md border text-xs text-primary border-primary bg-primary/10"
              >
                <GraduationCap size={12} />
                <span>{subject.subject} - {subject.grade}</span>
                {subject.type && (
                  <span className="px-1 py-0.5 text-green-700 border border-green-300 bg-green-200 rounded-sm">
                    {subject.type}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm text-muted-foreground w-full">
            {/* Experience */}
            <div className="flex items-start gap-2">
              <Award size={16} className="mt-0.5 text-primary shrink-0" />
              <span className="font-medium text-foreground break-words">
                {isFinite(maxYearsExp) && maxYearsExp > 0
                  ? t('yearsExp', { count: maxYearsExp })
                  : t('noExperience', 'Experience not specified')}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
              <span className="font-medium text-foreground break-words">
                {t('basedInLocation', {
                  location: tutor.location || t('noLocation', 'Location not specified'),
                })}
              </span>
            </div>

            {/* Detailed Locations - Wrap-responsive cloud */}
            <div className="flex items-start gap-2">
              <Building size={16} className="mt-0.5 text-primary shrink-0" />
              {Array.isArray(tutor.detailedLocation) && tutor.detailedLocation.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-w-full">
                  {tutor.detailedLocation.map((location, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border whitespace-nowrap  transition"
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

          <Separator className="my-4" />

          <h2 className="text-xl font-semibold mb-2 text-primary">{t('aboutMe')}</h2>
          {tutor.GeneralBio?.trim() ? (
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-border max-w-prose">
              {tutor.GeneralBio}
            </p>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-5 bg-muted/30 text-muted-foreground flex items-center gap-3 max-w-prose">
              <span className="text-xl">📝</span>
              <div>
                <p className="text-sm font-medium">{t('noBioTitle', 'No bio available')}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {t('noBioDescription', 'This tutor hasn’t added a personal bio yet.')}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TutorProfileHeader;