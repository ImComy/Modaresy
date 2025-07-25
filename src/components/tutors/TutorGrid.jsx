import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TutorCard from './TutorCard';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TutorGrid = ({ tutors, filters }) => {
  const { t } = useTranslation();

  const isMissingRequiredFilters = useMemo(() => {
    return !filters || filters.subject === 'none' || filters.grade === 'none';
  }, [filters]);

  const filteredTutors = useMemo(() => {
    if (!tutors || !Array.isArray(tutors)) return [];
    return tutors.filter(
      (tutor) =>
        Array.isArray(tutor.subjects) &&
        tutor.subjects.some(
          (s) => s.subject === filters.subject && s.grade === filters.grade
        )
    );
  }, [tutors, filters.subject, filters.grade]);

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
    <AnimatePresence mode="wait">
      <motion.div
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
