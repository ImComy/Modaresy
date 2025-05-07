import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import TutorCard from '@/components/tutors/TutorCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartOff } from 'lucide-react';
import { uniqueSubjectsSimple } from '@/data/mockTutors'; // Import subjects for filter

const WishlistPage = () => {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredWishlist = useMemo(() => {
    if (subjectFilter === 'all') {
      return wishlist;
    }
    return wishlist.filter(tutor => tutor.subject.toLowerCase() === subjectFilter);
  }, [wishlist, subjectFilter]);

  // Get unique subjects present in the current wishlist for the filter dropdown
  const wishlistSubjects = useMemo(() => {
      const subjects = new Set(wishlist.map(t => t.subject));
      return ['all', ...Array.from(subjects)];
  }, [wishlist]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }} // Simplified transition
      className="space-y-8"
    >
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('myWishlist')}</h1>
          <p className="text-muted-foreground">{t('wishlistDescription', { count: wishlist.length })}</p>
        </div>
          {wishlist.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-[180px]">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="h-10 text-sm w-full bg-background/50 border rounded-lg hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder={t('filterBySubject')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wishlistSubjects.map(subject => (
                      <SelectItem key={subject} value={subject.toLowerCase()} className="text-sm capitalize">
                        {subject === 'all' ? t('allSubjects') : subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}
      </section>

      {filteredWishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"> {/* Match grid from HomePage */}
          {filteredWishlist.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg bg-muted/30">
          <HeartOff size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{wishlist.length === 0 ? t('wishlistEmptyTitle') : t('noMatchingTutors')}</h2>
          <p className="text-muted-foreground">{wishlist.length === 0 ? t('wishlistEmptyDesc') : t('tryDifferentFilter')}</p>
        </div>
      )}
    </motion.div>
  );
};

export default WishlistPage;
