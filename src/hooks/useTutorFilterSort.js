import { useState, useMemo } from 'react';
import { mockTutors } from '@/data/enhanced';

export const useTutorFilterSort = (initialTutors = mockTutors) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: 'none',
    location: 'all',
    grade: 'none',
    sector: 'all',
    rateRange: [50, 5000],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState('ratingDesc');

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
    return initialTutors.filter(tutor => {
      // Search by tutor name or any subject name
      const nameMatch = (tutor.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const subjectSearchMatch = Array.isArray(tutor.subjects)
        ? tutor.subjects.some(s =>
            (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : false;
      const searchMatch = nameMatch || subjectSearchMatch;

      // Subject filter: skip if 'none'
      const subjectFilterMatch =
        filters.subject === 'none' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(
            s => (s.subject || '').toLowerCase() === filters.subject.toLowerCase()
          ));

      // Location filter
      const locationFilterMatch =
        filters.location === 'all' ||
        (tutor.location || '').toLowerCase() === filters.location.toLowerCase();

      // Grade filter: skip if 'none'
      const gradeFilterMatch =
        filters.grade === 'none' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(
            s => (s.grade || '') === filters.grade
          ));

      // Sector filter
      const sectorFilterMatch =
        filters.sector === 'all' ||
        (Array.isArray(tutor.subjects) &&
          tutor.subjects.some(
            s => (s.type || '').toLowerCase() === filters.sector.toLowerCase()
          ));

      // Rate filter
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
        searchMatch &&
        subjectFilterMatch &&
        locationFilterMatch &&
        gradeFilterMatch &&
        sectorFilterMatch &&
        rateMatch &&
        ratingMatch
      );
    });
  }, [initialTutors, searchTerm, filters]);

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