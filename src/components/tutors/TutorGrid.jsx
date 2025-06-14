import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TutorCard from './TutorCard';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TutorGrid = ({ tutors, filters, sortBy }) => {
  const { t } = useTranslation();

  // Show custom message if subject or grade is not selected
  if (filters?.subject === 'none' || filters?.grade === 'none') {
    return (
      <Card className="max-w-md mx-auto mt-10 border-red-500/40 bg-red-50 dark:bg-red-950">
        <CardContent className="flex items-center gap-4 py-6 text-red-600 dark:text-red-300">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-base">Missing Required Filters</h4>
            <p className="text-sm mt-1 text-red-500 dark:text-red-400">
              Please select both a subject and grade to see tutor results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tutors || tutors.length === 0) {
    return (
      <Card className="max-w-md mx-auto mt-10 bg-muted/60 dark:bg-muted/40">
        <CardContent className="flex items-center gap-4 py-6 text-muted-foreground">
          <UserX className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-base">{t('noTutorsFound')}</h4>
            <p className="text-sm mt-1">{t('tryChangingFilters')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {tutors
          .filter(tutor =>
            Array.isArray(tutor.subjects) &&
            tutor.subjects.some(
              s => s.subject === filters.subject && s.grade === filters.grade
            )
          )
          .map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} filters={filters} />
          ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorGrid;