import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GeneralTutorCard from './GeneralTutorCard';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { LogIn } from 'lucide-react';

const TUTORS_PER_PAGE = 8;

export const GeneralTutorGrid = ({ tutors }) => {
  const { t } = useTranslation();
  const { authState } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

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
    } catch {
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

  const scoredTutors = useMemo(() => {
    return tutors.map((tutor) => {
      let score = 0;
      const avgRating = tutor.avgRating ?? 0;

      const hasSubject = filters.subject && tutor.subjects?.some(s => s.subject === filters.subject);
      const hasGrade = filters.grade && tutor.subjects?.some(s => s.grade === filters.grade);
      const inRating = avgRating >= filters.minRating;
      const inPrice = tutor.hourlyRate >= filters.rateRange[0] && tutor.hourlyRate <= filters.rateRange[1];
      const locPref = filters.location === 'all' || !filters.location || tutor.location === filters.location;
      const secPref = filters.sector === 'all' || !filters.sector || tutor.sector === filters.sector;

      if (hasSubject) score += 3;
      if (hasGrade) score += 2;
      if (inRating) score += 2;
      if (inPrice) score += 1;
      if (locPref) score += 1;
      if (secPref) score += 1;

      return { ...tutor, score };
    });
  }, [tutors, filters]);

  const sortedTutors = useMemo(() => {
    return [...scoredTutors].sort((a, b) => {
      if (a.isTopRated && !b.isTopRated) return -1;
      if (!a.isTopRated && b.isTopRated) return 1;
      if (b.score !== a.score) return b.score - a.score;
      if (filters.sortBy === 'ratingDesc') {
        return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      }
      return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0);
    });
  }, [scoredTutors, filters]);

  // Pagination logic
  const totalPages = Math.ceil(sortedTutors.length / TUTORS_PER_PAGE);
  const currentTutors = sortedTutors.slice(
    (currentPage - 1) * TUTORS_PER_PAGE,
    currentPage * TUTORS_PER_PAGE
  );

  // Auth CTA
  if (!authState.isLoggedIn) {
    return (
      <div className="max-w-full mx-auto bg-muted/40 border border-border rounded-2xl shadow-md p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="bg-primary/10 text-primary rounded-full p-4">
            <LogIn size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('getPersonalizedTutors', 'Discover Your Ideal Tutor')}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(
            'signInToSeeRecommendations',
            'Sign in to receive personalized tutor recommendations based on your preferences.'
          )}
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
    <>
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {currentTutors.map((tutor) => (
            <GeneralTutorCard key={tutor.id} tutor={tutor} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-4 py-2 rounded-md border transition text-sm font-medium ${
                pageNum === currentPage
                  ? 'bg-primary text-white shadow'
                  : 'bg-muted hover:bg-muted/70 text-foreground'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default GeneralTutorGrid;
