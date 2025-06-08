import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { grades, sectors } from '@/data/formData';
import { useNavigate } from 'react-router-dom';

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

  function handleGradeChange(e) {
    setSelectedGrade(e.target.value);
  }

  function handleSectorChange(e) {
    setSelectedSector(e.target.value);
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
            <select
              id="filter-grade"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedGrade}
              onChange={handleGradeChange}
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey || option.label)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">{t("Select your Sector:")}</label>
            <select
              id="filter-sector"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedSector}
              onChange={handleSectorChange}
            >
              {sectorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey || option.label)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedGrade || !selectedSector}
            className={`bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full ${buttonClasses}`}
          >
            {t("Submit")}
          </button>

          <div className="flex items-center my-6">
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
              onClick={() => { navigate('/signup'); }}
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
          <button
            onClick={() => alert(t("Sign Up with Google clicked"))}
            className={`${buttonClasses} bg-red-500 flex items-center justify-center gap-2`}
          >
            <FaGoogle />{t("Sign Up with Google")}
          </button>
          <button
            onClick={() => alert(t("Sign Up with Facebook clicked"))}
            className={`${buttonClasses} bg-[#1877F2] flex items-center justify-center gap-2`}
          >
            <FaFacebookF /> {t("Sign Up with Facebook")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}