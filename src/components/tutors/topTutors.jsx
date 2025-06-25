import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ShortTutorCard from './shortcard';
import { useTranslation } from 'react-i18next';

const TUTORS_PER_PAGE = 4;

// Replace with the tutor IDs you want to show
const TOP_TUTOR_IDS = [1, 2, 3, 4];

export const TopTutors = ({ tutors }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 Filter only tutors with the matching IDs
  const topTutors = tutors.filter((t) => TOP_TUTOR_IDS.includes(t.id));
  const totalPages = Math.ceil(topTutors.length / TUTORS_PER_PAGE);

  const currentTutors = topTutors.slice(
    (currentPage - 1) * TUTORS_PER_PAGE,
    currentPage * TUTORS_PER_PAGE
  );

  return (
    <>
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {currentTutors.map((tutor) => (
            <ShortTutorCard key={tutor.id} tutor={tutor} />
          ))}
        </motion.div>
      </AnimatePresence>

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

export default TopTutors;
