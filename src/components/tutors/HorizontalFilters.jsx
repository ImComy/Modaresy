
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Slider } from '@/components/ui/slider';
    import { Button } from '@/components/ui/button';
    import { Search, MapPin, BookOpen, Star, GraduationCap, Users } from 'lucide-react'; // Added GraduationCap, Users
    import { useTranslation } from 'react-i18next';
    import { uniqueSubjectsSimple, uniqueLocationsSimple } from '@/data/mockTutors'; // Use simple arrays
    import { grades, sectors } from '@/data/formData'; // Import grades and sectors

    const HorizontalFilters = ({
      searchTerm,
      setSearchTerm,
      filters,
      handleFilterChange,
      handleRateChange,
      sortBy,
      setSortBy
    }) => {
      const { t } = useTranslation();

      // Prepare options for filters
      const subjectOptions = ['all', ...uniqueSubjectsSimple];
      const locationOptions = ['all', ...uniqueLocationsSimple];
      const gradeOptions = [{ value: 'all', labelKey: 'allGrades' }, ...grades];
      const sectorOptions = [{ value: 'all', labelKey: 'allSectors' }, ...sectors]; // Add 'allSectors' key

      return (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8 p-4 rounded-lg shadow-sm bg-card/80 backdrop-blur-sm border border-border/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
            {/* Search */}
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

            {/* Subject */}
            <div>
              <label htmlFor="subject-filter-h" className="text-xs font-medium text-muted-foreground flex items-center mb-1"><BookOpen size={12} className="mr-1 rtl:ml-1"/>{t('subject')}</label>
              <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                <SelectTrigger id="subject-filter-h" className="h-10 text-sm w-full">
                  <SelectValue placeholder={t('allSubjects')} />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(subject => (
                    <SelectItem key={subject} value={subject.toLowerCase()} className="text-sm capitalize">
                      {subject === 'all' ? t('allSubjects') : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location-filter-h" className="text-xs font-medium text-muted-foreground flex items-center mb-1"><MapPin size={12} className="mr-1 rtl:ml-1"/>{t('location')}</label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger id="location-filter-h" className="h-10 text-sm w-full">
                  <SelectValue placeholder={t('allLocations')} />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map(location => (
                    <SelectItem key={location} value={location.toLowerCase()} className="text-sm capitalize">
                      {location === 'all' ? t('allLocations') : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

             {/* Grade */}
             <div>
               <label htmlFor="grade-filter-h" className="text-xs font-medium text-muted-foreground flex items-center mb-1"><GraduationCap size={12} className="mr-1 rtl:ml-1"/>{t('grade')}</label>
               <Select value={filters.grade} onValueChange={(value) => handleFilterChange('grade', value)}>
                 <SelectTrigger id="grade-filter-h" className="h-10 text-sm w-full">
                   <SelectValue placeholder={t('allGrades')} />
                 </SelectTrigger>
                 <SelectContent>
                   {gradeOptions.map(grade => (
                     <SelectItem key={grade.value} value={grade.value} className="text-sm">
                       {t(grade.labelKey)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

             {/* Sector */}
             <div>
               <label htmlFor="sector-filter-h" className="text-xs font-medium text-muted-foreground flex items-center mb-1"><Users size={12} className="mr-1 rtl:ml-1"/>{t('sector')}</label>
               <Select value={filters.sector} onValueChange={(value) => handleFilterChange('sector', value)}>
                 <SelectTrigger id="sector-filter-h" className="h-10 text-sm w-full">
                   <SelectValue placeholder={t('allSectors')} />
                 </SelectTrigger>
                 <SelectContent>
                   {sectorOptions.map(sector => (
                     <SelectItem key={sector.value} value={sector.value} className="text-sm">
                       {t(sector.labelKey)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>

            {/* Rate Slider - Spans 2 cols on smaller screens if needed */}
            {/* <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="rate-filter-h" className="text-xs font-medium text-muted-foreground">{t('hourlyRate', { min: filters.rateRange[0], max: filters.rateRange[1] })}</label>
              <Slider
                id="rate-filter-h"
                min={50} max={500} step={10}
                value={filters.rateRange}
                onValueChange={handleRateChange}
                className="mt-3 mb-1"
              />
            </div> */}

            {/* Min Rating */}
            {/* <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center mb-1"><Star size={12} className="mr-1 rtl:ml-1"/>{t('minRating')}</label>
              <Select value={String(filters.minRating)} onValueChange={(value) => handleFilterChange('minRating', Number(value))}>
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue placeholder={t('anyRating')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-sm">{t('anyRating')}</SelectItem>
                  <SelectItem value="1" className="text-sm">1+ <Star size={12} className="inline ml-1 fill-secondary text-secondary"/></SelectItem>
                  <SelectItem value="2" className="text-sm">2+ <Star size={12} className="inline ml-1 fill-secondary text-secondary"/></SelectItem>
                  <SelectItem value="3" className="text-sm">3+ <Star size={12} className="inline ml-1 fill-secondary text-secondary"/></SelectItem>
                  <SelectItem value="4" className="text-sm">4+ <Star size={12} className="inline ml-1 fill-secondary text-secondary"/></SelectItem>
                  <SelectItem value="5" className="text-sm">5 <Star size={12} className="inline ml-1 fill-secondary text-secondary"/></SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Sort By */}
            {/* <div>
              <label htmlFor="sort-by-h" className="text-xs font-medium text-muted-foreground">{t('sortBy')}</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by-h" className="h-10 text-sm w-full">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ratingDesc" className="text-sm">{t('sortByRatingDesc')}</SelectItem>
                  <SelectItem value="rateAsc" className="text-sm">{t('sortByRateAsc')}</SelectItem>
                  <SelectItem value="rateDesc" className="text-sm">{t('sortByRateDesc')}</SelectItem>
                  <SelectItem value="nameAsc" className="text-sm">{t('sortByNameAsc')}</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </motion.div>
      );
    };

    export default HorizontalFilters;
  