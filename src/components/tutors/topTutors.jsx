import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ShortTutorCard from './shortcard';
import { useTranslation } from 'react-i18next';

const TUTORS_PER_PAGE = 4;
const TOP_TUTOR_IDS = [1, 13, 11, 9];

export const TopTutors = ({ tutors }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const topTutors = tutors.filter((t) => TOP_TUTOR_IDS.includes(t.id));
  const totalPages = Math.ceil(topTutors.length / TUTORS_PER_PAGE);

  const currentTutors = topTutors.slice(
    (currentPage - 1) * TUTORS_PER_PAGE,
    currentPage * TUTORS_PER_PAGE
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {currentTutors.map((tutor) => (
            <ShortTutorCard key={tutor.id} tutor={tutor} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
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
    </div>
  );
};

export default TopTutors;
