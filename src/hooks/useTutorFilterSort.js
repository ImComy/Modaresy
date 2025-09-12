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
    const trimmed = item.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(item);
      } catch {
        // fallthrough to return string
      }
    }
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
  sector: getStoredValue(LS_KEYS.filters.sector, 'all'),
});

const getInitialSortBy = () => getStoredValue(LS_KEYS.sortBy, 'ratingDesc');

const normalize = (v) => (v == null ? 'all' : String(v).trim().toLowerCase());

const ensureArrayOrAll = (val) => {
  if (val == null) return 'all';
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'all') return 'all';
    // comma-separated -> array
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return trimmed;
  }
  return String(val);
};

const serializeFilterParam = (val) => {
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean).join(',');
  if (val == null) return '';
  return String(val).trim();
};

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
    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(initialTutors, {
        keys: ['name', 'subjects.subject'],
        threshold: 0.4,
        includeScore: true,
      }),
    [initialTutors]
  );

  const fuzzySearchResults = useMemo(() => {
    if (!searchTerm) return initialTutors;
    return fuse.search(searchTerm).map((r) => r.item);
  }, [fuse, searchTerm, initialTutors]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.searchTerm, searchTerm || '');
  }, [searchTerm]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.sortBy, sortBy || '');
  }, [sortBy]);
  useEffect(() => {
    Object.entries(filtersState).forEach(([key, value]) => {
      const storageKey = LS_KEYS.filters[key];
      if (!storageKey) return;
      try {
        if (Array.isArray(value)) {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
          localStorage.setItem(storageKey, String(value));
        }
      } catch {}
    });
  }, [filtersState]);

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) =>
      typeof newFilters === 'function' ? newFilters(prev) : newFilters
    );
  }, []);
  const handleFilterChange = useCallback((name, value) => {
    setFiltersState((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleRateChange = useCallback((newRange) => {
    setFiltersState((prev) => ({ ...prev, rateRange: newRange }));
  }, []);

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

    const governates = Array.isArray(constants?.Governates)
      ? [...constants.Governates]
      : [];
    const districtsObj = constants?.Districts || {};

    const pushCombo = (systemName, sectorLabel, languageLabel) => {
      const value = `${systemName}||${sectorLabel}||${languageLabel}`;
      const label = `${systemName} - ${sectorLabel} - ${languageLabel}`;
      combos.push({
        value,
        label,
        system: systemName,
        sector: sectorLabel,
        language: languageLabel,
      });
    };

    if (constants?.EducationStructure && typeof constants.EducationStructure === 'object') {
      Object.entries(constants.EducationStructure).forEach(([systemName, systemDef]) => {
        eduSystems.add(systemName);

        const systemSectors = new Set();
        if (systemDef.sectors) {
          Object.entries(systemDef.sectors).forEach(([gradeKey, sectorsVal]) => {
            if (Array.isArray(sectorsVal)) {
              sectorsVal.forEach((s) => systemSectors.add(s));
            } else if (typeof sectorsVal === 'object') {
              Object.values(sectorsVal).forEach((arr) =>
                Array.isArray(arr) && arr.forEach((s) => systemSectors.add(s))
              );
            }
          });
        }

        const systemLanguages = Array.isArray(systemDef.languages)
          ? systemDef.languages
          : [];

        systemLanguages.forEach((l) => langsSet.add(l));
        Array.from(systemSectors).forEach((s) => sectorsSet.add(s));

        if (systemSectors.size === 0) {
          const sectorLabel = 'General';
          if (systemLanguages.length > 0) {
            systemLanguages.forEach((lang) => pushCombo(systemName, sectorLabel, lang));
          } else {
            const fallbackLangs =
              (Array.isArray(constants?.Languages) && constants.Languages.length
                ? constants.Languages
                : ['All']);
            fallbackLangs.forEach((lang) => pushCombo(systemName, sectorLabel, lang));
            fallbackLangs.forEach((l) => langsSet.add(l));
          }
        } else {
          const sectorsArr = Array.from(systemSectors);
          if (systemLanguages.length > 0) {
            sectorsArr.forEach((sec) =>
              systemLanguages.forEach((lang) => pushCombo(systemName, sec, lang))
            );
          } else {
            const fallbackLangs =
              (Array.isArray(constants?.Languages) && constants.Languages.length
                ? constants.Languages
                : ['All']);
            sectorsArr.forEach((sec) =>
              fallbackLangs.forEach((lang) => pushCombo(systemName, sec, lang))
            );
            fallbackLangs.forEach((l) => langsSet.add(l));
          }
        }
      });
    } else {
      if (Array.isArray(constants?.Education_Systems)) {
        constants.Education_Systems.forEach((sys) => eduSystems.add(sys));
        const fallbackLangs =
          (Array.isArray(constants?.Languages) && constants.Languages.length
            ? constants.Languages
            : ['All']);
        constants.Education_Systems.forEach((sys) => {
          fallbackLangs.forEach((lang) => pushCombo(sys, 'General', lang));
          fallbackLangs.forEach((l) => langsSet.add(l));
        });
      }
    }

    if (Array.isArray(constants?.Languages)) {
      constants.Languages.forEach((l) => langsSet.add(l));
    }

    const sortedCombos =
      combos.length > 0
        ? combos
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((c) => ({ value: c.value, label: c.label }))
        : [];

    const resultCombos = [{ value: 'all', label: 'All Systems' }, ...sortedCombos];

    return {
      educationCombos: resultCombos,
      educationSystemsOptions: Array.from(eduSystems).sort((a, b) =>
        String(a).localeCompare(b)
      ),
      sectorsOptions: Array.from(sectorsSet).sort((a, b) =>
        String(a).localeCompare(b)
      ),
      governatesOptions: governates.sort((a, b) => String(a).localeCompare(b)),
      districtsOptions: Array.isArray(districtsObj?.[filtersState.governate])
        ? [...districtsObj[filtersState.governate]]
        : [],
      languagesOptions: Array.from(langsSet).sort((a, b) =>
        String(a).localeCompare(b)
      ),
    };
  }, [constants, filtersState]);

  const rawGradesOptions = useMemo(() => {
    if (!filtersState.educationSystem || filtersState.educationSystem === 'all') {
      return [];
    }
    const system = constants?.EducationStructure?.[filtersState.educationSystem];
    if (!system || !system.grades) return [];
    return Array.from(new Set(system.grades)).sort((a, b) =>
      String(a).localeCompare(b)
    );
  }, [constants, filtersState.educationSystem]);

  const buildSubjectsFromConstants = useCallback((c, system, grade, sector) => {
    if (!c || !system || !grade) return [];
    const subjectsBySystem = c.SubjectsBySystem || {};
    const sys = subjectsBySystem[system];
    if (!sys) return [];
    const gradeEntry = sys[grade];
    if (!gradeEntry) return [];

    const sectorNormalized = normalize(sector || 'all');

    if (Array.isArray(gradeEntry)) {
      if (sectorNormalized === 'all' || sectorNormalized === 'general') {
        return Array.from(new Set(gradeEntry.map(s => String(s).trim()))).sort((a,b) => a.localeCompare(b));
      }
      return [];
    }

    if (typeof gradeEntry === 'object') {
      const keys = Object.keys(gradeEntry || {});
      // try case-insensitive match for sector keys
      const matchKey = keys.find(k => normalize(k) === sectorNormalized);
      if (matchKey) {
        const arr = gradeEntry[matchKey] || [];
        return Array.from(new Set(arr.map(s => String(s).trim()))).sort((a,b) => a.localeCompare(b));
      }
      // sector === 'all' -> combine all sector arrays
      if (sectorNormalized === 'all') {
        const combined = [].concat(...keys.map(k => gradeEntry[k] || [])).filter(Boolean);
        return Array.from(new Set(combined.map(s => String(s).trim()))).sort((a,b) => a.localeCompare(b));
      }
      return [];
    }
    return [];
  }, []);

  // determine whether a given grade has subjects for the current combo
  const gradeHasSubjectsForCombo = useCallback((grade, system, sector) => {
    if (!system || system === 'all') return false;
    if (!constants) return true; // while loading, show them (no blocking)
    const sectorNormalized = normalize(sector || 'all');

    const subjectsBySystem = constants?.SubjectsBySystem || {};
    const sys = subjectsBySystem[system];
    if (!sys) return false;
    const gradeEntry = sys[grade];
    if (!gradeEntry) return false;

    if (sectorNormalized === 'all') {
      if (Array.isArray(gradeEntry)) return gradeEntry.length > 0;
      if (typeof gradeEntry === 'object') return Object.values(gradeEntry).some(arr => Array.isArray(arr) && arr.length > 0);
      return false;
    }

    if (sectorNormalized === 'general') {
      return Array.isArray(gradeEntry) && gradeEntry.length > 0;
    }

    if (Array.isArray(gradeEntry)) return false; // array-grades don't have sectors
    if (typeof gradeEntry === 'object') {
      const keys = Object.keys(gradeEntry || {});
      const matchKey = keys.find(k => normalize(k) === sectorNormalized);
      return Boolean(matchKey && Array.isArray(gradeEntry[matchKey]) && gradeEntry[matchKey].length > 0);
    }
    return false;
  }, [constants]);

  // filtered grades: only those that are actually available for the current combo
  const gradesOptions = useMemo(() => {
    if (!constants || loadingConstants) return rawGradesOptions;
    if (!filtersState.educationSystem || filtersState.educationSystem === 'all') return [];
    const all = rawGradesOptions || [];
    const sector = filtersState.sector || 'all';
    return all.filter(g => gradeHasSubjectsForCombo(g, filtersState.educationSystem, sector));
  }, [constants, loadingConstants, rawGradesOptions, filtersState.educationSystem, filtersState.sector, gradeHasSubjectsForCombo]);

  const subjectsOptions = useMemo(() => {
    const chosenSystem =
      filtersState.educationSystem && filtersState.educationSystem !== 'all'
        ? filtersState.educationSystem
        : null;
    const chosenGrade =
      filtersState.grade && filtersState.grade !== 'none'
        ? filtersState.grade
        : null;
    const chosenSector =
      filtersState.sector && filtersState.sector !== 'all'
        ? filtersState.sector
        : null;

    let subjectsArr = [];
    if (chosenSystem && chosenGrade && constants?.SubjectsBySystem) {
      const sys =
        constants.SubjectsBySystem[chosenSystem] ||
        constants.SubjectsBySystem?.[Object.keys(constants.SubjectsBySystem || {})?.[0]];
      const gradeEntry = sys?.[chosenGrade];
      if (Array.isArray(gradeEntry)) subjectsArr = [...gradeEntry];
      else if (typeof gradeEntry === 'object') {
        if (chosenSector) {
          const keys = Object.keys(gradeEntry || {});
          const matchKey = keys.find(k => normalize(k) === normalize(chosenSector));
          subjectsArr = matchKey ? (gradeEntry[matchKey] || []) : [];
        } else subjectsArr = [];
      }
    }
    return Array.from(new Set(subjectsArr)).sort((a, b) =>
      String(a).localeCompare(b)
    );
  }, [constants, filtersState]);

  const parseCombo = useCallback((val) => {
    if (!val || val === 'all')
      return { educationSystem: 'all', sector: 'all', language: 'all' };
    const parts = String(val).split('||');
    return {
      educationSystem: parts[0] || 'all',
      sector: parts[1] || 'all',
      language: parts[2] || 'all',
    };
  }, []);

  const setEducationFromCombo = useCallback(
    (comboValue) => {
      const { educationSystem, sector, language } = parseCombo(comboValue);
      setFiltersState((prev) => ({
        ...prev,
        educationSystem,
        sector,
        language,
        grade: 'none',
        subject: 'none',
      }));
    },
    [parseCombo]
  );

  const [serverTutors, setServerTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [tutorsError, setTutorsError] = useState(null);

  const mapServerTeacherToTutor = useCallback((teacher) => {
    const coordsSrc =
      teacher.coordinates || teacher.location_coordinates || null;

    const toNumOrNull = (v) => {
      if (typeof v === 'number') return v;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    const coords =
      coordsSrc && typeof coordsSrc === 'object'
        ? {
            latitude: toNumOrNull(coordsSrc.latitude),
            longitude: toNumOrNull(coordsSrc.longitude),
          }
        : null;

    const normalizedCoords =
      coords && coords.latitude != null && coords.longitude != null
        ? coords
        : null;

    const subjects =
      Array.isArray(teacher.subject_profiles)
        ? teacher.subject_profiles.map((p) => {
            const subj = p.subject || p.subject_doc || {};
            const price =
              (p.private_pricing && p.private_pricing.price) ||
              (p.group_pricing && p.group_pricing.price) ||
              null;

            // language and sector are now arrays (or might be single values), preserve as arrays
            const subjLanguage = Array.isArray(subj.language)
              ? subj.language
              : subj.language
                ? [subj.language]
                : p.language
                  ? (Array.isArray(p.language) ? p.language : [p.language])
                  : ['Unknown'];

            const subjSector = Array.isArray(subj.sector)
              ? subj.sector
              : subj.sector
                ? [subj.sector]
                : p.sector
                  ? (Array.isArray(p.sector) ? p.sector : [p.sector])
                  : ['General'];

            let educationSystem =
              subj.education_system ||
              subj.educationSystem ||
              p.education_system ||
              p.educationSystem ||
              null;

            return {
              subject: subj.name || subj.title || p.subject_name || '',
              grade: subj.grade || p.grade || 'Unknown',
              language: subjLanguage,
              education_system: educationSystem || null,
              sector: subjSector,
              price,
              rating: p.rating ?? null,
            };
          })
        : [];

    const tutor = {
      id: teacher._id || teacher.id,
      name: teacher.name,
      governate: teacher.governate,
      district: teacher.district,
      img: teacher.profile_picture || teacher.img || teacher.profilePicture || null,
      profile_picture: teacher.profile_picture || teacher.img || teacher.profilePicture || null,
      banner: teacher.banner || teacher.bannerimg || null,
      rating: teacher.rating,
      coordinates: normalizedCoords,
      subjects,
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
        if (f.educationSystem && f.educationSystem !== 'all')
          params.set('education_system', f.educationSystem);
        if (f.grade && f.grade !== 'none') params.set('grade', f.grade);
        if (f.subject && f.subject !== 'none') params.set('subject', f.subject);

        // sector/language may be array or string — serialize arrays as comma-separated
        if (f.sector && f.sector !== 'all') {
          const v = serializeFilterParam(ensureArrayOrAll(f.sector));
          if (v) params.set('sector', v);
        }
        if (f.language && f.language !== 'all') {
          const v = serializeFilterParam(ensureArrayOrAll(f.language));
          if (v) params.set('language', v);
        }

        if (f.governate && f.governate !== 'all') params.set('governate', f.governate);
        if (f.district && f.district !== 'all') params.set('district', f.district);
        if (f.minRating && Number(f.minRating) > 0)
          params.set('min_rating', String(f.minRating));
        if (f.rateRange && Array.isArray(f.rateRange)) {
          params.set('min_price', String(f.rateRange[0]));
          params.set('max_price', String(f.rateRange[1]));
        }
        if (searchTerm) params.set('q', searchTerm);

        const url = `/tutors/filter?${params.toString()}`;
        console.debug('[useTutorFilterSort] fetching /filter', {
          url,
          params: params.toString(),
          filters: f,
        });
        const res = await apiFetch(url);
        console.debug('[useTutorFilterSort] /filter response', res);

        if (!active) return;
        const tutors = Array.isArray(res?.tutors)
          ? res.tutors.map(mapServerTeacherToTutor)
          : Array.isArray(res)
          ? res.map(mapServerTeacherToTutor)
          : [];
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

    timer = setTimeout(fetchFromServer, 300);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [filtersState, searchTerm, mapServerTeacherToTutor]);

  const filteredTutors = useMemo(() => {
    if (!serverTutors || serverTutors.length === 0) return [];
    if (!searchTerm) return serverTutors;
    const localFuse = new Fuse(serverTutors, {
      keys: ['name', 'subjects.subject'],
      threshold: 0.4,
      includeScore: true,
    });
    return localFuse.search(searchTerm).map((r) => r.item);
  }, [serverTutors, searchTerm]);

  const getMaxRating = (tutor) => {
    if (!Array.isArray(tutor.subjects) || tutor.subjects.length === 0) return -Infinity;
    return Math.max(
      ...tutor.subjects.map((s) =>
        typeof s.rating === 'number' ? s.rating : -Infinity
      )
    );
  };
  const getMinPrice = (tutor) => {
    if (!Array.isArray(tutor.subjects) || tutor.subjects.length === 0) return Infinity;
    return Math.min(
      ...tutor.subjects.map((s) =>
        typeof s.price === 'number' ? s.price : Infinity
      )
    );
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
    rawGradesOptions,
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
