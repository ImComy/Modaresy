import React, { useState, useEffect, useRef } from 'react';
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
import { SearchableSelectContent } from '@/components/ui/searchSelect';

const LabelWithIcon = ({ icon: Icon, text, error = false }) => (
  <label className={`text-xs font-medium flex items-center gap-1 mb-1 ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
    <Icon size={12} className={`${error ? 'text-red-500' : 'text-muted-foreground'}`} />
    {text}
  </label>
);

const SORT_OPTIONS = [
  { value: 'ratingDesc', icon: <Star className="w-5 h-5" />, label: 'sortByRatingDesc' },
  { value: 'rateAsc', icon: <DollarSign className="w-5 h-5" />, label: 'sortByRateAsc' },
  { value: 'nameAsc', icon: <ArrowDownAZ className="w-5 h-5" />, label: 'sortByNameAsc' },
  { value: 'nameDesc', icon: <ArrowUpAZ className="w-5 h-5" />, label: 'sortByNameDesc' },
];

const HorizontalFilters = (props) => {
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    handleFilterChange,
    handleRateChange,
    sortBy,
    setSortBy,
    triggerFilterUpdate,

    educationCombos = [],
    gradesOptions = [],
    subjectsOptions = [],
    governatesOptions = [],
    districtsOptions = [],

    loadingConstants = false,

    setEducationFromCombo,
    parseCombo,
  } = props;

  const { t } = useTranslation();
  const [showAdditional, setShowAdditional] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [sortIndex, setSortIndex] = useState(SORT_OPTIONS.findIndex(opt => opt.value === sortBy));

  useEffect(() => {
    if (!filters) return;
    setLocalFilters(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(filters)) {
        return filters;
      }
      return prev;
    });
  }, [filters]);
  useEffect(() => setSortIndex(SORT_OPTIONS.findIndex(opt => opt.value === sortBy)), [sortBy]);

  const updateFilter = (key, value) => {
  console.debug('[HorizontalFilters] updateFilter', { key, value });
  if (handleFilterChange) handleFilterChange(key, value);
  else if (setFilters) setFilters(prev => ({ ...prev, [key]: value }));
  };

  const makeComboValueFromFilters = (f = {}) => {
  const system = f.educationSystem || 'all';
  const sector = f.sector || 'all';
  const language = f.language || 'all';
  return `${system}||${sector}||${language}`;
  };

  const [selectedComboValue, setSelectedComboValue] = useState('all');

  useEffect(() => {
    if (!educationCombos || educationCombos.length === 0) return;
    const f = filters || {};
    const exact = makeComboValueFromFilters(f);
    if (educationCombos.some(c => c.value === exact)) {
      setSelectedComboValue(exact);
      return;
    }

    if (f.educationSystem && f.educationSystem !== 'all') {
      const sysMatch = educationCombos.find(c => String(c.value).startsWith(`${f.educationSystem}||`));
      if (sysMatch) {
        setSelectedComboValue(sysMatch.value);
        return;
      }
    }

    setSelectedComboValue(educationCombos.find(c => c.value === 'all')?.value || 'all');
  }, [filters, educationCombos]);

  const prevFiltersRef = useRef(filters);
  const ignoreNextResetRef = useRef(false);
  useEffect(() => {
    const f = filters || {};
    const prev = prevFiltersRef.current || {};
    console.debug('[HorizontalFilters] reset effect prev->f', { prev, f, ignoreNextReset: ignoreNextResetRef.current });

    if (ignoreNextResetRef.current) {
      ignoreNextResetRef.current = false;
      setLocalFilters(f);
      prevFiltersRef.current = f;
      return;
    }

    if (prev.educationSystem !== f.educationSystem && (!f.educationSystem || f.educationSystem === 'all')) {
      console.debug('[HorizontalFilters] clearing dependents because educationSystem became all');
      updateFilter('grade', 'none');
      updateFilter('sector', 'all');
      updateFilter('subject', 'none');
      updateFilter('language', 'all');
    }

    if (prev.grade !== f.grade && (!f.grade || f.grade === 'none')) {
      console.debug('[HorizontalFilters] clearing sector/subject because grade became none');
      updateFilter('sector', 'all');
      updateFilter('subject', 'none');
    }

    if (prev.sector !== f.sector && (!f.sector || f.sector === 'all')) {
      console.debug('[HorizontalFilters] clearing subject because sector became all');
      updateFilter('subject', 'none');
    }

    if (prev.governate !== f.governate && (!f.governate || f.governate === 'all')) {
      console.debug('[HorizontalFilters] clearing district because governate became all');
      updateFilter('district', 'all');
    }

    setLocalFilters(f);
    prevFiltersRef.current = f;
  }, [filters]);

  const handleComboChange = (comboValue) => {
    setSelectedComboValue(comboValue || 'all');

    const parsed = typeof parseCombo === 'function'
      ? parseCombo(comboValue)
      : {
          educationSystem: comboValue === 'all' ? 'all' : comboValue.split('||')[0] || 'all',
          sector: comboValue === 'all' ? 'all' : comboValue.split('||')[1] || 'all',
          language: comboValue === 'all' ? 'all' : comboValue.split('||')[2] || 'all',
        };

    const updatedFilters = {
      ...localFilters,
      educationSystem: parsed.educationSystem,
      sector: parsed.sector,
      language: parsed.language,
      grade: 'none',
      subject: 'none',
    };
    
    setLocalFilters(updatedFilters);

    updateFilter('educationSystem', parsed.educationSystem);
    updateFilter('sector', parsed.sector);
    updateFilter('language', parsed.language);
    updateFilter('grade', 'none');
    updateFilter('subject', 'none');

    if (typeof setEducationFromCombo === 'function') {
      try { setEducationFromCombo(comboValue); } catch (e) { /* ignore */ }
    }

    triggerFilterUpdate?.();
  };

  const handleInputChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };

    if (key === 'grade') {
      updated.sector = updated.sector || 'all';
      updated.subject = 'none';
    }
    if (key === 'governate') {
      updated.district = 'all';
    }

    setLocalFilters(updated);

    if (key === 'subject') {
      try { ignoreNextResetRef.current = true; } catch (e) { /* ignore */ }
    }
    updateFilter(key, value);
    if (key === 'grade') {
      updateFilter('subject', updated.subject);
    }
    if (key === 'governate') {
      updateFilter('district', updated.district);
    }

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
    handleRateChange?.(value);
    updateFilter('rateRange', value);
    triggerFilterUpdate?.();
  };

  const effectiveEducationSystem = (filters?.educationSystem ?? localFilters.educationSystem);
  const effectiveGrade = (filters?.grade ?? localFilters.grade);
  const effectiveSector = (filters?.sector ?? localFilters.sector);

  const canPickGrade = gradesOptions && gradesOptions.length > 0 && 
    effectiveEducationSystem && 
    effectiveEducationSystem !== 'all';

  const canPickSubject = (effectiveEducationSystem && effectiveEducationSystem !== 'all') &&
      (effectiveGrade && effectiveGrade !== 'none');

  return (
    <>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }} className="mb-6 p-4 rounded-xl shadow-sm bg-card/80 backdrop-blur-sm border border-border/20">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">

            {/* Education combo (system - sector - language) */}
            <motion.div className="col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <LabelWithIcon icon={BookText} text={t('educationCombo') || 'System - Sector - Language'} />
              <Select value={selectedComboValue} onValueChange={handleComboChange} disabled={loadingConstants}>
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue placeholder={loadingConstants ? t('loading') : t('selectEducationCombo')} />
                </SelectTrigger>
                <SearchableSelectContent items={educationCombos.map(c => ({ value: c.value, label: c.label }))} />
              </Select>
            </motion.div>

            {/* Grade */}
            <motion.div className="col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <LabelWithIcon icon={Users} text={t('grade')} />
              <Select value={(filters?.grade ?? localFilters.grade) || 'none'} onValueChange={(value) => handleInputChange('grade', value)} disabled={!canPickGrade || loadingConstants}>
                <SelectTrigger className={`h-10 text-sm w-full ${!canPickGrade ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder={canPickGrade ? t('searchByGrade') : (loadingConstants ? t('loading') : t('noGradesAvailable'))} />
                </SelectTrigger>
                <SearchableSelectContent items={[{ value: 'none', label: t('none') }, ...gradesOptions.map(g => ({ value: g, label: g }))]} />
              </Select>
            </motion.div>

            {/* Subject */}
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              <LabelWithIcon icon={BookText} text={t('subject')} />
              <Select value={(filters?.subject ?? localFilters.subject) || 'none'} onValueChange={(value) => { console.debug('[HorizontalFilters] subject selected:', value); handleInputChange('subject', value); }} disabled={!canPickSubject}>
                <SelectTrigger className={`h-10 text-sm w-full ${!canPickSubject ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder={!((filters?.educationSystem) ?? localFilters.educationSystem) || ((filters?.educationSystem) ?? localFilters.educationSystem) === 'all' ? t('selectEducationComboFirst') : (!((filters?.grade) ?? localFilters.grade) || ((filters?.grade) ?? localFilters.grade) === 'none') ? t('selectGradeFirst') : (subjectsOptions.length ? t('searchBySubject') : t('noSubjectsAvailable'))} />
                </SelectTrigger>
                <SearchableSelectContent items={[{ value: 'none', label: t('none') }, ...subjectsOptions.map(s => ({ value: s, label: s }))]} />
              </Select>
            </motion.div>

            {/* Toggle */}
            <motion.div className="col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <button onClick={() => setShowAdditional(prev => !prev)} className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 md:py-3 transition-all duration-300 border text-sm font-medium shadow-sm w-full ${showAdditional ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border'}`}>
                <motion.span animate={{ rotate: showAdditional ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="inline-flex"><Filter className="w-4 h-4" /></motion.span>
                <span className="transition-all duration-300">{showAdditional ? t('hideAdditionalFilters') : t('additionalFilters')}</span>
              </button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showAdditional && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-muted/20 rounded-md border border-border/50 shadow-inner">
                <motion.div className="p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Name Search */}
                    <motion.div className="relative col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <LabelWithIcon icon={Search} text={t('searchByName')} />
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); triggerFilterUpdate?.(); }} className="pl-10 h-10 text-sm" />
                      </div>
                    </motion.div>

                    {/* Governate */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <LabelWithIcon icon={MapPin} text={t('governate')} />
                      <Select value={(filters?.governate ?? localFilters.governate) || 'all'} onValueChange={(value) => handleInputChange('governate', value)}>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t('selectGovernate')} />
                        </SelectTrigger>
                        <SearchableSelectContent items={[{ value: 'all', label: t('allGovernates') }, ...governatesOptions.map(g => ({ value: g, label: g }))]} />
                      </Select>
                    </motion.div>

                    {/* District */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                      <LabelWithIcon icon={MapPin} text={t('district')} />
                      <Select value={(filters?.district ?? localFilters.district) || 'all'} onValueChange={(value) => handleInputChange('district', value)} disabled={!((filters?.governate ?? localFilters.governate) && (filters?.governate ?? localFilters.governate) !== 'all')}>
                        <SelectTrigger className={`h-10 text-sm ${!(localFilters.governate && localFilters.governate !== 'all') ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder={!localFilters.governate || localFilters.governate === 'all' ? t('selectGovernateFirst') : (districtsOptions.length ? t('selectDistrict') : t('noDistrictsForGovernate'))} />
                        </SelectTrigger>
                        <SearchableSelectContent items={[{ value: 'all', label: t('allDistricts') }, ...districtsOptions.map(d => ({ value: d, label: d }))]} />
                      </Select>
                    </motion.div>

                    {/* Min Rating */}
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <LabelWithIcon icon={Star} text={t('minRating')} />
                      <Select value={String((filters?.minRating ?? localFilters.minRating) ?? 0)} onValueChange={value => handleInputChange('minRating', Number(value))}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue placeholder={t('anyRating')} /></SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map(num => (<SelectItem key={num} value={String(num)}>{num === 0 ? t('anyRating') : `${num}+`}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Rate Range */}
                    <motion.div className="flex flex-col gap-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                      <LabelWithIcon icon={DollarSign} text={t('monthlyRateRange')} />
                      <Slider min={50} max={2000} step={50} value={(filters?.rateRange ?? localFilters.rateRange) || [50,2000]} onValueChange={(v) => handleSliderChange(v)} className="w-full" />
                      <div className="text-xs text-muted-foreground">{t('from')} {localFilters.rateRange?.[0] || 50} - {t('to')} {localFilters.rateRange?.[1] || 2000}</div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detached Sort & Rate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 p-4 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <motion.span className="font-semibold text-2xl sm:text-3xl flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            {t('Results')}
            { /* simple spinner */ }
            {props.loadingTutors ? (
              <svg className="animate-spin h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
            ) : null}
          </motion.span>
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button variant="ghost" size="icon" className="rounded-full border border-border" onClick={handleSortCycle} title={t(SORT_OPTIONS[sortIndex].label)}>
              <motion.div key={sortIndex} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>{SORT_OPTIONS[sortIndex].icon}</motion.div>
            </Button>
            <span className="text-sm text-muted-foreground">{t(SORT_OPTIONS[sortIndex].label)}</span>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default HorizontalFilters;