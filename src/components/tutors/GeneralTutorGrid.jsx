import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GeneralTutorCard from './GeneralTutorCard';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  LogIn,
  Search,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  UserX,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import debounce from 'lodash/debounce';
import { apiFetch } from '@/api/apiService';
import Loader from '@/components/ui/loader';

const INITIAL_TUTORS_COUNT = 12;
const LOAD_MORE_COUNT = 8;
const MAX_SUGGESTIONS = 10;
const DEBOUNCE_DELAY = 300;

/**
 * ErrorBanner — small, theme-aware error display
 */
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

/**
 * GeneralTutorGrid — enhanced
 */
export const GeneralTutorGrid = ({ tutors = [], error = null }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();

  const [fetchError, setFetchError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_TUTORS_COUNT);
  const [inputValue, setInputValue] = useState('');        // immediate input value
  const [searchQuery, setSearchQuery] = useState('');      // debounced search query used for filtering/fetching
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreServer, setHasMoreServer] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // load filters from localStorage (safe)
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

  // source of tutors depends on auth state
  const sourceTutors = authState?.isLoggedIn ? recommended : tutors;

  // SCORE and filter tutors
  const scoredTutors = useMemo(() => {
    const qLower = (searchQuery || '').toLowerCase();
    return (sourceTutors || []).map((tutor) => {
      const avgRating = (tutor.avgRating ?? tutor.rating ?? 0);
      let score = 0;

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
      const nameMatch = !qLower || (tutor.name || '').toLowerCase().includes(qLower);

      if (hasSubject) score += 3;
      if (hasGrade) score += 2;
      if (inRating) score += 2;
      if (inPrice) score += 1;
      if (locPref) score += 1;
      if (secPref) score += 1;

      return { ...tutor, score: nameMatch ? score : -1 };
    });
  }, [sourceTutors, filters, searchQuery]);

  // SORT
  const sortedTutors = useMemo(() => {
    return [...(scoredTutors || [])]
      .filter(t => t.score >= 0)
      .sort((a, b) => {
        if (a.isTopRated && !b.isTopRated) return -1;
        if (!a.isTopRated && b.isTopRated) return 1;
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
        if (filters.sortBy === 'ratingDesc') {
          return (b.avgRating ?? 0) - (a.avgRating ?? 0);
        }
        return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
      });
  }, [scoredTutors, filters]);

  // suggested tutors for dropdown (client-side)
  const suggestedTutors = useMemo(() => {
    if (!inputValue) return [];
    const q = inputValue.toLowerCase();
    return (sourceTutors || [])
      .filter(t => (t.name || '').toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS)
      .map(t => ({ id: t._id || t.id, name: t.name }));
  }, [sourceTutors, inputValue]);

  const tutorsToShow = useMemo(() => sortedTutors.slice(0, visibleCount), [sortedTutors, visibleCount]);
  const hasMore = authState?.isLoggedIn ? hasMoreServer : visibleCount < sortedTutors.length;
  const noTutors = (!sourceTutors || sourceTutors.length === 0) && !loading;

  /* Debounced search handling */
  // update searchQuery (used for scoring + server fetch) with debounce
  const debouncedSetQuery = useMemo(() => debounce((val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_TUTORS_COUNT);
    setIsDropdownOpen(val.length > 0);
  }, DEBOUNCE_DELAY), []);

  useEffect(() => {
    return () => debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    debouncedSetQuery(v.trim());
    setHighlightedIndex(-1);
  };

  const handleSearchSelect = (tutorName) => {
    setInputValue(tutorName);
    setSearchQuery(tutorName);
    setIsDropdownOpen(false);
    inputRef.current?.blur();
    setVisibleCount(INITIAL_TUTORS_COUNT);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestedTutors.length === 0) return;

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

  // Close dropdown when clicking outside
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

  /* Fetch recommendations (server) with abort handling */
  const fetchRecommendations = useCallback(async (search = '', pageNum = 1, signal) => {
    if (!authState?.isLoggedIn) return;
    setLoading(true);
    setFetchError(null);
    try {
      const url = `/tutors/recommend?q=${encodeURIComponent(search || '')}&page=${pageNum}&limit=${INITIAL_TUTORS_COUNT}`;
      const res = await apiFetch(url, { signal });
      let tutorsArr = (res && res.tutors) || [];

      // fallback if empty & first page
      if ((!tutorsArr || tutorsArr.length === 0) && pageNum === 1) {
        try {
          const fallback = await apiFetch('/tutors/loadTutors/1/12', { signal });
          tutorsArr = (fallback && fallback.tutors) || [];
        } catch (fbErr) {
          // fallback failed silently; we'll just show empty
        }
      }

      // normalize objects
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
      } else {
        setRecommended(prev => [...prev, ...(tutorsArr || [])]);
      }

      const total = res && (res.total || 0);
      setHasMoreServer((pageNum * INITIAL_TUTORS_COUNT) < (total || tutorsArr.length));
    } catch (err) {
      if (err?.name === 'AbortError') {
        // aborted — ignore
      } else {
        console.error('Recommendations fetch failed', err);
        setFetchError('Unable to load personalized recommendations.');
      }
    } finally {
      setLoading(false);
    }
  }, [authState?.isLoggedIn]);

  // manage fetch lifecycle when auth/searchQuery/page changes
  useEffect(() => {
    if (!authState?.isLoggedIn) return;

    const controller = new AbortController();
    setPage(1);
    fetchRecommendations(searchQuery, 1, controller.signal);

    return () => controller.abort();
  }, [authState?.isLoggedIn, searchQuery, fetchRecommendations]);

  const loadMoreServer = () => {
    const next = page + 1;
    setPage(next);
    const controller = new AbortController();
    // fire-and-forget (we don't keep controllers for every page)
    fetchRecommendations(searchQuery, next, controller.signal);
  };

  // UI pieces: skeletons
  const SkeletonGrid = ({ count = 6 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 col-span-full w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[color:color-mix(in srgb, hsl(var(--card)) 4%, transparent)] rounded-xl p-4 min-h-[120px] flex flex-col gap-3">
          <div className="rounded-md bg-muted/40 h-36 sm:h-40" />
          <div className="h-4 bg-muted/30 rounded w-3/5" />
          <div className="h-3 bg-muted/20 rounded w-2/5 mt-2" />
        </div>
      ))}
    </div>
  );

  // Render when not logged in
  if (!authState?.isLoggedIn) {
    return (
      <div className="max-w-full mx-auto bg-[color:color-mix(in srgb, hsl(var(--muted)) 40%, transparent)] border border-[color:hsl(var(--border)/0.6)] rounded-2xl shadow-md p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="rounded-full p-4" style={{ background: 'color-mix(in srgb, hsl(var(--primary)) 8%, transparent)', color: 'hsl(var(--primary))' }}>
            <LogIn size={28} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[color:hsl(var(--foreground))]">
          {t('getPersonalizedTutors', 'Discover Your Ideal Tutor')}
        </h2>
        <p className="text-[color:hsl(var(--muted-foreground))] text-sm leading-relaxed">
          {t('signInToSeeRecommendations', 'Sign in to receive personalized tutor recommendations based on your preferences.')}
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2 rounded-full text-[color:hsl(var(--primary-foreground))] bg-[color:hsl(var(--primary))] hover:brightness-90 transition font-medium"
        >
          {t('signIn', 'Sign in')}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {(error || fetchError) && <ErrorBanner message={error || fetchError} />}

      {/* Search */}
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

        {/* Suggestions dropdown */}
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

      {/* Grid (responsive via Tailwind) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridAutoRows: 'min-content' }}>
        {loading && (tutorsToShow.length === 0) ? (
          <div className="flex justify-center col-span-full">
            <Loader />
          </div>
        ) : noTutors ? (
          <Card className="max-w-md mx-auto mt-10 bg-[color:hsl(var(--muted))/0.6] col-span-full rounded-xl">
            <CardContent className="flex items-center gap-4 py-6 text-[color:hsl(var(--muted-foreground))]">
              <UserX className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-base text-[color:hsl(var(--foreground))]">{t('noTutorsFound', 'No Tutors Found')}</h4>
                <p className="text-sm mt-1 text-[color:hsl(var(--muted-foreground))]">{t('tryChangingFilters', 'Try adjusting your filters to see results.')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {tutorsToShow.map((tutor) => (
              <motion.div
                key={tutor.id || tutor._id || tutor.name}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="h-min"
              >
                <GeneralTutorCard tutor={tutor} />
              </motion.div>
            ))}

            {/* show skeleton placeholders for a smooth loading hint when loading more */}
            {loading && tutorsToShow.length > 0 && (
              <div className="col-span-full">
                <div className="mt-4">
                  <SkeletonGrid count={Math.min(4, LOAD_MORE_COUNT)} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Load more */}
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
