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
import Loader from '@/components/ui/loader';

const INITIAL_TUTORS_COUNT = 12;
const LOAD_MORE_COUNT = 8;
const MAX_SUGGESTIONS = 10;
const DEBOUNCE_DELAY = 300;

const ErrorBanner = ({ message }) => (
  <Card className="max-w-md mx-auto mt-6 border-[1px] rounded-lg" style={{ borderColor: 'hsl(var(--destructive) / 0.35)', background: 'color-mix(in srgb, hsl(var(--destructive)) 6%, transparent)' }}>
    <CardContent className="flex items-center gap-4 py-4 text-[color:hsl(var(--destructive))]">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-sm text-[color:hsl(var(--destructive))]">Connection Error</h4>
        <p className="text-xs mt-1 text-[color:color-mix(in srgb, hsl(var(--destructive)) 70%, #000000)] dark:text-[color:color-mix(in srgb, hsl(var(--destructive)) 70%, #fff)]">
          {message || 'An error occurred while connecting to the server. Please try again later.'}
        </p>
      </div>
    </CardContent>
  </Card>
);

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="animate-pulse bg-[color:color-mix(in srgb, hsl(var(--card)) 4%, transparent)] rounded-xl p-4 min-h-[120px] flex flex-col gap-3 mb-4">
    <div className="rounded-md bg-muted/40 h-36 sm:h-40" />
    <div className="h-4 bg-muted/30 rounded w-3/5" />
    <div className="h-3 bg-muted/20 rounded w-2/5 mt-2" />
  </div>
);

export const GeneralTutorGrid = ({ tutors = [], error = null }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [fetchError, setFetchError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_TUTORS_COUNT);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [nameFilter, setNameFilter] = useState(null); // ONLY name search filters results
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreServer, setHasMoreServer] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(true);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // read "filters" from localStorage but treat them as SORT PREFERENCES (not filters)
  const filters = useMemo(() => {
    try {
      return {
        subject: localStorage.getItem('filter-subject') || null,
        grade: localStorage.getItem('filter-grade') || null,
        minRating: parseFloat(localStorage.getItem('filter-minRating') || '') || 0,
        rateRange: JSON.parse(localStorage.getItem('filter-rateRange') || '[0,100000]'),
        location: localStorage.getItem('filter-location') || null,
        sector: localStorage.getItem('filter-sector') || null,
        sortBy: localStorage.getItem('filter-sortBy') || 'ratingDesc',
      };
    } catch (err) {
      console.error('filters parse error', err);
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

  // data source depends on auth
  const sourceTutors = authState?.isLoggedIn ? recommended : tutors;

  // IMPORTANT: scoring should NOT exclude tutors; it only boosts matching tutors so they appear higher.
  const scoredTutors = useMemo(() => {
    const qLower = (searchQuery || '').toLowerCase();
    return (sourceTutors || []).map((tutor) => {
      const avgRating = (tutor.avgRating ?? tutor.rating ?? 0) || 0;
      let score = 0;

      // We compute booleans based on user-selected preferences,
      // but we DON'T use them to filter — only to increase score.
      const hasSubject = !!filters.subject && (
        (tutor.subjects || []).some(s => ((s.subject || s.name) === filters.subject)) ||
        (tutor.subject_profiles || []).some(p => ((p.subject_doc?.name || p.subject) === filters.subject))
      );

      const hasGrade = !!filters.grade && (
        (tutor.subjects || []).some(s => s.grade === filters.grade) ||
        (tutor.subject_profiles || []).some(p => p.subject_doc?.grade === filters.grade)
      );

      const inRating = avgRating >= (filters.minRating || 0);
      const rate = tutor.hourlyRate ?? tutor.rate ?? 0;
      const inPrice = rate >= (filters.rateRange?.[0] ?? 0) && rate <= (filters.rateRange?.[1] ?? 100000);
      const locPref = !filters.location || filters.location === 'all' || tutor.governate === filters.location || tutor.location === filters.location;
      const secPref = !filters.sector || filters.sector === 'all' || tutor.sector === filters.sector;

      // scoring boosts (higher weight for subject/grade and name match)
      if (hasSubject) score += 3;
      if (hasGrade) score += 2;
      if (inRating) score += 2;
      if (inPrice) score += 1;
      if (locPref) score += 1;
      if (secPref) score += 1;

      const nameMatch = qLower && (tutor.name || '').toLowerCase().includes(qLower);
      if (nameMatch) score += 5;

      // you may add additional heuristics here (recent activity, isTopRated handled later)
      return { ...tutor, score };
    });
  }, [sourceTutors, filters, searchQuery]);

  // Sorting: optionally restrict to the name search ONLY.
  const sortedTutors = useMemo(() => {
    // ONLY the name search acts as a filter: when the user selects a name we show matching names.
    // All other "filters" only affect score and therefore ranking, not inclusion/exclusion.
    const filtered = nameFilter
      ? (scoredTutors || []).filter(t => (t.name || '').toLowerCase().includes((nameFilter || '').toLowerCase()))
      : (scoredTutors || []);

    return [...filtered].sort((a, b) => {
      // top rated always first
      if (a.isTopRated && !b.isTopRated) return -1;
      if (!a.isTopRated && b.isTopRated) return 1;

      // then by computed score
      if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);

      // fallback to user sort preference
      if (filters.sortBy === 'ratingDesc') {
        return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      }

      // assume sortBy === 'priceAsc' (or other) means price ascending
      return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
    });
  }, [scoredTutors, filters.sortBy, nameFilter]);

  // suggestions must be name-based; keep this behavior
  const suggestedTutors = useMemo(() => {
    if (!inputValue) return [];
    const q = inputValue.toLowerCase();
    return (sourceTutors || [])
      .filter(t => (t.name || '').toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS)
      .map(t => ({ id: t._id || t.id, name: t.name }));
  }, [sourceTutors, inputValue]);

  const tutorsToShow = useMemo(() => sortedTutors.slice(0, visibleCount), [sortedTutors, visibleCount]);

  const loading = loadingInitial || loadingMore;
  const hasMore = authState?.isLoggedIn ? hasMoreServer : visibleCount < sortedTutors.length;

  const debouncedSetQuery = useMemo(() => debounce((val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_TUTORS_COUNT);
    setIsDropdownOpen(val.length > 0);
    setNameFilter(null); // reset name filter when typing
  }, DEBOUNCE_DELAY), []);

  useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    debouncedSetQuery(v.trim());
    setHighlightedIndex(-1);
  };

  const handleSearchSelect = (tutorName) => {
    const trimmed = (tutorName || '').trim();
    setInputValue(trimmed);
    setSearchQuery(trimmed);
    setNameFilter(trimmed); // selecting a name filters by name only
    setIsDropdownOpen(false);
    inputRef.current?.blur();
    setVisibleCount(INITIAL_TUTORS_COUNT);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestedTutors.length === 0) {
      if (e.key === 'Enter') {
        const trimmed = (inputValue || '').trim();
        if (trimmed) {
          setNameFilter(trimmed);
          setSearchQuery(trimmed);
          setVisibleCount(INITIAL_TUTORS_COUNT);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestedTutors.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        handleSearchSelect(suggestedTutors[highlightedIndex].name);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchRecommendations = useCallback(async (search = '', pageNum = 1, { signal } = {}) => {
    if (!authState?.isLoggedIn) return;

    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (e) { /* no-op */ }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const s = signal || controller.signal;

    if (pageNum === 1) {
      setLoadingInitial(true);
      setLoadingMore(false);
      setFetchError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // NOTE: We intentionally do NOT send client-side filter preferences to server here
      // because those preferences are only used locally for sorting.
      const url = `/tutors/recommend?q=${encodeURIComponent(search || '')}&page=${pageNum}&limit=${INITIAL_TUTORS_COUNT}`;
      const res = await apiFetch(url, { signal: s });
      let tutorsArr = (res && res.tutors) || [];

      if ((!tutorsArr || tutorsArr.length === 0) && pageNum === 1) {
        try {
          const fallback = await apiFetch('/tutors/loadTutors/1/12', { signal: s });
          tutorsArr = (fallback && fallback.tutors) || [];
        } catch (fbErr) {
          // ignore fallback failure
        }
      }

      tutorsArr = (tutorsArr || []).map(t => {
        const copy = { ...t };
        copy.id = t._id ? String(t._id) : (t.id || undefined);
        if (!Array.isArray(copy.subject_profiles)) copy.subject_profiles = [];
        copy.subject_profiles = copy.subject_profiles
          .map(p => ({ ...p, subject_doc: p?.subject_doc || p?.subject_id || null }))
          .filter(p => p && p.subject_doc && (p.subject_doc.name || p.subject_doc.subject));
        if (!Array.isArray(copy.subjects)) copy.subjects = [];
        copy.subjects = copy.subjects.map(s => (s && typeof s === 'object' ? s : null)).filter(Boolean);
        return copy;
      });

      if (pageNum === 1) {
        setRecommended(tutorsArr);
        setPage(1);
      } else {
        setRecommended(prev => {
          const prevIds = new Set(prev.map(x => x.id || x._id));
          const filtered = tutorsArr.filter(x => !prevIds.has(x.id || x._id));
          return [...prev, ...filtered];
        });
        setPage(pageNum);
      }

      const total = res && (res.total || 0);
      setHasMoreServer(() => {
        if (typeof total === 'number' && total > 0) return (pageNum * INITIAL_TUTORS_COUNT) < total;
        return (tutorsArr && tutorsArr.length) === INITIAL_TUTORS_COUNT;
      });

    } catch (err) {
      if (err?.name === 'AbortError') {
      } else {
        console.error('Recommendations fetch failed', err);
        setFetchError('Unable to load personalized recommendations.');
      }
    } finally {
      if (abortControllerRef.current && abortControllerRef.current.signal === (signal || controller.signal)) {
        abortControllerRef.current = null;
      }
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, [authState?.isLoggedIn]);

  // Manage lifecycle: fetch when auth/searchQuery change
  useEffect(() => {
    if (!authState?.isLoggedIn) {
      // For non-logged in users, we have the tutors from props
      setLoadingInitial(false);
      return;
    }

    fetchRecommendations(searchQuery, 1, {});

    return () => {
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (e) { /* no-op */ }
        abortControllerRef.current = null;
      }
    };
  }, [authState?.isLoggedIn, searchQuery, fetchRecommendations]);

  const loadMoreServer = () => {
    if (!authState?.isLoggedIn) return;
    const next = page + 1;
    fetchRecommendations(searchQuery, next, {});
  };

  // Hide skeletons after a short delay when data is loaded
  useEffect(() => {
    if (!loadingInitial && tutorsToShow.length > 0) {
      const timer = setTimeout(() => {
        setShowSkeletons(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (loadingInitial) {
      setShowSkeletons(true);
    }
  }, [loadingInitial, tutorsToShow.length]);

  return (
    <div className="max-w-full mx-auto">
      {(error || fetchError) && <ErrorBanner message={error || fetchError} />}

      <div className="relative mb-8" ref={searchRef}>
        <div className="relative flex gap-4 items-center bg-[color:hsl(var(--background))] border border-[color:hsl(var(--input))] rounded-lg h-12 sm:h-14 shadow-md focus-within:ring-2 focus-within:ring-[color:hsl(var(--ring))] transition-all duration-300 hover:shadow-lg">
          <Search className="w-5 h-5 text-[color:hsl(var(--muted-foreground))] ml-4" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t('searchByName', 'Search tutors by name')}
            className="bg-transparent border-none h-12 sm:h-14 text-sm sm:text-base focus:ring-0 px-3 placeholder:text-[color:color-mix(in srgb,hsl(var(--muted-foreground)) 70%, transparent)] font-medium"
            aria-label={t('searchByName', 'Search tutors by name')}
          />
        </div>

        <AnimatePresence>
          {isDropdownOpen && suggestedTutors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2"
              role="listbox"
              aria-label={t('searchSuggestions', 'Search suggestions')}
            >
              <Card className="bg-[color:hsl(var(--popover))] border border-[color:hsl(var(--input))] rounded-lg shadow-xl max-h-80 overflow-auto">
                <div className="flex justify-center py-1 sticky top-0 bg-[color:hsl(var(--popover))/0.95]">
                  <ChevronUp className="h-4 w-4 text-[color:hsl(var(--muted-foreground))]" />
                </div>
                <CardContent className="p-0">
                  {suggestedTutors.map((s, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <motion.div
                        key={s.id || s.name + idx}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12, delay: idx * 0.02 }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        onClick={() => handleSearchSelect(s.name)}
                        role="option"
                        aria-selected={isHighlighted}
                        className={`px-4 py-2.5 text-sm text-[color:hsl(var(--foreground))] hover:bg-[color:hsl(var(--accent))/0.08] cursor-pointer transition-colors duration-150 font-medium ${isHighlighted ? 'bg-[color:hsl(var(--accent))/0.12]' : ''}`}
                      >
                        {s.name}
                      </motion.div>
                    );
                  })}
                </CardContent>
                {suggestedTutors.length >= MAX_SUGGESTIONS && (
                  <div className="flex justify-center py-1 sticky bottom-0 bg-[color:hsl(var(--popover))/0.95]">
                    <ChevronDown className="h-4 w-4 text-[color:hsl(var(--muted-foreground))]" />
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pinterest-style masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {/* Show skeletons while loading or if no tutors yet */}
        {showSkeletons && Array.from({ length: INITIAL_TUTORS_COUNT }).map((_, index) => (
          <div key={`skeleton-${index}`} className="mb-4 break-inside-avoid">
            <SkeletonCard />
          </div>
        ))}

        {/* Actual tutor cards */}
        <AnimatePresence>
          {tutorsToShow.map((tutor, index) => (
            <motion.div
              key={tutor.id || tutor._id || tutor.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <GeneralTutorCard tutor={tutor} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading more skeletons */}
        {loadingMore && Array.from({ length: LOAD_MORE_COUNT }).map((_, index) => (
          <div key={`more-skeleton-${index}`} className="mb-4 break-inside-avoid">
            <SkeletonCard />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={authState?.isLoggedIn ? loadMoreServer : () => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            disabled={loading || !hasMore}
            className="px-6 py-2 rounded-full text-[color:hsl(var(--primary-foreground))] bg-[color:hsl(var(--primary))] hover:brightness-95 transition font-medium shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t('loading', 'Loading...') : t('loadMore', 'Load More')}
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralTutorGrid;
