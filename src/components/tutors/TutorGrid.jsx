import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TutorCard from './TutorCard';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/ui/loader';

const ErrorBanner = ({ message }) => (
  <Card className="max-w-md mx-auto mt-10 border-red-500/40 bg-red-50 dark:bg-red-950">
    <CardContent className="flex items-center gap-4 py-6 text-red-600 dark:text-red-300">
      <AlertTriangle className="w-6 h-6 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-base">Connection Error</h4>
        <p className="text-sm mt-1 text-red-500 dark:text-red-400">
          {message || 'An error occurred while connecting to the server. Please try again later.'}
        </p>
      </div>
    </CardContent>
  </Card>
);

const HIDE_DELAY_MS = 220;

const TutorGrid = ({ tutors, filters, loading = false, error = null }) => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(Boolean(loading));
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (loading) {
      setShowLoader(true);
    } else {
      hideTimerRef.current = window.setTimeout(() => {
        setShowLoader(false);
        hideTimerRef.current = null;
      }, HIDE_DELAY_MS);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [loading]);

  const isMissingRequiredFilters = useMemo(() => {
    return !filters || filters.subject === 'none' || filters.grade === 'none';
  }, [filters]);

  const filteredTutors = useMemo(() => {
    if (!tutors || !Array.isArray(tutors)) return [];

    const normalize = (v) => (v == null ? '' : String(v));

    const matches = (subjectValue, filterValue) => {
      // treat 'all' or 'none' or empty filter as no-op (always match)
      if (!filterValue || filterValue === 'all' || filterValue === 'none') return true;

      // if filterValue is an array, match if any of its values match the subjectValue
      if (Array.isArray(filterValue)) {
        return filterValue.some((fv) => matches(subjectValue, fv));
      }

      const f = String(filterValue).toLowerCase();

      if (Array.isArray(subjectValue)) {
        return subjectValue.some((sv) => String(sv).toLowerCase() === f);
      }

      return String(subjectValue).toLowerCase() === f;
    };

    return tutors.filter((tutor) => {
      if (!Array.isArray(tutor.subjects)) return false;

      return tutor.subjects.some((s) => {
        // subject and grade are required by upstream logic (TutorGrid shows missing filter message otherwise)
        const subjectMatch = normalize(s.subject) === normalize(filters.subject);
        const gradeMatch = normalize(s.grade) === normalize(filters.grade);
        if (!subjectMatch || !gradeMatch) return false;

        // language, education_system, and sector may be arrays or strings — use matches helper
        const languageMatch = matches(s.language, filters.language);
        const eduMatch = matches(s.education_system, filters.education_system);
        const sectorMatch = matches(s.sector, filters.sector);

        return languageMatch && eduMatch && sectorMatch;
      });
    });
  }, [tutors, filters?.subject, filters?.grade, filters?.language, filters?.education_system]);

  if (error) return <ErrorBanner message={error} />;

  if (isMissingRequiredFilters) {
    return (
      <Card className="max-w-md mx-auto mt-10 border-red-500/40 bg-red-50 dark:bg-red-950">
        <CardContent className="flex items-center gap-4 py-6 text-red-600 dark:text-red-300">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-base">
              {t('missingFilters', 'Missing Required Filters')}
            </h4>
            <p className="text-sm mt-1 text-red-500 dark:text-red-400">
              {t('selectSubjectGrade', 'Please select both a subject and grade to see tutor results.')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || showLoader) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-primary" loadingText="Loading Tutors..." />
        </div>
      </div>
    );
  }

  if (filteredTutors.length === 0) {
    return (
      <Card className="max-w-md mx-auto mt-10 bg-muted/60 dark:bg-muted/40">
        <CardContent className="flex items-center gap-4 py-6 text-muted-foreground">
          <UserX className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-base">{t('noTutorsFound', 'No Tutors Found')}</h4>
            <p className="text-sm mt-1">{t('tryChangingFilters', 'Try adjusting your filters to see results.')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={`tutor-grid-${filteredTutors.length}-${filters?.subject || ''}-${filters?.grade || ''}`}
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {filteredTutors.map((tutor) => (
          <motion.div
            key={tutor.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <TutorCard tutor={tutor} filters={filters} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(TutorGrid);
