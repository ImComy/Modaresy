import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useNavigate } from 'react-router-dom';
import { SearchableSelectContent } from '@/components/ui/searchSelect'
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getConstants } from '@/api/constantsFetch';

export default function UserOverlay({ onClose, onSubmit, onFiltersChange }) {
  const { t } = useTranslation();
  const isRTL = i18next.dir() === 'rtl';
  const navigate = useNavigate();
  const [constants, setConstants] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedEducationSystem, setSelectedEducationSystem] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const buttonClasses = "w-full py-2 rounded-lg mb-3 font-semibold text-white transition-colors duration-300 hover:brightness-110";

  useEffect(() => {
    const loadConstants = async () => {
      try {
        const data = await getConstants();
        setConstants(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load constants:', error);
        setIsLoading(false);
      }
    };
    loadConstants();

    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Update available grades when education system changes
  useEffect(() => {
    if (selectedEducationSystem && constants?.EducationStructure) {
      const systemGrades = constants.EducationStructure[selectedEducationSystem]?.grades || [];
      setAvailableGrades(systemGrades);
      setSelectedGrade('');
      setSelectedSector('');
      
      // Update available languages
      const systemLanguages = constants.EducationStructure[selectedEducationSystem]?.languages || [];
      const languagesToShow = systemLanguages.length > 0 ? systemLanguages : ['Arabic'];
      setAvailableLanguages(languagesToShow);
      if (!languagesToShow.includes(selectedLanguage)) {
        setSelectedLanguage('');
      }
    } else {
      setAvailableGrades([]);
      setAvailableLanguages([]);
    }
  }, [selectedEducationSystem, constants]);

  // Update sectors when grade changes
  useEffect(() => {
    if (selectedGrade && selectedEducationSystem && constants?.EducationStructure) {
      const gradeSectors = constants.EducationStructure[selectedEducationSystem]?.sectors[selectedGrade] || [];
      setAvailableSectors(gradeSectors);
      if (!gradeSectors.includes(selectedSector)) {
        setSelectedSector('');
      }
    } else {
      setAvailableSectors([]);
    }
  }, [selectedGrade, selectedEducationSystem, constants]);

  function handleSubmit() {
    if (selectedEducationSystem && selectedLanguage && selectedGrade && selectedSector) {
      const preferences = {
        education_system: selectedEducationSystem,
        language: selectedLanguage,
        grade: selectedGrade,
        sector: selectedSector
      };
      
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      onSubmit(preferences);
      onClose();
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-white">{t('loading')}</div>
        </motion.div>
      </AnimatePresence>
    );
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

          <div className="space-y-4">
            {/* Education System */}
            <div>
              <label className="block text-sm font-medium mb-1">{t("Education System")}</label>
              <Select 
                value={selectedEducationSystem} 
                onValueChange={setSelectedEducationSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select system")} />
                </SelectTrigger>
                {constants?.Education_Systems && (
                  <SearchableSelectContent
                    searchPlaceholder={t("Search system...")}
                    items={constants.Education_Systems.map(system => ({
                      value: system,
                      label: system,
                    }))}
                  />
                )}
              </Select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-1">{t("Language")}</label>
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
                disabled={!selectedEducationSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    selectedEducationSystem ? t("Select language") : t("Select system first")
                  } />
                </SelectTrigger>
                {selectedEducationSystem && (
                  <SearchableSelectContent
                    searchPlaceholder={t("Search language...")}
                    items={availableLanguages.map(lang => ({
                      value: lang,
                      label: lang,
                    }))}
                  />
                )}
              </Select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium mb-1">{t("Grade")}</label>
              <Select 
                value={selectedGrade} 
                onValueChange={setSelectedGrade}
                disabled={!selectedEducationSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    selectedEducationSystem ? t("Select grade") : t("Select system first")
                  } />
                </SelectTrigger>
                {selectedEducationSystem && (
                  <SearchableSelectContent
                    searchPlaceholder={t("Search grade...")}
                    items={availableGrades.map(grade => ({
                      value: grade,
                      label: grade,
                    }))}
                  />
                )}
              </Select>
            </div>

            {/* Sector */}
            {availableSectors.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">{t("Sector")}</label>
                <Select 
                  value={selectedSector} 
                  onValueChange={setSelectedSector}
                  disabled={!selectedGrade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      selectedGrade ? t("Select sector") : t("Select grade first")
                    } />
                  </SelectTrigger>
                  {selectedGrade && (
                    <SearchableSelectContent
                      searchPlaceholder={t("Search sector...")}
                      items={availableSectors.map(sector => ({
                        value: sector,
                        label: sector,
                      }))}
                    />
                  )}
                </Select>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedEducationSystem || !selectedLanguage || !selectedGrade || !selectedSector}
            className={`bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full mt-6 ${buttonClasses}`}
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