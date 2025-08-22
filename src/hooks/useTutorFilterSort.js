import { useState, useMemo, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { getConstants } from '@/api/constantsFetch';
import { apiFetch } from '@/api/apiService';

const LS_KEYS = {
  searchTerm: 'filter-searchTerm',
  sortBy: 'filter-sortBy',
  filters: {
    subject: 'filter-subject',
    grade: 'filter-grade',
    sector: 'filter-sector',
    rateRange: 'filter-rateRange',
    minRating: 'filter-minRating',
    governate: 'filter-governate',
    district: 'filter-district',
    educationSystem: 'filter-educationSystem',
    language: 'filter-language',
  },
};

const getStoredValue = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    if (Array.isArray(fallback)) return JSON.parse(item);
    if (typeof fallback === 'number') return parseFloat(item);
    return item;
  } catch {
    return fallback;
  }
};

const getInitialSearchTerm = () => getStoredValue(LS_KEYS.searchTerm, '');

const getInitialFilters = () => ({
  subject: getStoredValue(LS_KEYS.filters.subject, 'none'),
  grade: getStoredValue(LS_KEYS.filters.grade, 'none'),
  educationSystem: getStoredValue(LS_KEYS.filters.educationSystem, 'all'),
  language: getStoredValue(LS_KEYS.filters.language, 'all'),
});

const getInitialSortBy = () => getStoredValue(LS_KEYS.sortBy, 'ratingDesc');

const safeToLower = (v) => (v == null ? '' : String(v).toLowerCase());

export const useTutorFilterSort = (initialTutors = []) => {
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [filtersState, setFiltersState] = useState(getInitialFilters);
  const [sortBy, setSortBy] = useState(getInitialSortBy);

  const [constants, setConstants] = useState(null);
  const [loadingConstants, setLoadingConstants] = useState(true);
  const [errorConstants, setErrorConstants] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingConstants(true);
    getConstants(false)
      .then((c) => {
        if (cancelled) return;
        setConstants(c || {});
        setLoadingConstants(false);
        console.debug('[useTutorFilterSort] loaded constants:', c);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load constants', err);
        setErrorConstants(err);
        setConstants({});
        setLoadingConstants(false);
      });
    return () => { cancelled = true; };
  }, []);

  const fuse = useMemo(() => new Fuse(initialTutors, {
    keys: ['name', 'subjects.subject'],
    threshold: 0.4,
    includeScore: true,
  }), [initialTutors]);

  const fuzzySearchResults = useMemo(() => {
    return fuse.search(searchTerm).map(r => r.item);
  }, [fuse, searchTerm, initialTutors]);

  useEffect(() => { localStorage.setItem(LS_KEYS.searchTerm, searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem(LS_KEYS.sortBy, sortBy); }, [sortBy]);
  useEffect(() => {
    Object.entries(filtersState).forEach(([key, value]) => {
      const storageKey = LS_KEYS.filters[key];
      if (!storageKey) return;
      try { localStorage.setItem(storageKey, Array.isArray(value) ? JSON.stringify(value) : String(value)); } catch {}
    });
  }, [filtersState]);

  // setters
  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => (typeof newFilters === 'function' ? newFilters(prev) : newFilters));
  }, []);
  const handleFilterChange = useCallback((name, value) => {
    setFiltersState(prev => ({ ...prev, [name]: value }));
  }, []);
  const handleRateChange = useCallback((newRange) => {
    setFiltersState(prev => ({ ...prev, rateRange: newRange }));
  }, []);

  // Build robust "education combos"
  const {
    educationCombos,
    educationSystemsOptions,
    sectorsOptions,
    governatesOptions,
    districtsOptions,
    languagesOptions,
  } = useMemo(() => {
    const combos = [];
    const eduSystems = new Set();
    const sectorsSet = new Set();
    const langsSet = new Set();

    const governates = Array.isArray(constants?.Governates) ? [...constants.Governates] : [];
    const districtsObj = constants?.Districts || {};

    // helper to add combo
    const pushCombo = (systemName, sectorLabel, languageLabel) => {
      const value = `${systemName}||${sectorLabel}||${languageLabel}`;
      const label = `${systemName} - ${sectorLabel} - ${languageLabel}`;
      combos.push({ value, label, system: systemName, sector: sectorLabel, language: languageLabel });
    };

    // If EducationStructure exists, prefer it
    if (constants?.EducationStructure && typeof constants.EducationStructure === 'object') {
      // iterate systems
      Object.entries(constants.EducationStructure).forEach(([systemName, systemDef]) => {
        eduSystems.add(systemName);

        // collect sectors from systemDef.sectors which may be { grade: [sectors] } or nested
        const systemSectors = new Set();
        if (systemDef.sectors) {
          Object.entries(systemDef.sectors).forEach(([gradeKey, sectorsVal]) => {
            if (Array.isArray(sectorsVal)) {
              sectorsVal.forEach(s => systemSectors.add(s));
            } else if (typeof sectorsVal === 'object') {
              Object.values(sectorsVal).forEach(arr => Array.isArray(arr) && arr.forEach(s => systemSectors.add(s)));
            }
          });
        }

        // languages for this system
        const systemLanguages = Array.isArray(systemDef.languages) ? systemDef.languages : [];

        // collect languages and sectors globally
        systemLanguages.forEach(l => langsSet.add(l));
        Array.from(systemSectors).forEach(s => sectorsSet.add(s));

        // create combos: if no sectors, use 'General' sector placeholder
        if (systemSectors.size === 0) {
          const sectorLabel = 'General';
          if (systemLanguages.length > 0) {
            systemLanguages.forEach(lang => pushCombo(systemName, sectorLabel, lang));
          } else {
            // fallback to constants.Languages or 'All'
            const fallbackLangs = Array.isArray(constants?.Languages) && constants.Languages.length ? constants.Languages : ['All'];
            fallbackLangs.forEach(lang => pushCombo(systemName, sectorLabel, lang));
            fallbackLangs.forEach(l => langsSet.add(l));
          }
        } else {
          // sectors exist -> create combos for each sector x language (language may be empty)
          const sectorsArr = Array.from(systemSectors);
          if (systemLanguages.length > 0) {
            sectorsArr.forEach(sec => systemLanguages.forEach(lang => pushCombo(systemName, sec, lang)));
          } else {
            // no system languages: fallback to constants.Languages or 'All'
            const fallbackLangs = Array.isArray(constants?.Languages) && constants.Languages.length ? constants.Languages : ['All'];
            sectorsArr.forEach(sec => fallbackLangs.forEach(lang => pushCombo(systemName, sec, lang)));
            fallbackLangs.forEach(l => langsSet.add(l));
          }
        }
      });
    } else {
      // no EducationStructure shape: try fallback to Education_Systems array and constants.Languages
      if (Array.isArray(constants?.Education_Systems)) {
        constants.Education_Systems.forEach(sys => eduSystems.add(sys));
        const fallbackLangs = Array.isArray(constants?.Languages) && constants.Languages.length ? constants.Languages : ['All'];
        constants.Education_Systems.forEach(sys => {
          // use General sector as fallback
          fallbackLangs.forEach(lang => pushCombo(sys, 'General', lang));
          fallbackLangs.forEach(l => langsSet.add(l));
        });
      }
    }

    // Also collect top-level Languages if present
    if (Array.isArray(constants?.Languages)) {
      constants.Languages.forEach(l => langsSet.add(l));
    }

    // Ensure combos is never empty — always provide an 'all' option at minimum
    const sortedCombos = combos.length > 0
      ? combos.sort((a, b) => a.label.localeCompare(b.label)).map(c => ({ value: c.value, label: c.label }))
      : [];

    const resultCombos = [{ value: 'all', label: 'All Systems' }, ...sortedCombos];

    // return sets as arrays
    return {
      educationCombos: resultCombos,
      educationSystemsOptions: Array.from(eduSystems).sort((a, b) => String(a).localeCompare(b)),
      sectorsOptions: Array.from(sectorsSet).sort((a,b)=> String(a).localeCompare(b)),
      governatesOptions: governates.sort((a,b)=> String(a).localeCompare(b)),
      districtsOptions: Array.isArray(districtsObj?.[filtersState.governate]) ? [...districtsObj[filtersState.governate]] : [],
      languagesOptions: Array.from(langsSet).sort((a,b)=> String(a).localeCompare(b)),
    };
  }, [constants, filtersState]);

  // compute gradesOptions based on selected education system
  const gradesOptions = useMemo(() => {
    if (!filtersState.educationSystem || filtersState.educationSystem === 'all') {
      return [];
    }
    
    const system = constants?.EducationStructure?.[filtersState.educationSystem];
    if (!system || !system.grades) return [];
    
    return Array.from(new Set(system.grades)).sort((a, b) => String(a).localeCompare(b));
  }, [constants, filtersState.educationSystem]);

  // compute subjectsOptions based on current chosen system/grade/sector
  const subjectsOptions = useMemo(() => {
    const chosenSystem = filtersState.educationSystem && filtersState.educationSystem !== 'all' ? filtersState.educationSystem : null;
    const chosenGrade = filtersState.grade && filtersState.grade !== 'none' ? filtersState.grade : null;
    const chosenSector = filtersState.sector && filtersState.sector !== 'all' ? filtersState.sector : null;

    let subjectsArr = [];
    if (chosenSystem && chosenGrade && constants?.SubjectsBySystem) {
      const sys = constants.SubjectsBySystem[chosenSystem] || constants.SubjectsBySystem?.[Object.keys(constants.SubjectsBySystem || {})?.[0]];
      const gradeEntry = sys?.[chosenGrade];
      if (Array.isArray(gradeEntry)) subjectsArr = [...gradeEntry];
      else if (typeof gradeEntry === 'object') {
        if (chosenSector) subjectsArr = gradeEntry[chosenSector] || [];
        else subjectsArr = []; // require sector selection if subjects are by sector
      }
    }
    return Array.from(new Set(subjectsArr)).sort((a,b) => String(a).localeCompare(b));
  }, [constants, filtersState]);

  // parse combined value helper
  const parseCombo = useCallback((val) => {
    if (!val || val === 'all') return { educationSystem: 'all', sector: 'all', language: 'all' };
    const parts = String(val).split('||');
    return {
      educationSystem: parts[0] || 'all',
      sector: parts[1] || 'all',
      language: parts[2] || 'all',
    };
  }, []);

  // update for combined selection
  const setEducationFromCombo = useCallback((comboValue) => {
    const { educationSystem, sector, language } = parseCombo(comboValue);
    setFiltersState(prev => ({
      ...prev,
      educationSystem,
      sector,
      language,
      // reset dependents
      grade: 'none',
      subject: 'none',
    }));
  }, [parseCombo]);

  const [serverTutors, setServerTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [tutorsError, setTutorsError] = useState(null);

  // Helper to map server teacher doc to frontend tutor shape
  const mapServerTeacherToTutor = useCallback((teacher) => {
    const tutor = {
      id: teacher._id || teacher.id,
      name: teacher.name,
      governate: teacher.governate,
      district: teacher.district,
      rating: teacher.rating,
      subjects: Array.isArray(teacher.subject_profiles) ? teacher.subject_profiles.map(p => {
        const subj = p.subject || p.subject_doc || {};
        const price = (p.private_pricing && p.private_pricing.price) || (p.group_pricing && p.group_pricing.price) || null;
        // derive education system and sector explicitly
  let educationSystem = subj.education_system || subj.educationSystem || p.education_system || p.educationSystem || null;
  let sector = subj.sector || p.sector || null;
        // fallback to legacy `type` parsing if sector or educationSystem missing
        if ((!educationSystem || !sector) && (p.type || subj.type)) {
          const legacy = (p.type || subj.type || '').toString();
          const parts = legacy.split('-').map(s => s.trim()).filter(Boolean);
          if (parts.length === 1) {
            // single token -> treat as education system
            if (!educationSystem) educationSystem = parts[0];
            if (!sector) sector = 'General';
          } else if (parts.length > 1) {
            if (!sector) sector = parts[0];
            if (!educationSystem) educationSystem = parts.slice(1).join(' - ');
          }
        }
        return {
          subject: subj.name || subj.title || p.subject_name || '',
          grade: subj.grade || p.grade || 'Unknown',
          language: subj.language || p.language || 'Unknown',
          education_system: educationSystem || null,
          sector: sector || 'General',
          price,
          rating: p.rating ?? null,
        };
      }) : [],
    };
    return tutor;
  }, []);

  useEffect(() => {
    let active = true;
    let timer = null;

    const fetchFromServer = async () => {
      setLoadingTutors(true);
      setTutorsError(null);
      try {
        const params = new URLSearchParams();
        const f = filtersState || {};
        if (f.educationSystem && f.educationSystem !== 'all') params.set('education_system', f.educationSystem);
        if (f.grade && f.grade !== 'none') params.set('grade', f.grade);
        if (f.subject && f.subject !== 'none') params.set('subject', f.subject);
        if (f.sector && f.sector !== 'all') params.set('sector', f.sector);
        if (f.language && f.language !== 'all') params.set('language', f.language);
        if (f.governate && f.governate !== 'all') params.set('governate', f.governate);
        if (f.district && f.district !== 'all') params.set('district', f.district);
        if (f.minRating && Number(f.minRating) > 0) params.set('min_rating', String(f.minRating));
        if (f.rateRange && Array.isArray(f.rateRange)) {
          params.set('min_price', String(f.rateRange[0]));
          params.set('max_price', String(f.rateRange[1]));
        }
        if (searchTerm) params.set('q', searchTerm);

  const url = `/tutors/filter?${params.toString()}`;
  console.debug('[useTutorFilterSort] fetching /filter', { url, params: params.toString(), filters: f });
  const res = await apiFetch(url);
  console.debug('[useTutorFilterSort] /filter response', res);
        if (!active) return;
        const tutors = Array.isArray(res?.tutors) ? res.tutors.map(mapServerTeacherToTutor) : [];
  console.debug('[useTutorFilterSort] mapped tutors count', tutors.length);
        setServerTutors(tutors);
      } catch (err) {
        if (!active) return;
        setTutorsError(err);
        setServerTutors([]);
      } finally {
        if (active) setLoadingTutors(false);
      }
    };

    // debounce
    timer = setTimeout(fetchFromServer, 300);

    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [filtersState, searchTerm, mapServerTeacherToTutor]);

  // apply fuzzy search client-side to server results for the searchTerm
  const filteredTutors = useMemo(() => {
    if (!serverTutors || serverTutors.length === 0) return [];
    if (!searchTerm) return serverTutors;
    const localFuse = new Fuse(serverTutors, { keys: ['name', 'subjects.subject'], threshold: 0.4, includeScore: true });
    return localFuse.search(searchTerm).map(r => r.item);
  }, [serverTutors, searchTerm]);

  // sorting helpers
  const getMaxRating = (tutor) => {
    if (!Array.isArray(tutor.subjects)) return -Infinity;
    return Math.max(...tutor.subjects.map(s => typeof s.rating === 'number' ? s.rating : -Infinity));
  };
  const getMinPrice = (tutor) => {
    if (!Array.isArray(tutor.subjects)) return Infinity;
    return Math.min(...tutor.subjects.map(s => typeof s.price === 'number' ? s.price : Infinity));
  };

  const sortedTutors = useMemo(() => {
    const sorted = [...filteredTutors];
    switch (sortBy) {
      case 'ratingDesc':
        sorted.sort((a, b) => getMaxRating(b) - getMaxRating(a));
        break;
      case 'rateAsc':
        sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'rateDesc':
        sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'nameAsc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredTutors, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    filters: filtersState,
    setFilters,
    handleFilterChange,
    handleRateChange,
    sortBy,
    setSortBy,
    sortedTutors,
    filteredCount: filteredTutors.length,

    constants,
    loadingConstants,
    errorConstants,
    educationCombos,
    educationSystemsOptions,
    gradesOptions,
    sectorsOptions,
    subjectsOptions,
    governatesOptions,
    districtsOptions,
    languagesOptions,
    loadingTutors,
    
    setEducationFromCombo,
    parseCombo,
  };
};

export default useTutorFilterSort;