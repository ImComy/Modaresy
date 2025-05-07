import { useState, useMemo } from 'react';
import { mockTutors } from '@/data/mockTutors';

export const useTutorFilterSort = (initialTutors = mockTutors) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: 'all',
    location: 'all',
    grade: 'all', // Added grade filter
    sector: 'all', // Added sector filter
    rateRange: [50, 500],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState('ratingDesc');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleRateChange = (newRange) => {
    setFilters(prev => ({ ...prev, rateRange: newRange }));
  };

  const filteredTutors = useMemo(() => {
    return initialTutors.filter(tutor => {
      const nameMatch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const subjectSearchMatch = tutor.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = nameMatch || subjectSearchMatch;

      const subjectFilterMatch = filters.subject === 'all' || tutor.subject.toLowerCase() === filters.subject;
      const locationFilterMatch = filters.location === 'all' || tutor.location.toLowerCase() === filters.location;
      const gradeFilterMatch = filters.grade === 'all' || (tutor.targetGrades && tutor.targetGrades.includes(filters.grade)); // Check targetGrades
      const sectorFilterMatch = filters.sector === 'all' || (tutor.targetSectors && tutor.targetSectors.includes(filters.sector)); // Check targetSectors
      const rateMatch = tutor.rate >= filters.rateRange[0] && tutor.rate <= filters.rateRange[1];
      const ratingMatch = tutor.rating >= filters.minRating;

      return searchMatch && subjectFilterMatch && locationFilterMatch && gradeFilterMatch && sectorFilterMatch && rateMatch && ratingMatch;
    });
  }, [initialTutors, searchTerm, filters]);

  const sortedTutors = useMemo(() => {
    const sorted = [...filteredTutors];
    switch (sortBy) {
      case 'ratingDesc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'rateAsc':
        sorted.sort((a, b) => a.rate - b.rate);
        break;
      case 'rateDesc':
        sorted.sort((a, b) => b.rate - a.rate);
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
    sortBy,
    setSortBy,
    sortedTutors,
  };
};
