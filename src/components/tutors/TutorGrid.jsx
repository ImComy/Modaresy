
    import React from 'react';
    import { AnimatePresence, motion } from 'framer-motion';
    import TutorCard from './TutorCard';
    import { useTranslation } from 'react-i18next';

    const TutorGrid = ({ tutors }) => {
      const { t } = useTranslation();

      if (!tutors || tutors.length === 0) {
        return <p className="text-center text-muted-foreground py-8">{t('noTutorsFound')}</p>;
      }

      return (
        <AnimatePresence>
          <motion.div
            layout // Enable layout animation for the grid itself
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" // Added xl:grid-cols-4
          >
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </motion.div>
        </AnimatePresence>
      );
    };

    export default TutorGrid;
  