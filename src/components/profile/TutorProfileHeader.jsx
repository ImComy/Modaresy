
    import React from 'react';
    import { useTranslation } from 'react-i18next';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { MapPin, Clock, DollarSign, BookOpen, MessageSquare, Heart, Award, CalendarDays, Building } from 'lucide-react';
    import { Separator } from '@/components/ui/separator';
    import renderStars from '@/components/ui/renderStars';
    import { useWishlist } from '@/context/WishlistContext';
    import { useToast } from '@/components/ui/use-toast';
    import { cn } from '@/lib/utils';
    import { locations } from '@/data/formData';
    import { useAuth } from '@/context/AuthContext'; 

    const TutorProfileHeader = ({ tutor, isEditing, onInputChange }) => {
        const { t } = useTranslation();
        const { toast } = useToast();
        const navigate = useNavigate();
        const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
        const { authState } = useAuth(); // Use AuthContext
        const { isLoggedIn } = authState; // Get actual login state
        const isInWishlist = wishlist.some(item => item.id === tutor.id);

        const handleWishlistToggle = () => {
            if (isEditing) return;
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
                navigate('/login'); // Redirect to login page
            } else {
                // Placeholder for actual contact functionality
                alert("Contact functionality (e.g., opening chat) requires backend integration.");
                console.log("Initiate contact with tutor:", tutor.id, "User ID:", authState.userId);
            }
        };

        const teachingDaysString = tutor.teachingDays?.join(', ') || t('notSpecified');
        console.log('Banner URL:', tutor.bannerimg);
        console.log('Tutor Object:', tutor);
        return (
              <Card className="overflow-hidden shadow-lg bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10">
              <div className="relative h-40 md:h-60">
                {isEditing ? (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-none">
                  <span className="text-white text-xs text-center">{t('clickToChangeBanner')}</span>
                  <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imageData = event.target.result;
                      onInputChange('bannerimg', imageData);
                    };
                    reader.readAsDataURL(file);
                    }
                  }}
                  />
                </label>
                ) : (
                <img
                  src={tutor.bannerimg || 'https://placehold.co/600x400'}
                  alt={tutor.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
                )}
                {isEditing && (
                <img
                  src={tutor.bannerimg || 'https://placehold.co/600x400'}
                  alt={tutor.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
                )}
                {!isEditing && (
                <div className="bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
                )}
              </div>
              <CardContent className="p-6 md:p-8 md:flex md:items-start md:gap-8">
                <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col items-center md:items-start mb-6 md:mb-0 flex-shrink-0 md:w-48"
                >
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary mb-4 shadow-md rounded-md">
                  {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-none">
                    <span className="text-white text-xs text-center">{t('changePhoto')}</span>
                    <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const imageData = e.target.result;
                        onInputChange('img', imageData);
                      };
                      reader.readAsDataURL(file);
                      }
                    }}
                    />
                  </label>
                  )}
                  <AvatarImage src={tutor.img} alt={tutor.name} radius="rounded-md" />
                  <AvatarFallback className="text-4xl" radius="rounded-md">
                  {tutor.name?.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3 w-full">
                  {renderStars(tutor.rating, 20)}
                  <span className="text-muted-foreground text-sm font-medium">
                  {t('reviewsCount', { count: tutor.comments?.length || 0 })}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full mb-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isEditing}
                  onClick={handleContactClick}
                >
                  <MessageSquare size={18} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('contactTutor')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                  "w-full border-primary hover:bg-primary/10",
                  isInWishlist ? "text-accent border-accent hover:bg-accent/10" : "text-primary",
                  isEditing && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleWishlistToggle}
                  disabled={isEditing}
                >
                  <Heart
                  size={18}
                  className="mr-2 rtl:ml-2 rtl:mr-0"
                  fill={isInWishlist ? "currentColor" : "none"}
                  />
                  {isInWishlist ? t('removeFromWishlist') : t('addToWishlist')}
                </Button>
                </motion.div>

                <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex-grow space-y-4"
                >
                {isEditing ? (
                  <Input
                  value={tutor.name || ''}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  placeholder={t('tutorNamePlaceholder')}
                  className="text-3xl md:text-4xl font-bold tracking-tight h-auto p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tutor.name}</h1>
                )}
                <p className="text-xl text-primary font-semibold flex items-center gap-2 flex-wrap">
                  <BookOpen size={20} />
                  {t('teachesSubjects')}: {tutor.subjects?.join(', ') || t('notSpecified')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-muted-foreground text-sm md:text-base">
                  <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {isEditing ? (
                    <Select
                    value={tutor.location?.toLowerCase()}
                    onValueChange={(value) => onInputChange('location', value)}
                    >
                    <SelectTrigger className="h-8 text-xs border-dashed focus-visible:ring-1 focus-visible:ring-offset-1">
                      <SelectValue placeholder={t('selectLocation')} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                      <SelectItem
                        key={loc.value}
                        value={loc.value}
                        className="text-xs capitalize"
                      >
                        {loc.label}
                      </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  ) : (
                    <span>{t('basedInLocation', { location: tutor.location })}</span>
                  )}
                  </div>
                  <div className="flex items-center gap-1.5">
                  <Building size={16} />
                  {isEditing ? (
                    <Input
                    value={tutor.detailedLocation || ''}
                    onChange={(e) => onInputChange('detailedLocation', e.target.value)}
                    placeholder={t('detailedLocationPlaceholder')}
                    className="h-8 text-xs border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                    />
                  ) : (
                    <span>{tutor.detailedLocation || t('detailedLocationNotSet')}</span>
                  )}
                  </div>
                  <div className="flex items-center gap-1.5">
                  <Award size={16} />
                  {isEditing ? (
                    <Input
                    type="number"
                    value={tutor.yearsExp || 0}
                    onChange={(e) => onInputChange('yearsExp', parseInt(e.target.value) || 0)}
                    placeholder={t('years')}
                    className="h-8 text-xs w-20 border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                    />
                  ) : (
                    <span>{t('yearsExp', { count: tutor.yearsExp })}</span>
                  )}
                  </div>
                  <div className="flex items-center gap-1.5">
                  <DollarSign size={16} className="text-green-500" />
                  {isEditing ? (
                    <Input
                    type="number"
                    value={tutor.rate || 0}
                    onChange={(e) => onInputChange('rate', parseInt(e.target.value) || 0)}
                    placeholder={t('rate')}
                    className="h-8 text-xs w-24 border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                    />
                  ) : (
                    <span>{t('ratePerMonth', { rate: tutor.rate })}</span>
                  )}
                  </div>
                  <span className="flex items-center gap-1.5">
                  <Clock size={16} /> {t('durationMinutes', { duration: tutor.duration })}
                  </span>
                  <span className="flex items-center gap-1.5">
                  <CalendarDays size={16} /> {t('teachingDaysLabel')}: {teachingDaysString}
                  </span>
                </div>
                <Separator className="my-4" />
                <h2 className="text-xl font-semibold">{t('aboutMe')}</h2>
                {isEditing ? (
                  <Textarea
                  value={tutor.bio || ''}
                  onChange={(e) => onInputChange('bio', e.target.value)}
                  placeholder={t('bioPlaceholder')}
                  rows={5}
                  className="text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-offset-1"
                  />
                ) : (
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{tutor.bio}</p>
                )}
                </motion.div>
              </CardContent>
              </Card>
            );
    };

    export default TutorProfileHeader;
  