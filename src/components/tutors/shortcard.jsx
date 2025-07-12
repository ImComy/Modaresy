import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ShortTutorCard = ({ tutor }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group rounded-xl overflow-hidden shadow-md bg-card border border-border hover:border-primary transition-all duration-300"
    >
      <Link to={`/tutor/${tutor.id}`} className="block w-full h-full">
        {/* Banner */}
        <div className="relative h-28 w-full overflow-hidden">
          <img
            src={tutor.bannerimg || 'https://placehold.co/600x200?text=Tutor'}
            alt="Tutor Banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/600x200?text=Tutor';
            }}
          />
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 z-10 relative transition-transform duration-300 group-hover:-translate-y-1">
          <Avatar className="h-20 w-20 border-2 border-primary rounded-md bg-background shadow-sm">
            <AvatarImage src={tutor.img} alt={tutor.name} />
            <AvatarFallback className="rounded-md">
              {tutor.name?.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name & Bio */}
        <div className="pt-4 pb-6 px-4 text-center">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
            {tutor.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {tutor.GeneralBio}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ShortTutorCard;
