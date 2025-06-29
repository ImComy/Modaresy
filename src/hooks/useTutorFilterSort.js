import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { mockTutors } from '@/data/enhanced';

const LS_KEYS = {
  searchTerm: 'filter-searchTerm',
  sortBy: 'filter-sortBy',
  filters: {
    subject: 'filter-subject',
    location: 'filter-location',
    grade: 'filter-grade',
    sector: 'filter-sector',
    rateRange: 'filter-rateRange',
    minRating: 'filter-minRating',
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

const getInitialSearchTerm = () =>
  getStoredValue(LS_KEYS.searchTerm, '');

const getInitialFilters = () => ({
  subject: getStoredValue(LS_KEYS.filters.subject, 'none'),
  location: getStoredValue(LS_KEYS.filters.location, 'all'),
  grade: getStoredValue(LS_KEYS.filters.grade, 'none'),
  sector: getStoredValue(LS_KEYS.filters.sector, 'all'),
  rateRange: getStoredValue(LS_KEYS.filters.rateRange, [50, 5000]),
  minRating: getStoredValue(LS_KEYS.filters.minRating, 0),
});

const getInitialSortBy = () =>
  getStoredValue(LS_KEYS.sortBy, 'ratingDesc');

export const useTutorFilterSort = (initialTutors = mockTutors) => {
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [filters, setFilters] = useState(getInitialFilters);
  const [sortBy, setSortBy] = useState(getInitialSortBy);

  // 🧠 Create Fuse instance ONCE per tutors change
  const fuse = useMemo(() => new Fuse(initialTutors, {
    keys: ['name', 'subjects.subject'],
    threshold: 0.4,
    includeScore: true,
  }), [initialTutors]);

  // 🧠 Smart search results
  const fuzzySearchResults = useMemo(() => {
    if (!searchTerm) return initialTutors;
    return fuse.search(searchTerm).map(result => result.item);
  }, [fuse, searchTerm, initialTutors]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEYS.searchTerm, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    Object.entries(filters).forEach(([key, value]) => {
      const storageKey = LS_KEYS.filters[key];
      localStorage.setItem(storageKey, Array.isArray(value) ? JSON.stringify(value) : value.toString());
    });
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.sortBy, sortBy);
  }, [sortBy]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleRateChange = (newRange) => {
    setFilters(prev => ({ ...prev, rateRange: newRange }));
  };

  function getMaxRating(tutor) {
    if (!Array.isArray(tutor.subjects)) return -Infinity;
    return Math.max(...tutor.subjects.map(s => typeof s.rating === 'number' ? s.rating : -Infinity));
  }

  function getMinPrice(tutor) {
    if (!Array.isArray(tutor.subjects)) return Infinity;
    return Math.min(...tutor.subjects.map(s => typeof s.price === 'number' ? s.price : Infinity));
  }

  const filteredTutors = useMemo(() => {
    return fuzzySearchResults.filter(tutor => {
      const subjectMatch =
        filters.subject === 'none' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(
            s => (s.subject || '').toLowerCase() === filters.subject.toLowerCase()
          ));

      const locationMatch =
        filters.location === 'all' ||
        (tutor.location || '').toLowerCase() === filters.location.toLowerCase();

      const gradeMatch =
        filters.grade === 'none' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(s => (s.grade || '') === filters.grade));

      const sectorMatch =
        filters.sector === 'all' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(s => (s.type || '').toLowerCase() === filters.sector.toLowerCase()));

      const rateMatch =
        Array.isArray(tutor.subjects) &&
        tutor.subjects.some(
          s =>
            typeof s.price === 'number' &&
            s.price >= filters.rateRange[0] &&
            s.price <= filters.rateRange[1]
        );

      const ratingMatch =
        Array.isArray(tutor.subjects) &&
        tutor.subjects.some(
          s =>
            typeof s.rating === 'number' &&
            s.rating >= filters.minRating
        );

      return (
        subjectMatch &&
        locationMatch &&
        gradeMatch &&
        sectorMatch &&
        rateMatch &&
        ratingMatch
      );
    });
  }, [fuzzySearchResults, filters]);

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
    filters,
    handleFilterChange,
    handleRateChange,
    setFilters,
    sortBy,
    setSortBy,
    sortedTutors,
  };
};
