import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TutorCard from './TutorCard';
import { useTranslation } from 'react-i18next';

const TutorGrid = ({ tutors, filters, sortBy }) => {
  const { t } = useTranslation();

  // Show custom message if subject or grade is not selected
  if (filters?.subject === 'none' || filters?.grade === 'none') {
    return (
      <p className="text-center text-red-600 font-semibold py-8">
        Please enter grade or subject
      </p>
    );
  }

  // Default no tutors found message
  if (!tutors || tutors.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {t('noTutorsFound')}
      </p>
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