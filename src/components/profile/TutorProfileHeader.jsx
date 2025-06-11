import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, BookOpen, MessageSquare, Heart, Award, Building, GraduationCap} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import renderStars from '@/components/ui/renderStars';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const TutorProfileHeader = ({ tutor }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { authState } = useAuth();
  const { isLoggedIn } = authState;
  const isInWishlist = wishlist.some(item => item.id === tutor.id);

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
      <div className="relative h-48 md:h-64">
        <img
          src={tutor.bannerimg || 'https://placehold.co/600x400'}
          alt={tutor.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
        <div className="flex flex-col items-center gap-4 text-center -mt-20 md:mt-0 z-10">
          <div className="w-40 h-40  border-2 border-primary rounded-md shadow">
            <Avatar className="w-full h-full rounded-sm ">
              <AvatarImage src={tutor.img} alt={tutor.name} />
              <AvatarFallback className="text-3xl">
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

          <div className="w-full space-y-2">
            <Button className="w-full" onClick={handleContactClick}>
              <MessageSquare size={18} className="mr-2" /> {t('contactTutor')}
            </Button>
            <Button
              variant="outline"
              className={cn(
                "w-full",
                isInWishlist ? "text-accent border-accent hover:bg-accent/10" : "text-primary border-primary"
              )}
              onClick={handleWishlistToggle}
            >
              <Heart size={18} className="mr-2" fill={isInWishlist ? "currentColor" : "none"} />
              {isInWishlist ? t('removeFromWishlist') : t('addToWishlist')}
            </Button>
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
                      <span className="px-1 py-0.5 text-secondary border border-secondary bg-secondary/10 rounded-sm">
                        {subject.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>

  <div className="flex flex-col md:flex-row md:justify-start items-center gap-y-2 md:gap-y-0 md:gap-x-8 text-sm text-muted-foreground text-center md:text-left">
    <div className="flex items-center gap-2">
      <MapPin size={16} className="text-primary" />
      <span className="font-medium text-foreground">{t('basedInLocation', { location: tutor.location })}</span>
    </div>
    <div className="flex items-center gap-2">
      <Building size={16} className="text-primary" />
      <span className="font-medium text-foreground">{tutor.detailedLocation || t('detailedLocationNotSet')}</span>
    </div>
    <div className="flex items-center gap-2">
      <Award size={16} className="text-primary" />
      <span className="font-medium text-foreground">{t('yearsExp', { count: maxYearsExp })}</span>
    </div>
  </div>

  <Separator className="my-4" />

  <h2 className="text-xl font-semibold mb-2 text-primary">{t('aboutMe')}</h2>
  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-border max-w-prose">
    {tutor.GeneralBio || t('noBioAvailable')}
  </p>
</motion.div>

      </CardContent>
    </Card>
  );
};

export default TutorProfileHeader;
