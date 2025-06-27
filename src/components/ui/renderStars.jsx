import React from 'react';
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span dir="ltr" className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={14} className="text-secondary" />
      ))}
      {halfStar && (
        <FaStarHalfAlt key="half" size={14} className="text-secondary" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaStar key={`empty-${i}`} size={14} className="text-gray-400 dark:text-gray-600" />
      ))}
    </span>
  );
};

export default renderStars;
