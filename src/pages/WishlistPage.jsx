import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import ShortTutorCard from '@/components/tutors/shortcard';
import { HeartOff } from 'lucide-react';

const WishlistPage = () => {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();

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
            {t('wishlistDescription', { count: wishlist.length })}
          </p>
        </div>
      </section>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((tutor) => (
            <ShortTutorCard key={tutor.id} tutor={tutor} />
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
