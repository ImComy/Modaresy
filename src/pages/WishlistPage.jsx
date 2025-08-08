import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import TutorCard from '../components/tutors/GeneralTutorCard';
import { HeartOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const WishlistPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    wishlistTutors, 
    wishlistIds,
    refreshWishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist 
  } = useWishlist();

  // Refresh wishlist on mount and handle errors
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        await refreshWishlist();
      } catch (error) {
        toast({
          title: t('error'),
          description: t('failedToLoadWishlist'),
          variant: 'destructive'
        });
      }
    };
    loadWishlist();
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshWishlist();
      toast({
        title: t('success'),
        description: t('wishlistRefreshed'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToRefresh'),
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('myWishlist')}</h1>
          <p className="text-muted-foreground">
            {t('wishlistDescription', { count: wishlistIds.length })}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw size={16} />
          {t('refresh')}
        </Button>
      </section>

      {wishlistTutors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlistTutors.map((tutor) => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              isInWishlist={isInWishlist(String(tutor._id || tutor.id))}
              onToggleWishlist={async () => {
                const tutorId = String(tutor._id || tutor.id);
                try {
                  if (isInWishlist(tutorId)) {
                    await removeFromWishlist(tutorId);
                    toast({
                      title: t('removed'),
                      description: t('tutorRemovedFromWishlist'),
                    });
                  } else {
                    await addToWishlist(tutorId);
                    toast({
                      title: t('added'),
                      description: t('tutorAddedToWishlist'),
                    });
                  }
                } catch (error) {
                  toast({
                    title: t('error'),
                    description: error.message,
                    variant: 'destructive'
                  });
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg bg-muted/30">
          <HeartOff size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t('wishlistEmptyTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('wishlistEmptyDesc')}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WishlistPage;