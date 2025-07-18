import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { grades, sectors } from '@/data/formData';
import { useNavigate } from 'react-router-dom';
import { SearchableSelectContent } from '@/components/ui/searchSelect'
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserOverlay({ onClose, onSubmit, onFiltersChange }) {
  const { t } = useTranslation();
  const isRTL = i18next.dir() === 'rtl';
  const navigate = useNavigate();

  const gradeOptions = [{ value: 'all', labelKey: 'allGrades' }, ...grades];
  const sectorOptions = [{ value: 'all', labelKey: 'allSectors' }, ...sectors];

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const buttonClasses =
    "w-full py-2 rounded-lg mb-3 font-semibold text-white transition-colors duration-300 hover:brightness-110";

  useEffect(() => {
    const gradeEl = document.getElementById("filter-grade");
    const sectorEl = document.getElementById("filter-sector");

    if (gradeEl) setSelectedGrade(gradeEl.value || "");
    if (sectorEl) setSelectedSector(sectorEl.value || "");

    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  function handleGradeChange(value) {
    setSelectedGrade(value);
  }

  function handleSectorChange(value) {
    setSelectedSector(value);
  }


  function handleSubmit() {
    if (selectedGrade && selectedSector) {
      localStorage.setItem('onSubmit', 'true');
      localStorage.setItem('filter-grade', selectedGrade);
      localStorage.setItem('filter-sector', selectedSector);

      onSubmit(selectedGrade, selectedSector);
      onClose();
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence style={{ direction: 'ltr' }}>
      <motion.div
        id="overlay-background"
        onClick={(e) => { if (e.target.id === "overlay-background") onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center signup-prompt-overlay bg-black/70 backdrop-blur-md"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.3 } },
          exit: { opacity: 0, transition: { duration: 0.3 } },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="signup-prompt-content w-full max-w-md p-6 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative"
          variants={{
            hidden: { scale: 0.9, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.4 },
            },
            exit: {
              scale: 0.9,
              opacity: 0,
              transition: { duration: 0.4, ease: "easeInOut" },
            },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <button
            onClick={onClose}
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-3xl font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 focus:outline-none`}
            aria-label={t("Close overlay")}
          >
            <motion.span
              whileHover={{ rotate: 90, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {t("×")}
            </motion.span>
          </button>

          <h2 className="text-2xl font-bold mb-6 text-primary">{t("Welcome!")}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t("Select your Grade:")}</label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SearchableSelectContent
                value={selectedGrade} 
                searchPlaceholder="Search grade..."
                items={gradeOptions.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey || option.label), 
                }))}
              />
            </Select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">{t("Select your Sector:")}</label>
            <Select value={selectedSector} onValueChange={handleSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SearchableSelectContent
                searchPlaceholder="Search sector..."
                items={sectorOptions.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey || option.label),
                }))}
              />
            </Select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedGrade || !selectedSector}
            className={`bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full ${buttonClasses}`}
          >
            {t("Submit")}
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-3 text-gray-500 dark:text-gray-400 font-semibold select-none">
              {t("or")}
            </span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>

          <div className="flex gap-6 mb-4">
            <Button
              variant="outline"
              className="text-primary border-primary w-[100%] bg-inherit hover:bg-inherit/90 hover:text-primary"
              onClick={() => { navigate('/login'); }}
            >
              {t("Log In")}
            </Button>
            <Button
              variant="outline"
              className="text-primary-foreground border-primary w-[100%] bg-primary hover:bg-primary/90 hover:text-primary-foreground"
              onClick={() => { navigate('/signup'); }}
            >
              {t("Sign Up")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}