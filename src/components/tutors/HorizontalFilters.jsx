import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/components/ui/select';
import {
  Search, Filter, ArrowDownAZ, ArrowUpAZ, Star, DollarSign, Users, MapPin, BookText, BookOpen, RefreshCw
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

const FloatingSubjectTooltip = ({ educationSystem, grade, sector, onResetCombo }) => (
  <motion.div
    initial={{ opacity: 0, y: -6, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    role="dialog"
    aria-live="polite"
    className="
      absolute
      left-0 sm:left-1/2
      sm:-translate-x-1/2
      mt-2
      z-50
      w-full sm:w-[20rem] md:w-[28rem]
      rounded-lg shadow-lg border border-border/40 bg-card p-3
      sm:translate-y-0
    "
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <BookOpen size={22} className="opacity-80" />
      </div>

      <div className="flex-1">
        <div className="font-semibold text-sm">No subjects available</div>
        <div className="text-xs text-muted-foreground mt-1">
          This grade doesn’t have subjects for the selected sector: <strong>{educationSystem}</strong> / <strong>{grade}</strong>{sector && sector !== 'all' ? ` / <strong>{sector}</strong>` : ''}.
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={onResetCombo}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Reset education combo"
          >
            <RefreshCw size={14} />
            Reset combo
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

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

    educationCombos: educationCombosFromProps = [],
    gradesOptions: gradesOptionsFromProps = [],
    subjectsOptions: subjectsOptionsFromProps = [],
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
  const appliedFromLocalStorageRef = useRef(false);
  const lastComboChangeByUserRef = useRef(false);
  const prevFiltersRef = useRef(filters);
  const ignoreNextResetRef = useRef(false);

  const [constants, setConstants] = useState(null);
  const [loadingLocalConstants, setLoadingLocalConstants] = useState(false);

  // tolerant helpers
  const normalize = (s) => String(s ?? 'all').trim().toLowerCase();
  const comboEqual = (a,b) => normalize(a) === normalize(b);
  const comboStartsWithSystem = (comboVal, systemVal) => normalize(comboVal).startsWith(normalize(systemVal));
  const splitComboValue = (val) => {
    const v = String(val ?? 'all').trim();
    if (!v || v === 'all') return ['all','all','all'];
    const separators = ['||',' - ','|',',','/'];
    for (const sep of separators) {
      if (v.includes(sep)) {
        const parts = v.split(sep).map(p => p.trim()).filter(Boolean);
        return [parts[0] || 'all', parts[1] || 'all', parts[2] || 'all'];
      }
    }
    const bySpace = v.split(/\s+/).map(p => p.trim()).filter(Boolean);
    return [bySpace[0]||'all', bySpace[1]||'all', bySpace[2]||'all'];
  };

  // fetch constants if parent didn't supply them
  useEffect(() => {
    let cancelled = false;
    async function tryFetch() {
      if ((educationCombosFromProps && educationCombosFromProps.length) ||
          (gradesOptionsFromProps && gradesOptionsFromProps.length) ||
          (subjectsOptionsFromProps && subjectsOptionsFromProps.length)) {
        return;
      }
      setLoadingLocalConstants(true);
      let fetched = null;
      const triedPaths = [
        '@/services/constants',
        '@/lib/constants',
        './constantsService',
        '../services/constants',
        '@/services/constantsService',
      ];
      for (const p of triedPaths) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const mod = await import(/* @vite-ignore */ p);
          if (mod && typeof mod.getConstants === 'function') {
            // eslint-disable-next-line no-await-in-loop
            fetched = await mod.getConstants();
            break;
          }
        } catch (e) { /* ignore */ }
      }
      if (!fetched && typeof window !== 'undefined' && typeof window.getConstants === 'function') {
        try { fetched = await window.getConstants(); } catch(e) { /* ignore */ }
      }
      if (!cancelled) {
        setConstants(fetched || null);
        setLoadingLocalConstants(false);
      }
    }
    tryFetch();
    return () => { cancelled = true; };
  }, [educationCombosFromProps, gradesOptionsFromProps, subjectsOptionsFromProps]);

  const effectiveLoadingConstants = loadingConstants || loadingLocalConstants;

  // builders (strict rules)
  const buildCombosFromConstants = (c) => {
    if (!c) return [{ value: 'all', label: 'All' }];
    const combos = [{ value: 'all', label: t('All') || 'All' }];
    const systems = c.Education_Systems || c.EducationSystems || [];
    const languagesGlobal = c.Languages || [];
    systems.forEach(sys => {
      const sysSubjects = c.SubjectsBySystem?.[sys] || {};
      const grades = Object.keys(sysSubjects);
      const sectorsSet = new Set();
      let hasGeneral = false;
      grades.forEach(g => {
        const entry = sysSubjects[g];
        if (Array.isArray(entry)) {
          hasGeneral = true;
        } else if (typeof entry === 'object' && entry !== null) {
          Object.keys(entry).forEach(sec => sectorsSet.add(sec));
        }
      });
      if (hasGeneral) sectorsSet.add('General');
      const sectors = Array.from(sectorsSet);
      const struct = c.EducationStructure?.[sys] || {};
      const languages = (struct.languages && struct.languages.length) ? struct.languages : (languagesGlobal && languagesGlobal.length ? languagesGlobal : ['Arabic']);
      sectors.forEach(sec => {
        languages.forEach(lang => {
          combos.push({ value: `${sys}||${sec}||${lang}`, label: `${sys} - ${sec} - ${lang}` });
        });
      });
    });
    return combos;
  };

  const buildGradesFromConstants = (c, sys) => {
    if (!c) return [];
    return Object.keys(c.SubjectsBySystem?.[sys] || {});
  };

  const buildSubjectsFromConstants = (c, system, grade, sector) => {
    if (!c || !system || !grade) return [];
    const subjectsBySystem = c.SubjectsBySystem || {};
    const sys = subjectsBySystem[system];
    if (!sys) return [];
    const gradeEntry = sys[grade];
    if (!gradeEntry) return [];

    if (Array.isArray(gradeEntry)) {
      const sectorNormalized = String(sector ?? 'all').trim().toLowerCase();
      if (sectorNormalized === 'all' || sectorNormalized === 'general') {
        return Array.from(new Set(gradeEntry.map(s => String(s).trim()))).sort((a,b) => a.localeCompare(b));
      }
      return [];
    }

    if (typeof gradeEntry === 'object') {
      if (sector && sector !== 'all' && gradeEntry[sector]) {
        return Array.from(new Set(gradeEntry[sector].map(s => String(s).trim()))).sort((a,b) => a.localeCompare(b));
      }
      return [];
    }

    return [];
  };

  useEffect(() => {
    if (!filters) return;
    setLocalFilters(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(filters)) return filters;
      return prev;
    });
  }, [filters]);

  useEffect(() => setSortIndex(SORT_OPTIONS.findIndex(opt => opt.value === sortBy)), [sortBy]);

  const updateFilter = (key, value) => {
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

  useEffect(() => { prevFiltersRef.current = filters; }, [filters]);

  useEffect(() => {
    const combos = (educationCombosFromProps && educationCombosFromProps.length) ? educationCombosFromProps : buildCombosFromConstants(constants);
    if (!combos || combos.length === 0) return;
    if (lastComboChangeByUserRef.current) return;
    const f = filters || {};
    const exact = makeComboValueFromFilters(f);
    const prev = prevFiltersRef.current || {};

    const exactMatch = combos.find(c => comboEqual(c.value, exact));
    if (exactMatch) {
      setSelectedComboValue(exactMatch.value);
      return;
    }

    if (f.educationSystem && f.educationSystem !== 'all' && prev.educationSystem !== f.educationSystem) {
      const sysMatch = combos.find(c => comboStartsWithSystem(c.value, f.educationSystem));
      if (sysMatch) {
        setSelectedComboValue(sysMatch.value);
        return;
      }
    }
  }, [filters, educationCombosFromProps, constants]);

  useEffect(() => {
    if (appliedFromLocalStorageRef.current) return;
    try {
      const storageUserPrefs = localStorage.getItem('userPreferences');
      const storedSystem = localStorage.getItem('selectedEducationSystem');
      const storedLanguage = localStorage.getItem('selectedLanguage');
      const storedGrade = localStorage.getItem('selectedGrade');
      const storedSector = localStorage.getItem('selectedSector');

      let prefs = {};
      if (storageUserPrefs) {
        try {
          const parsed = JSON.parse(storageUserPrefs);
          prefs.educationSystem = parsed.education_system || parsed.educationSystem || undefined;
          prefs.language = parsed.language || parsed.lang || undefined;
          prefs.grade = parsed.grade || parsed.selectedGrade || undefined;
          prefs.sector = parsed.sector || parsed.selectedSector || undefined;
        } catch (e) { /* ignore */ }
      }

      if (!prefs.educationSystem && storedSystem) prefs.educationSystem = storedSystem;
      if (!prefs.language && storedLanguage) prefs.language = storedLanguage;
      if (!prefs.grade && storedGrade) prefs.grade = storedGrade;
      if (!prefs.sector && storedSector) prefs.sector = storedSector;

      if (!prefs.educationSystem && !prefs.language && !prefs.grade && !prefs.sector) return;

      appliedFromLocalStorageRef.current = true;

      const comboValue = makeComboValueFromFilters({
        educationSystem: prefs.educationSystem || 'all',
        sector: prefs.sector || 'all',
        language: prefs.language || 'all',
      });

      const combos = (educationCombosFromProps && educationCombosFromProps.length) ? educationCombosFromProps : buildCombosFromConstants(constants);

      if (combos && combos.length > 0 && combos.some(c => comboEqual(c.value, comboValue))) {
        handleComboChange(comboValue, { fromLocalStorage: true });
      } else if (prefs.educationSystem) {
        const found = combos.find(c => comboStartsWithSystem(c.value, prefs.educationSystem));
        setSelectedComboValue(found?.value || combos.find(c => comboEqual(c.value, 'all'))?.value || 'all');
        updateFilter('educationSystem', prefs.educationSystem);
        updateFilter('sector', prefs.sector || 'all');
        updateFilter('language', prefs.language || 'all');
        setLocalFilters(prev => ({ ...prev, educationSystem: prefs.educationSystem, sector: prefs.sector || 'all', language: prefs.language || 'all' }));
      }

      if (prefs.grade) {
        handleInputChange('grade', prefs.grade);
      }

      triggerFilterUpdate?.();
    } catch (e) {
      console.debug('[HorizontalFilters] failed to apply localStorage presets', e);
    }
  }, [educationCombosFromProps, constants]);

  const handleComboChange = (comboValue, { fromLocalStorage = false } = {}) => {
    if (!fromLocalStorage) lastComboChangeByUserRef.current = true;
    setSelectedComboValue(comboValue || 'all');

    const parts = splitComboValue(comboValue);
    const parsed = {
      educationSystem: parts[0] || 'all',
      sector: parts[1] || 'all',
      language: parts[2] || 'all',
    };

    const prevSystem = (filters?.educationSystem ?? localFilters.educationSystem) || 'all';
    const shouldResetGrade = prevSystem !== parsed.educationSystem;

    const updatedFilters = {
      ...localFilters,
      educationSystem: parsed.educationSystem,
      sector: parsed.sector,
      language: parsed.language,
      grade: shouldResetGrade ? 'none' : (localFilters.grade || 'none'),
      subject: 'none',
    };

    setLocalFilters(updatedFilters);

    updateFilter('educationSystem', parsed.educationSystem);
    updateFilter('sector', parsed.sector);
    updateFilter('language', parsed.language);

    if (shouldResetGrade) updateFilter('grade', 'none');
    updateFilter('subject', 'none');

    if (typeof setEducationFromCombo === 'function') {
      try { setEducationFromCombo(comboValue); } catch (e) { /* ignore */ }
    }

    try {
      if (!fromLocalStorage) {
        localStorage.setItem('selectedEducationSystem', parsed.educationSystem);
        localStorage.setItem('selectedSector', parsed.sector);
        localStorage.setItem('selectedLanguage', parsed.language);
        const raw = localStorage.getItem('userPreferences');
        let obj = {};
        if (raw) { try { obj = JSON.parse(raw); } catch(e) { obj = {}; } }
        obj.education_system = parsed.educationSystem;
        obj.sector = parsed.sector;
        obj.language = parsed.language;
        obj.grade = updatedFilters.grade;
        localStorage.setItem('userPreferences', JSON.stringify(obj));
      }
    } catch (e) {
      console.debug('[HorizontalFilters] failed to write combo to localStorage', e);
    }

    if (!fromLocalStorage) {
      setTimeout(() => { lastComboChangeByUserRef.current = false; }, 120);
    }

    triggerFilterUpdate?.();
  };

  const handleInputChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };

    if (key === 'grade') {
      updated.subject = 'none';
    }

    if (key === 'governate') updated.district = 'all';

    setLocalFilters(updated);

    if (key === 'subject') {
      try { ignoreNextResetRef.current = true; } catch (e) { /* ignore */ }
    }

    updateFilter(key, value);

    // persist grade immediately
    if (key === 'grade') {
      try {
        localStorage.setItem('selectedGrade', value);
        const raw = localStorage.getItem('userPreferences');
        let obj = {};
        if (raw) { try { obj = JSON.parse(raw); } catch(e) { obj = {}; } }
        obj.grade = value;
        localStorage.setItem('userPreferences', JSON.stringify(obj));
      } catch (e) {
        console.debug('[HorizontalFilters] failed to persist grade', e);
      }
      updateFilter('subject', updated.subject);
    }

    if (key === 'governate') updateFilter('district', updated.district);

    triggerFilterUpdate?.();
  };

  useEffect(() => {
    const f = filters || {};
    const prev = prevFiltersRef.current || {};
    if (ignoreNextResetRef.current) {
      ignoreNextResetRef.current = false;
      setLocalFilters(f);
      prevFiltersRef.current = f;
      return;
    }

    if (prev.educationSystem !== f.educationSystem && (!f.educationSystem || f.educationSystem === 'all')) {
      updateFilter('grade', 'none');
      updateFilter('sector', 'all');
      updateFilter('subject', 'none');
      updateFilter('language', 'all');
    }

    if (prev.grade !== f.grade && (!f.grade || f.grade === 'none')) {
      updateFilter('sector', 'all');
      updateFilter('subject', 'none');
    }

    if (prev.sector !== f.sector && (!f.sector || f.sector === 'all')) {
      updateFilter('subject', 'none');
    }

    if (prev.governate !== f.governate && (!f.governate || f.governate === 'all')) {
      updateFilter('district', 'all');
    }

    setLocalFilters(f);
    prevFiltersRef.current = f;
  }, [filters]);

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

  // effective values
  const effectiveEducationSystem = (filters?.educationSystem ?? localFilters.educationSystem);
  const effectiveGrade = (filters?.grade ?? localFilters.grade);
  const effectiveSector = (filters?.sector ?? localFilters.sector);
  const effectiveLanguage = (filters?.language ?? localFilters.language);

  const educationCombos = (educationCombosFromProps && educationCombosFromProps.length) ? educationCombosFromProps : buildCombosFromConstants(constants);

  const allGrades = (gradesOptionsFromProps && gradesOptionsFromProps.length) ? gradesOptionsFromProps : (effectiveEducationSystem ? buildGradesFromConstants(constants, effectiveEducationSystem) : []);

  const gradeHasSubjectsForCombo = (grade, system, sector, language) => {
    if (!system || system === 'all') return false;
    if (!constants) return true;
    if (sector && sector !== 'all') {
      const subjects = buildSubjectsFromConstants(constants, system, grade, sector);
      return Array.isArray(subjects) && subjects.length > 0;
    }
    const subjectsBySystem = constants?.SubjectsBySystem || {};
    const sys = subjectsBySystem[system] || {};
    const gradeEntry = sys[grade];
    if (!gradeEntry) return false;
    if (Array.isArray(gradeEntry)) {
      return gradeEntry.length > 0;
    }
    if (typeof gradeEntry === 'object') {
      return Object.values(gradeEntry).some(arr => Array.isArray(arr) && arr.length > 0);
    }
    return false;
  };

  const availableGrades = allGrades && allGrades.length
    ? allGrades.filter(g => gradeHasSubjectsForCombo(g, effectiveEducationSystem, effectiveSector, effectiveLanguage))
    : [];

  const subjectsOptions = (subjectsOptionsFromProps && subjectsOptionsFromProps.length) ? subjectsOptionsFromProps : buildSubjectsFromConstants(constants, effectiveEducationSystem, effectiveGrade, effectiveSector);

  const isInvalidSelectedGrade = effectiveGrade && effectiveGrade !== 'none' && !availableGrades.includes(effectiveGrade);

  const hasGradesToShow = availableGrades.length > 0 || isInvalidSelectedGrade;

  const gradeSelectDisabled = effectiveLoadingConstants || !effectiveEducationSystem || effectiveEducationSystem === 'all' || !hasGradesToShow;

  let gradeItems = [{ value: 'none', label: t('none') }];
  gradeItems = [...gradeItems, ...availableGrades.map(g => ({ value: g, label: g }))];

  if (isInvalidSelectedGrade) {
    gradeItems.push({ value: effectiveGrade, label: effectiveGrade, disabled: true });
  }

  const canPickSubject = (effectiveEducationSystem && effectiveEducationSystem !== 'all') && (effectiveGrade && effectiveGrade !== 'none');

  const effectiveSubjectsList = subjectsOptions ?? [];

  return (
    <>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.1 }} className="mb-6 p-4 rounded-xl shadow-sm bg-card/80 backdrop-blur-sm border border-border/20">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">

            {/* Education combo */}
            <motion.div className="col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <LabelWithIcon icon={BookText} text={t('educationCombo') || 'System - Sector - Language'} />
              <Select value={selectedComboValue} onValueChange={handleComboChange} disabled={effectiveLoadingConstants}>
                <SelectTrigger className="h-10 text-sm w-full">
                  <SelectValue placeholder={effectiveLoadingConstants ? t('loading') : t('selectEducationCombo')} />
                </SelectTrigger>
                <SearchableSelectContent items={educationCombos.map(c => ({ value: c.value, label: c.label }))} />
              </Select>
            </motion.div>

            {/* Grade */}
            <motion.div className="col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <LabelWithIcon icon={Users} text={t('grade')} />
              <Select value={(filters?.grade ?? localFilters.grade) || 'none'} onValueChange={(value) => handleInputChange('grade', value)} disabled={gradeSelectDisabled}>
                <SelectTrigger className={`h-10 text-sm w-full ${gradeSelectDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder={effectiveLoadingConstants ? t('loading') : (effectiveEducationSystem === 'all' ? t('selectEducationComboFirst') : (hasGradesToShow ? t('searchByGrade') : t('noGradesAvailable')))} />
                </SelectTrigger>
                {/* only show available grades for the current combo, plus invalid selected if applicable (disabled) */}
                <SearchableSelectContent items={gradeItems} />
              </Select>
            </motion.div>

            {/* Subject (relative container for tooltip) */}
            <motion.div className="relative" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              <LabelWithIcon icon={BookText} text={t('subject')} />
              <Select value={(filters?.subject ?? localFilters.subject) || 'none'} onValueChange={(value) => { handleInputChange('subject', value); }} disabled={!canPickSubject}>
                <SelectTrigger className={`h-10 text-sm w-full ${!canPickSubject ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder={
                    !((filters?.educationSystem) ?? localFilters.educationSystem) || ((filters?.educationSystem) ?? localFilters.educationSystem) === 'all'
                    ? t('selectEducationComboFirst')
                    : (!((filters?.grade) ?? localFilters.grade) || ((filters?.grade) ?? localFilters.grade) === 'none')
                    ? t('selectGradeFirst')
                    : (effectiveSubjectsList.length ? t('searchBySubject') : t('noSubjectsAvailable'))
                  } />
                </SelectTrigger>
                <SearchableSelectContent items={[{ value: 'none', label: t('none') }, ...effectiveSubjectsList.map(s => ({ value: s, label: s }))]} />
              </Select>

              {/* Floating tooltip when user can pick subject but there are no subjects (strict case) */}
              {canPickSubject && (effectiveSubjectsList.length === 0) && (
                <AnimatePresence>
                  <FloatingSubjectTooltip
                    educationSystem={effectiveEducationSystem || 'all'}
                    grade={effectiveGrade || 'none'}
                    sector={effectiveSector || 'all'}
                    onResetCombo={() => { handleComboChange('all'); }}
                  />
                </AnimatePresence>
              )}
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
                    <motion.div className="relative col-span-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <LabelWithIcon icon={Search} text={t('searchByName')} />
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); triggerFilterUpdate?.(); }} className="pl-10 h-10 text-sm" />
                      </div>
                    </motion.div>

                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <LabelWithIcon icon={MapPin} text={t('governate')} />
                      <Select value={(filters?.governate ?? localFilters.governate) || 'all'} onValueChange={(value) => handleInputChange('governate', value)}>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t('selectGovernate')} />
                        </SelectTrigger>
                        <SearchableSelectContent items={[{ value: 'all', label: t('allGovernates') }, ...governatesOptions.map(g => ({ value: g, label: g }))]} />
                      </Select>
                    </motion.div>

                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                      <LabelWithIcon icon={MapPin} text={t('district')} />
                      <Select value={(filters?.district ?? localFilters.district) || 'all'} onValueChange={(value) => handleInputChange('district', value)} disabled={!((filters?.governate ?? localFilters.governate) && (filters?.governate ?? localFilters.governate) !== 'all')}>
                        <SelectTrigger className={`h-10 text-sm ${!(localFilters.governate && localFilters.governate !== 'all') ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder={!localFilters.governate || localFilters.governate === 'all' ? t('selectGovernateFirst') : (districtsOptions.length ? t('selectDistrict') : t('noDistrictsForGovernate'))} />
                        </SelectTrigger>
                        <SearchableSelectContent items={[{ value: 'all', label: t('allDistricts') }, ...districtsOptions.map(d => ({ value: d, label: d }))]} />
                      </Select>
                    </motion.div>

                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <LabelWithIcon icon={Star} text={t('minRating')} />
                      <Select value={String((filters?.minRating ?? localFilters.minRating) ?? 0)} onValueChange={value => handleInputChange('minRating', Number(value))}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue placeholder={t('anyRating')} /></SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5].map(num => (<SelectItem key={num} value={String(num)}>{num === 0 ? t('anyRating') : `${num}+`}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>

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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 p-4 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <motion.span className="font-semibold text-2xl sm:text-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{t('Results')}</motion.span>
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