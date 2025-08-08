import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/components/ui/select';
import {
  Search, Filter, ArrowDownAZ, ArrowUpAZ, Star, DollarSign, Users, MapPin, BookText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockTutors } from '@/data/enhanced';
import { SearchableSelectContent } from '@/components/ui/searchSelect';

const LabelWithIcon = ({ icon: Icon, text, error = false }) => (
  <label className={`text-xs font-medium flex items-center gap-1 mb-1 ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
    <Icon size={12} className={`${error ? 'text-red-500' : 'text-muted-foreground'}`} />
    {text}
  </label>
);

const allSubjects = mockTutors.flatMap(t => t.subjects?.map(s => s.subject) || []);
const uniqueSubjects = Array.from(new Set(allSubjects));
const uniqueLocations = Array.from(new Set(mockTutors.map(t => t.location).filter(Boolean)));
const uniqueGrades = Array.from(new Set(mockTutors.flatMap(t => t.subjects?.map(s => s.grade) || [])));
const uniqueSectors = Array.from(new Set(mockTutors.flatMap(t => t.subjects?.map(s => s.type) || [])));

const SORT_OPTIONS = [
  { value: 'ratingDesc', icon: <Star className="w-5 h-5" />, label: 'sortByRatingDesc' },
  { value: 'rateAsc', icon: <DollarSign className="w-5 h-5" />, label: 'sortByRateAsc' },
  { value: 'nameAsc', icon: <ArrowDownAZ className="w-5 h-5" />, label: 'sortByNameAsc' },
  { value: 'nameDesc', icon: <ArrowUpAZ className="w-5 h-5" />, label: 'sortByNameDesc' },
];

const HorizontalFilters = ({ searchTerm, setSearchTerm, filters, setFilters, sortBy, setSortBy, triggerFilterUpdate }) => {
  const { t } = useTranslation();
  const [showAdditional, setShowAdditional] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [sortIndex, setSortIndex] = useState(SORT_OPTIONS.findIndex(opt => opt.value === sortBy));

  useEffect(() => setLocalFilters(filters), [filters]);
  useEffect(() => setSortIndex(SORT_OPTIONS.findIndex(opt => opt.value === sortBy)), [sortBy]);

  const handleInputChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    setFilters(updated);
    triggerFilterUpdate?.();
  };

  const handleSortCycle = () => {
    const nextIndex = (sortIndex + 1) % SORT_OPTIONS.length;
    setSortIndex(nextIndex);
    setSortBy(SORT_OPTIONS[nextIndex].value);
    triggerFilterUpdate?.();
  };

  const handleSliderChange = (value) => {
    const updated = { ...localFilters, rateRange: value };
    setLocalFilters(updated);
    setFilters(updated);
    triggerFilterUpdate?.();
  };

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.1
        }}
        className="mb-6 p-4 rounded-xl shadow-sm bg-card/80 backdrop-blur-sm border border-border/20"
      >
        <div className="flex flex-col gap-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Name Search */}
            <motion.div 
              className="relative col-span-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <LabelWithIcon icon={Search} text={t('searchByName')} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchByName')}
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    triggerFilterUpdate?.();
                  }}
                  className="pl-10 h-10 text-sm"
                />
              </div>
            </motion.div>

            {/* Subject Filter */}
            <motion.div 
              className="col-span-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <LabelWithIcon icon={BookText} text={t('subject')} error={localFilters.subject === 'none'} />
              <Select
                value={localFilters.subject || 'none'}
                onValueChange={(value) => handleInputChange('subject', value)}
              >
                <SelectTrigger
                  className={`h-10 text-sm w-full ${localFilters.subject === 'none' ? 'border-red-500' : ''}`}
                  error={localFilters.subject === 'none'}
                >
                  <SelectValue placeholder={t('searchBySubject')} />
                </SelectTrigger>
                <SearchableSelectContent
                  items={[
                    { value: 'none', label: t('none') },
                    ...uniqueSubjects.map((subject) => ({ value: subject, label: subject })),
                  ]}
                />
              </Select>
            </motion.div>

            {/* Grade Filter */}
            <motion.div 
              className="col-span-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LabelWithIcon icon={Users} text={t('grade')} error={localFilters.grade === 'none'} />
              <Select
                value={localFilters.grade || 'none'}
                onValueChange={(value) => handleInputChange('grade', value)}
              >
                <SelectTrigger
                  className={`h-10 text-sm w-full ${localFilters.grade === 'none' ? 'border-red-500' : ''}`}
                  error={localFilters.grade === 'none'}
                >
                  <SelectValue placeholder={t('searchByGrade')} />
                </SelectTrigger>
                <SearchableSelectContent
                  items={[
                    { value: 'none', label: t('none') },
                    ...uniqueGrades.map((grade) => ({ value: grade, label: grade })),
                  ]}
                />
              </Select>
            </motion.div>

            {/* Toggle Button */}
            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={() => setShowAdditional(prev => !prev)}
                className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 md:py-3 transition-all duration-300 border text-sm font-medium shadow-sm w-full
                  ${showAdditional
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border'}`}
              >
                <motion.span
                  animate={{ rotate: showAdditional ? 180 : 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="inline-flex"
                >
                  <Filter className="w-4 h-4" />
                </motion.span>
                <span className="transition-all duration-300">
                  {showAdditional ? t('hideAdditionalFilters') : t('additionalFilters')}
                </span>
              </button>
            </motion.div>
          </div>

          {/* Additional Filters */}
          <AnimatePresence>
            {showAdditional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { type: "spring", stiffness: 200, damping: 20 },
                    opacity: { duration: 0.2 }
                  }
                }}
                exit={{ 
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.2 },
                    opacity: { duration: 0.1 }
                  }
                }}
                className="overflow-hidden bg-muted/20 rounded-md border border-border/50 shadow-inner"
              >
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Location */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <LabelWithIcon icon={MapPin} text={t('location')} />
                      <Select
                        value={localFilters.location || 'all'}
                        onValueChange={(value) => handleInputChange('location', value)}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t('searchByLocation')} />
                        </SelectTrigger>
                        <SearchableSelectContent
                          items={[
                            { value: 'all', label: t('allLocations') },
                            ...uniqueLocations.map((location) => ({ value: location, label: location })),
                          ]}
                        />
                      </Select>
                    </motion.div>

                    {/* Sector */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <LabelWithIcon icon={Users} text={t('sector')} />
                      <Select
                        value={localFilters.sector || 'all'}
                        onValueChange={(value) => handleInputChange('sector', value)}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t('searchBySector')} />
                        </SelectTrigger>
                        <SearchableSelectContent
                          items={[
                            { value: 'all', label: t('allSectors') },
                            ...uniqueSectors.map((sector) => ({ value: sector, label: sector })),
                          ]}
                        />
                      </Select>
                    </motion.div>

                    {/* Min Rating */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <LabelWithIcon icon={Star} text={t('minRating')} />
                      <Select value={String(localFilters.minRating ?? 0)} onValueChange={value => handleInputChange('minRating', Number(value))}>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t('anyRating')} />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map(num => (
                            <SelectItem key={num} value={String(num)}>
                              {num === 0 ? t('anyRating') : `${num}+`} <Star className="inline ml-1 fill-secondary text-secondary" size={12} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Rate Range Slider */}
                    <motion.div
                      className="flex flex-col gap-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <LabelWithIcon icon={DollarSign} text={t('monthlyRateRange')} />
                      <Slider
                        min={50}
                        max={2000}
                        step={50}
                        value={localFilters.rateRange || [50, 2000]}
                        onValueChange={handleSliderChange}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {t('from')} {localFilters.rateRange?.[0] || 50} - {t('to')} {localFilters.rateRange?.[1] || 2000}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detached Sort & Rate Slider Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <motion.span 
            className="font-semibold text-2xl sm:text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t('Results')}
          </motion.span>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border"
              onClick={handleSortCycle}
              title={t(SORT_OPTIONS[sortIndex].label)}
            >
              <motion.div
                key={sortIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {SORT_OPTIONS[sortIndex].icon}
              </motion.div>
            </Button>
            <span className="text-sm text-muted-foreground">{t(SORT_OPTIONS[sortIndex].label)}</span>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default HorizontalFilters;