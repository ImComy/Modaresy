// Filters.jsx
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, MessageSquare, Sparkles, GraduationCap, MapPin as MapPinIcon } from 'lucide-react';
import TutorGrid from '@/components/tutors/TutorGrid';
import HorizontalFilters from '@/components/tutors/HorizontalFilters';
import { mockTutors } from '@/data/enhanced';
import useTutorFilterSort from '@/hooks/useTutorFilterSort'; 
import { useNavigate } from 'react-router-dom';
import { GeneralTutorGrid } from '../components/tutors/GeneralTutorGrid';

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

    subjectsOptions,
    gradesOptions,
    sectorsOptions,
    governatesOptions,
    districtsOptions,
    languagesOptions,
    educationSystemsOptions,
    educationCombos,

    setEducationFromCombo,
    parseCombo,

    loadingConstants,
  } = useTutorFilterSort(mockTutors);

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  return (
    <div className="flex flex-col gap-20 ">
      <section className="space-y-6 container mx-auto px-4">
        <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center">
          {t('findYourTutor')}
        </motion.h2>

        <HorizontalFilters
          // core state
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          handleRateChange={handleRateChange}
          sortBy={sortBy}
          setSortBy={setSortBy}

          // options from backend/hook
          subjectsOptions={subjectsOptions}
          gradesOptions={gradesOptions}
          sectorsOptions={sectorsOptions}
          governatesOptions={governatesOptions}
          districtsOptions={districtsOptions}
          languagesOptions={languagesOptions}
          educationSystemsOptions={educationSystemsOptions}
          educationCombos={educationCombos}

          // combined combo helpers
          setEducationFromCombo={setEducationFromCombo}
          parseCombo={parseCombo}

          // loading
          loadingConstants={loadingConstants}
        />

        <TutorGrid tutors={sortedTutors} filters={filters} />
      </section>

      <section className="space-y-6 container mx-auto px-4 -mt-20">
        <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center mt-20">
          {t('RecommendedTutors')}
        </motion.h2>
        <GeneralTutorGrid tutors={mockTutors} />
      </section>
    </div>
  );
};

export default Filters;
