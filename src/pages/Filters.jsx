import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, MessageSquare, Sparkles, GraduationCap, MapPin as MapPinIcon } from 'lucide-react';
import TutorGrid from '@/components/tutors/TutorGrid';
import HorizontalFilters from '@/components/tutors/HorizontalFilters';
import { mockTutors } from '@/data/enhanced';
import { useTutorFilterSort } from '@/hooks/useTutorFilterSort';
import { useNavigate } from 'react-router-dom';

const Filters = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  return (
    <div className=" ">
      <section className="space-y-6 container mx-auto px-4">
        <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center">{t('findYourTutor')}</motion.h2>
        <HorizontalFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          handleRateChange={handleRateChange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <TutorGrid tutors={sortedTutors} filters={filters} />
      </section>
    </div>
  );
};

export default Filters;