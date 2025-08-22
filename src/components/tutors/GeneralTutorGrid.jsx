import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GeneralTutorCard from './GeneralTutorCard';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Search, ChevronUp, ChevronDown, AlertTriangle, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import debounce from 'lodash/debounce';
import { apiFetch } from '@/api/apiService';

const INITIAL_TUTORS_COUNT = 12;
const LOAD_MORE_COUNT = 8;
const COLUMN_COUNT = 4;
const MAX_SUGGESTIONS = 10;
const DEBOUNCE_DELAY = 300;

const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <motion.div
      className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      aria-label="Loading"
    />
  </div>
);

const ErrorBanner = ({ message }) => (
  <Card className="max-w-md mx-auto mt-6 border-red-500/40 bg-red-50 dark:bg-red-950">
    <CardContent className="flex items-center gap-4 py-4 text-red-600 dark:text-red-300">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-sm">Connection Error</h4>
        <p className="text-xs mt-1 text-red-500 dark:text-red-400">
          {message || 'An error occurred while connecting to the server. Please try again later.'}
        </p>
      </div>
    </CardContent>
  </Card>
);

export const GeneralTutorGrid = ({ tutors, error = null }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [fetchError, setFetchError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_TUTORS_COUNT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const [recommended, setRecommended] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreServer, setHasMoreServer] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('GeneralTutorGrid props:', { tutors, error, authState });

  const filters = useMemo(() => {
    try {
      const f = {
        subject: localStorage.getItem('filter-subject') || null,
        grade: localStorage.getItem('filter-grade') || null,
        minRating: parseFloat(localStorage.getItem('filter-minRating') || '') || 0,
        rateRange: JSON.parse(localStorage.getItem('filter-rateRange') || '[0,100000]'),
        location: localStorage.getItem('filter-location') || null,
        sector: localStorage.getItem('filter-sector') || null,
        sortBy: localStorage.getItem('filter-sortBy') || 'ratingDesc',
      };
      console.debug('Loaded filters from localStorage:', f);
      return f;
    } catch (err) {
      console.error('Failed to parse filters from localStorage:', err);
      return {
        subject: null,
        grade: null,
        minRating: 0,
        rateRange: [0, 100000],
        location: null,
        sector: null,
        sortBy: 'ratingDesc',
      };
    }
  }, []);

  const sourceTutors = authState.isLoggedIn ? recommended : tutors;
  console.log('Using sourceTutors:', sourceTutors);

  const scoredTutors = useMemo(() => {
    const mapped = (sourceTutors || []).map((tutor) => {
      let score = 0;
      const avgRating = tutor.avgRating ?? tutor.rating ?? 0;

      const hasSubject = filters.subject && (
        (tutor.subjects && tutor.subjects.some(s => (s.subject || s.name) === filters.subject)) ||
        (tutor.subject_profiles && tutor.subject_profiles.some(p => (p.subject_doc?.name || p.subject) === filters.subject))
      );
      const hasGrade = filters.grade && (
        (tutor.subjects && tutor.subjects.some(s => s.grade === filters.grade)) ||
        (tutor.subject_profiles && tutor.subject_profiles.some(p => p.subject_doc?.grade === filters.grade))
      );

      const inRating = avgRating >= (filters.minRating || 0);
      const inPrice = (() => {
        const rate = tutor.hourlyRate ?? tutor.rate ?? 0;
        return rate >= (filters.rateRange?.[0] ?? 0) && rate <= (filters.rateRange?.[1] ?? 100000);
      })();
      const locPref = filters.location === 'all' || !filters.location || tutor.governate === filters.location || tutor.location === filters.location;
      const secPref = filters.sector === 'all' || !filters.sector || tutor.sector === filters.sector;
      const nameMatch = !searchQuery || (tutor.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (hasSubject) score += 3;
      if (hasGrade) score += 2;
      if (inRating) score += 2;
      if (inPrice) score += 1;
      if (locPref) score += 1;
      if (secPref) score += 1;

      return { ...tutor, score: nameMatch ? score : -1 };
    });
    console.debug('Scored tutors:', mapped);
    return mapped;
  }, [sourceTutors, filters, searchQuery]);

  const sortedTutors = useMemo(() => {
    const sorted = [...scoredTutors]
      .filter(tutor => tutor.score >= 0)
      .sort((a, b) => {
        if (a.isTopRated && !b.isTopRated) return -1;
        if (!a.isTopRated && b.isTopRated) return 1;
        if (b.score !== a.score) return b.score - a.score;
        if (filters.sortBy === 'ratingDesc') {
          return (b.avgRating ?? 0) - (a.avgRating ?? 0);
        }
        return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
      });
    console.debug('Sorted tutors:', sorted);
    return sorted;
  }, [scoredTutors, filters]);

  const suggestedTutors = useMemo(() => {
    if (!searchQuery) return [];
    const list = sourceTutors
      .filter(tutor => (tutor.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, MAX_SUGGESTIONS)
      .map(tutor => ({ id: tutor._id || tutor.id, name: tutor.name }));
    console.debug('Suggested tutors for query:', searchQuery, list);
    return list;
  }, [sourceTutors, searchQuery]);

  const tutorsToShow = sortedTutors.slice(0, visibleCount);
  console.log(`Showing ${tutorsToShow.length} of ${sortedTutors.length} tutors`);

  const hasMore = authState.isLoggedIn ? hasMoreServer : visibleCount < sortedTutors.length;

  const columns = Array.from({ length: COLUMN_COUNT }, () => []);
  tutorsToShow.forEach((tutor, i) => {
    columns[i % COLUMN_COUNT].push(tutor);
  });
  console.debug('Column distribution:', columns);

  const noTutors = (!sourceTutors || sourceTutors.length === 0) && !loading;

  const debouncedSearchChange = useCallback(
    debounce((value) => {
      console.log('Search input changed:', value);
      setSearchQuery(value);
      setIsDropdownOpen(value.length > 0);
      setVisibleCount(INITIAL_TUTORS_COUNT);
    }, DEBOUNCE_DELAY),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearchChange(e.target.value);
  };

  const handleSearchSelect = (tutorName) => {
    console.log('Search suggestion selected:', tutorName);
    setSearchQuery(tutorName);
    setIsDropdownOpen(false);
    setVisibleCount(INITIAL_TUTORS_COUNT);
  };

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsDropdownOpen(false);
    }
  };

  const fetchRecommendations = useCallback(async (search, pageNum = 1) => {
    if (!authState.isLoggedIn) return;
    console.log('Fetching recommendations:', { search, pageNum });
    setLoading(true);
    try {
      const res = await apiFetch(`/tutors/recommend?q=${encodeURIComponent(search || '')}&page=${pageNum}&limit=${INITIAL_TUTORS_COUNT}`);
      console.debug('Recommend endpoint response:', res);
      let tutorsArr = (res && res.tutors) || [];

      if ((!tutorsArr || tutorsArr.length === 0) && pageNum === 1) {
        console.warn('No recommendations found, fetching fallback tutors');
        try {
          const fallback = await apiFetch('/tutors/loadTutors/1/12');
          tutorsArr = (fallback && fallback.tutors) || [];
          console.debug('Fallback loadTutors response:', fallback);
        } catch (fbErr) {
          console.error('Fallback fetch failed', fbErr);
        }
      }

      tutorsArr = (tutorsArr || []).map(t => {
        const copy = { ...t, id: t._id ? String(t._id) : (t.id || undefined) };
        if (!Array.isArray(copy.subject_profiles)) copy.subject_profiles = [];
        copy.subject_profiles = copy.subject_profiles
          .map(p => ({ ...p, subject_doc: p?.subject_doc || p?.subject_id || null }))
          .filter(p => p && p.subject_doc && (p.subject_doc.name || p.subject_doc.subject));
        if (!Array.isArray(copy.subjects)) copy.subjects = [];
        copy.subjects = copy.subjects.map(s => (s && typeof s === 'object' ? s : null)).filter(Boolean);
        return copy;
      });

      if (pageNum === 1) {
        console.log('Setting recommended tutors (first page):', tutorsArr);
        setRecommended(tutorsArr);
      } else {
        console.log('Appending recommended tutors (page', pageNum, '):', tutorsArr);
        setRecommended(prev => [...prev, ...(tutorsArr || [])]);
      }

      const total = res && (res.total || 0);
      setHasMoreServer((pageNum * INITIAL_TUTORS_COUNT) < (total || tutorsArr.length));
    } catch (err) {
      console.error('Recommend fetch error:', err);
      setFetchError('Unable to load personalized recommendations.');
    } finally {
      setLoading(false);
    }
  }, [authState.isLoggedIn]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    console.log('Auth state changed → fetching recommendations again');
    setPage(1);
    fetchRecommendations(searchQuery, 1);
  }, [authState.isLoggedIn, searchQuery, fetchRecommendations]);

  const loadMoreServer = () => {
    const next = page + 1;
    console.log('Loading more tutors from server, next page:', next);
    setPage(next);
    fetchRecommendations(searchQuery, next);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!authState.isLoggedIn) {
    console.log('User not logged in → showing login prompt');
    return (
      <div className="max-w-full mx-auto bg-muted/40 border border-border rounded-2xl shadow-md p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-primary/10 text-primary rounded-full p-4">
            <LogIn size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('getPersonalizedTutors', 'Discover Your Ideal Tutor')}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('signInToSeeRecommendations', 'Sign in to receive personalized tutor recommendations based on your preferences.')}
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2 rounded-full text-white bg-primary hover:bg-primary/90 transition font-medium"
        >
          {t('signIn')}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {(error || fetchError) && <ErrorBanner message={error || fetchError} />}
      {/* Search Bar */}
      <div className="relative mb-8" ref={searchRef}>
        <div className="relative flex items-center bg-background border border-input rounded-lg h-12 sm:h-14 shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
          <Search className="w-5 h-5 mx-5 text-muted-foreground ml-4" />
          <Input
            type="text"
            onChange={handleSearchChange}
            placeholder={t('searchByName', 'Search tutors by name')}
            className="bg-transparent border-none h-12 sm:h-14 text-sm sm:text-base focus:ring-0 px-3 placeholder:text-muted-foreground/70 font-medium"
          />
        </div>
        <AnimatePresence>
          {isDropdownOpen && suggestedTutors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2"
            >
              <Card className="bg-popover border border-input rounded-lg shadow-xl max-h-80 overflow-auto">
                <div className="flex justify-center py-1 sticky top-0 bg-popover/95">
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardContent className="p-0">
                  {suggestedTutors.map((tutor, index) => (
                    <motion.div
                      key={tutor.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleSearchSelect(tutor.name)}
                      className="px-4 py-2.5 text-sm text-foreground hover:bg-accent/80 cursor-pointer transition-colors duration-200 font-medium"
                    >
                      {tutor.name}
                    </motion.div>
                  ))}
                </CardContent>
                {suggestedTutors.length >= MAX_SUGGESTIONS && (
                  <div className="flex justify-center py-1 sticky bottom-0 bg-popover/95">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && sourceTutors.length === 0 ? (
          <Loader />
        ) : noTutors ? (
          <Card className="max-w-md mx-auto mt-10 bg-muted/60 dark:bg-muted/40 col-span-full">
            <CardContent className="flex items-center gap-4 py-6 text-muted-foreground">
              <UserX className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-base">{t('noTutorsFound', 'No Tutors Found')}</h4>
                <p className="text-sm mt-1">{t('tryChangingFilters', 'Try adjusting your filters to see results.')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-4">
              {col.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  {console.log('Rendering tutor card:', tutor)}
                  <GeneralTutorCard tutor={tutor} />
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          {authState.isLoggedIn ? (
            <button
              onClick={loadMoreServer}
              disabled={!hasMore || loading}
              className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition font-medium shadow disabled:opacity-60"
            >
              {loading ? t('loading', 'Loading...') : t('loadMore', 'Load More')}
            </button>
          ) : (
            <button
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
              className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition font-medium shadow"
            >
              {t('loadMore', 'Load More')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneralTutorGrid;
