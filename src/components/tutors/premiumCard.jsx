import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const PremiumShortTutorCard = ({ tutor }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => navigate(`/tutor/${tutor.id}`)}
      className={cn(
        'group relative overflow-hidden rounded-3xl shadow-xl border border-yellow-400 cursor-pointer',
        'bg-card transition-all duration-300 flex flex-col sm:flex-row',
        'hover:shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:border-yellow-300'
      )}
    >
      {/* Premium badge */}
      <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
        ★ Premium
      </div>

      {/* Image side */}
      <div className="w-full sm:w-1/2 aspect-[4/3]">
        <img
          src={tutor.img}
          alt={tutor.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* Info side */}
      <div className="relative w-full sm:w-1/2 flex flex-col justify-center items-center text-center px-6 py-6">
        <Quote className="absolute top-4 right-4 text-yellow-300/20 w-20 h-20 pointer-events-none" />

        <h3 className="text-xl font-bold text-foreground group-hover:text-yellow-400 transition-colors">
          {tutor.name}
        </h3>

        <p className="mt-3 text-sm text-muted-foreground max-w-sm line-clamp-4">
          {tutor.GeneralBio}
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-5 bg-yellow-400 text-black px-5 py-2 rounded-full shadow hover:bg-yellow-300 transition-all text-sm"
        >
          {t('viewProfile')}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumShortTutorCard;
