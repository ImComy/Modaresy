import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, MessageSquare, Sparkles, GraduationCap, MapPin as MapPinIcon, Grid, Map } from 'lucide-react';
import TutorGrid from '@/components/tutors/TutorGrid';
import HorizontalFilters from '@/components/tutors/HorizontalFilters';
import useTutorFilterSort from '@/hooks/useTutorFilterSort'; 
import { useNavigate } from 'react-router-dom';
import { GeneralTutorGrid } from '../components/tutors/GeneralTutorGrid';
import MapSearchPage from '@/components/map';

// Segmented Control Component
const ViewSegmentedControl = ({ value, onChange, ariaLabel = 'View Mode' }) => {
  const containerRef = useRef(null);
  const { t } = useTranslation();

  const options = [
    { value: 'grid', label: t('Grid View') || 'Grid', icon: Grid },
    { value: 'map', label: t('Map View') || 'Map', icon: Map },
  ];

  const activeIndex = options.findIndex((o) => o.value === value);
  
  const handleKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = activeIndex;
    if (e.key === 'ArrowRight') next = (activeIndex + 1) % options.length;
    if (e.key === 'ArrowLeft') next = (activeIndex - 1 + options.length) % options.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = options.length - 1;
    onChange(options[next].value);
    const btn = containerRef.current?.querySelectorAll('[role="tab"]')[next];
    btn && btn.focus();
  };

  const activeBg = `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))`;
  const inactiveText = 'hsl(var(--muted-foreground))';
  const activeText = 'hsl(var(--primary-foreground))';

  return (
    <div className="w-full flex justify-center mb-6">
      <div
        ref={containerRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="relative inline-flex rounded-full p-1"
        style={{
          background: 'hsl(var(--muted))',
          padding: 6,
          borderRadius: 9999,
          boxShadow: '0 2px 10px rgba(2,6,23,0.03)',
        }}
      >
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(opt.value)}
              className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none focus:outline-none"
              style={{
                background: 'transparent',
                color: active ? activeText : inactiveText,
                minWidth: 120,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontWeight: 600,
              }}
            >
              {active && (
                <motion.span
                  layoutId="view-segmented-pill"
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: activeBg,
                    zIndex: -1,
                    boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
                  }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}

              {opt.icon && <opt.icon size={16} style={{ color: 'inherit' }} />}
              <span style={{ pointerEvents: 'none' }}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Filters = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

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
    loadingTutors,
  } = useTutorFilterSort();

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

        {/* View Mode Toggle */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <ViewSegmentedControl
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="View mode selection"
          />
        </motion.div>

        <HorizontalFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          handleRateChange={handleRateChange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          subjectsOptions={subjectsOptions}
          gradesOptions={gradesOptions}
          sectorsOptions={sectorsOptions}
          governatesOptions={governatesOptions}
          districtsOptions={districtsOptions}
          languagesOptions={languagesOptions}
          educationSystemsOptions={educationSystemsOptions}
          educationCombos={educationCombos}
          setEducationFromCombo={setEducationFromCombo}
          parseCombo={parseCombo}
          loadingConstants={loadingConstants}
        />

        {/* Conditionally render Grid or Map view */}
        {viewMode === 'grid' ? (
          <TutorGrid tutors={sortedTutors} filters={filters} loading={loadingTutors} />
        ) : (
          <MapSearchPage tutors={sortedTutors} />
        )}
      </section>

      <section className="space-y-6 container mx-auto px-4 -mt-20">
        <motion.h2 variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="text-2xl md:text-3xl font-bold text-center mt-20">
          {t('RecommendedTutors')}
        </motion.h2>
        <GeneralTutorGrid tutors={sortedTutors} />
      </section>
    </div>
  );
};

export default Filters;