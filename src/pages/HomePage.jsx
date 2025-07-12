import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { mockTutors } from '@/data/enhanced';
import { useTutorFilterSort } from '@/hooks/useTutorFilterSort';
import TopTutors from '@/components/tutors/topTutors';
import HeroSection from '@/components/home/hero';
import ExploreSection from '@/components/home/explore';
import StatsSection from '@/components/home/stats';

const HomePage = () => {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    handleFilterChange,
    handleRateChange,
    sortBy,
    setSortBy,
    sortedTutors,
  } = useTutorFilterSort(mockTutors);

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl'; 
  return (
    <div className="">
      <div className="relative">
        <HeroSection />
        <div
        className={`absolute bottom-0 hidden lg:block w-[600px] ${
          isRTL ? 'left-0' : 'right-0'
        }`}>
          <StatsSection />
        </div>
      </div>
      <ExploreSection />
      <div className="block md:hidden"><StatsSection /></div>
      
      <section className="space-y-6 container mx-auto px-4">
        <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center">{t('TopTutors')}</motion.h2>
        <TopTutors tutors={mockTutors} />
      </section>
    </div>
  );
};

export default HomePage;