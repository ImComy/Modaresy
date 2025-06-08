import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, MapPin, BookOpen, Star, GraduationCap, Users, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { uniqueSubjectsSimple, uniqueLocationsSimple } from '@/data/mockTutors';
import { grades, sectors } from '@/data/formData';
import { CheckCircle } from 'lucide-react';

const FILTER_KEYS = [
  'subject',
  'location',
  'grade',
  'sector',
  'minRating',
  'rateRange',
  'sortBy'
];

const getDefaultFilters = () => ({
  subject: 'none',
  location: 'all',
  grade: 'none',
  sector: 'all',
  minRating: 0,
  rateRange: [50, 2000],
});

const HorizontalFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters, 
  handleFilterChange,
  handleRateChange,
  sortBy,
  setSortBy,
  triggerFilterUpdate
}) => {
  const { t } = useTranslation();
  const gradeOptions = [{ value: 'none', labelKey: 'none' }, ...grades];
  const subjectOptions = [...uniqueSubjectsSimple];
  const locationOptions = [...uniqueLocationsSimple];
  const sectorOptions = [{ value: 'all', labelKey: 'allSectors' }, ...sectors];

  // Only run localStorage load on first mount
  const didInit = useRef(false);
  const [tempFilters, setTempFilters] = useState(filters);

    useEffect(() => {
    setTempFilters(filters); 
  }, [filters]);
 
    const onTempFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  // For rate slider changes:
  const onTempRateChange = (value) => {
    setTempFilters(prev => ({ ...prev, rateRange: value }));
  };

  // Apply button handler
  const applyFilters = () => {
    setFilters(tempFilters);
    if (typeof triggerFilterUpdate === 'function') triggerFilterUpdate();
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Load from localStorage
    const stored = {};
    FILTER_KEYS.forEach(key => {
      let val = localStorage.getItem(`filter-${key}`);
      if (val !== null) {
        if (key === 'rateRange') {
          try {
            val = JSON.parse(val);
          } catch {
            val = [50, 2000];
          }
        } else if (key === 'minRating') {
          val = Number(val);
        }
        stored[key] = val;
      }
    });

    const merged = { ...getDefaultFilters(), ...stored };
    setFilters(merged);
    if (stored.sortBy) setSortBy(stored.sortBy);

    if (typeof triggerFilterUpdate === 'function') triggerFilterUpdate();
  }, []);

  // Save filters (except searchTerm) to localStorage on change
  useEffect(() => {
    FILTER_KEYS.forEach(key => {
      let val = filters[key];
      if (key === 'rateRange') {
        localStorage.setItem(`filter-rateRange`, JSON.stringify(val));
      } else if (val !== undefined) {
        localStorage.setItem(`filter-${key}`, val);
      }
    });
    localStorage.setItem('filter-sortBy', sortBy);
  }, [filters, sortBy]);

  const handleReset = () => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setSortBy('ratingDesc');
    setSearchTerm('');
    FILTER_KEYS.forEach(key => localStorage.removeItem(`filter-${key}`));
    localStorage.removeItem('filter-sortBy');
    if (typeof triggerFilterUpdate === 'function') triggerFilterUpdate();
  };;

  // Placeholders from translation only
  const placeholders = {
    subject: t('none'),
    location: t('allLocations'),
    grade: t('none'),
    sector: t('allSectors'),
    minRating: t('anyRating'),
    sortBy: t('sortBy'),
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-8 p-4 rounded-lg shadow-sm bg-card/80 backdrop-blur-sm border border-border/20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
        {/* Search input remains controlled by searchTerm / setSearchTerm */}
        <div className="relative md:col-span-2 lg:col-span-1 xl:col-span-2">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pr-10 rtl:pl-3 h-10 text-sm"
          />
        </div>

        {/* Subject Filter */}
        <div>
          <label
            className={`text-xs font-medium flex items-center mb-1 ${
              tempFilters.subject === 'none'
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            <BookOpen size={12} className="mr-1 rtl:ml-1" />{t('subject')}
          </label>
          <Select
            value={tempFilters.subject}
            onValueChange={(value) => onTempFilterChange('subject', value)}
          >
            <SelectTrigger
              className={`h-10 text-sm w-full ${
                tempFilters.subject === 'none' ? 'border-red-600 focus:ring-red-600' : ''
              }`}
            >
              <SelectValue placeholder={placeholders.subject} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('none')}</SelectItem>
              {subjectOptions
                .filter(subject => subject.toLowerCase() !== 'all' && subject.toLowerCase() !== 'none')
                .map(subject => (
                  <SelectItem key={subject} value={subject.toLowerCase()} className="capitalize">
                    {subject}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center mb-1">
            <MapPin size={12} className="mr-1 rtl:ml-1" />{t('location')}
          </label>
          <Select
            value={tempFilters.location}
            onValueChange={(value) => onTempFilterChange('location', value)}
          >
            <SelectTrigger className="h-10 text-sm w-full">
              <SelectValue placeholder={placeholders.location} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLocations')}</SelectItem>
              {locationOptions
                .filter(location => location.toLowerCase() !== 'all')
                .map(location => (
                  <SelectItem key={location} value={location.toLowerCase()} className="capitalize">
                    {location}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Filter */}
        <div>
          <label
            className={`text-xs font-medium flex items-center mb-1 ${
              tempFilters.grade === 'none'
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            <GraduationCap size={12} className="mr-1 rtl:ml-1" />{t('grade')}
          </label>
          <Select
            value={tempFilters.grade}
            onValueChange={(value) => onTempFilterChange('grade', value)}
          >
            <SelectTrigger
              className={`h-10 text-sm w-full ${
                tempFilters.grade === 'none' ? 'border-red-600 focus:ring-red-600' : ''
              }`}
            >
              <SelectValue placeholder={placeholders.grade} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('none')}</SelectItem>
              {grades.map(grade => (
                <SelectItem key={grade.value} value={grade.value}>
                  {t(grade.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center mb-1">
            <Users size={12} className="mr-1 rtl:ml-1" />{t('sector')}
          </label>
          <Select
            value={tempFilters.sector}
            onValueChange={(value) => onTempFilterChange('sector', value)}
          >
            <SelectTrigger className="h-10 text-sm w-full">
              <SelectValue placeholder={placeholders.sector} />
            </SelectTrigger>
            <SelectContent>
              {sectorOptions.map(sector => (
                <SelectItem key={sector.value} value={sector.value}>
                  {t(sector.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center mb-1">
            <Star size={12} className="mr-1 rtl:ml-1" />{t('minRating')}
          </label>
          <Select
            value={String(tempFilters.minRating)}
            onValueChange={(value) => onTempFilterChange('minRating', Number(value))}
          >
            <SelectTrigger className="h-10 text-sm w-full">
              <SelectValue placeholder={placeholders.minRating} />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={String(num)}>
                  {num === 0 ? t('anyRating') : `${num}+`} <Star size={12} className="inline ml-1 fill-secondary text-secondary" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('sortBy')}</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 text-sm w-full">
              <SelectValue placeholder={placeholders.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ratingDesc">{t('sortByRatingDesc')}</SelectItem>
              <SelectItem value="rateAsc">{t('sortByRateAsc')}</SelectItem>
              <SelectItem value="rateDesc">{t('sortByRateDesc')}</SelectItem>
              <SelectItem value="nameAsc">{t('sortByNameAsc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rate Slider */}
        <div className="col-span-full md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            {t('monthlyRate', { min: tempFilters.rateRange[0], max: tempFilters.rateRange[1] })}
          </label>
          <Slider
            min={50}
            max={2000}
            step={50}
            value={tempFilters.rateRange}
            onValueChange={onTempRateChange}
            className="mt-3 mb-1"
          />
        </div>

        {/* Apply and Reset Buttons */}

          <Button
            onClick={applyFilters}
            variant="outline"
            className="w-full text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 py-2 rounded-md font-semibold"
          >
            <CheckCircle size={18} />
            {t('applyFilters')}
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 py-2 rounded-md font-semibold"
          >
            <XCircle size={18} />
            {t('resetFilters')}
          </Button>
      </div>
    </motion.div>
  );
};

export default HorizontalFilters;