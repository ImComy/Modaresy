import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const ShortTutorCard = ({ tutor }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-3xl shadow-xl border border-border bg-card hover:shadow-2xl transition-all duration-300',
        'flex flex-col sm:flex-row'
      )}
    >
      {/* Image side */}
      <div className="w-full sm:w-1/2 aspect-[4/3]">
        <img
          src={tutor.img}
          alt={tutor.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Info side */}
      <Link
        to={`/tutor/${tutor.id}`}
        className="relative w-full sm:w-1/2 flex flex-col justify-center items-center text-center px-6 py-6"
      >
        {/* Background quote icon */}
        <Quote className="absolute top-4 right-4 text-muted-foreground/10 w-20 h-20 pointer-events-none" />

        {/* Name */}
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {tutor.name}
        </h3>

        {/* Bio: clamp to 4 lines */}
        <p className="mt-3 text-sm text-muted-foreground max-w-sm line-clamp-4">
          {tutor.GeneralBio}
        </p>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-5 bg-primary text-white px-5 py-2 rounded-full shadow hover:bg-primary/90 transition-all text-sm"
        >
          {t('viewProfile')}
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default ShortTutorCard;
