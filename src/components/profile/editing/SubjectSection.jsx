import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, GraduationCap, Trash, Edit, Check, Info, BookOpen, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/*
  AddSubjectCard — supports arrays for language & sector.
  Auto-populates sectors & languages based on constants and SubjectsBySystem.
  Change for this variant:
    - When the selected subject is a language AND the education system is "National",
      pre-select *all existing languages from the education structure* as the default language tags.
    - Do NOT create any new language labels (do not inject the subject name into the language toggles).
    - Keep languages editable (user can remove/add toggles) — the preselection is only a default.
*/

const normalizeArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return Array.from(new Set(v.filter(Boolean).map(String)));
  return [String(v)];
};

const arrayJoin = (arr) => (Array.isArray(arr) ? arr.join(', ') : arr || '');

const AddSubjectCard = ({
  formData = { subjects: [] },
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  constants = {},
  t = (s) => s,
  isSubjectMutating
}) => {
  // newSubject: sector & language are arrays
  const [newSubject, setNewSubject] = useState({
    education_system: '',
    grade: '',
    sector: [],      // array of sectors
    language: [],    // array of languages
    name: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoTimeoutRef = useRef(null);
  const infoIconRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0, width: 0 });

  // track auto-selected flags to avoid repeating auto behavior
  const autoSelectedRef = useRef({
    system: false,
    grade: false,
    sector: false,
    language: false,
    subject: false
  });

  // Helper safe setter (shallow compare)
  const safeSetNewSubject = useCallback((updater) => {
    setNewSubject(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      // ensure sector/language are arrays
      next.sector = normalizeArray(next.sector);
      next.language = normalizeArray(next.language);
      // compare
      const same =
        prev.education_system === next.education_system &&
        prev.grade === next.grade &&
        arrayJoin(prev.sector) === arrayJoin(next.sector) &&
        arrayJoin(prev.language) === arrayJoin(next.language) &&
        prev.name === next.name;
      return same ? prev : next;
    });
  }, []);

  /* -------------------------
     Derived option lists (memoized)
     ------------------------- */
  const systems = useMemo(() => constants?.Education_Systems || [], [constants]);
  const educationStructure = useMemo(() => constants?.EducationStructure || {}, [constants]);
  const subjectsBySystem = useMemo(() => constants?.SubjectsBySystem || {}, [constants]);

  const availableGrades = useMemo(() => {
    if (!newSubject.education_system) return [];
    return educationStructure[newSubject.education_system]?.grades || [];
  }, [educationStructure, newSubject.education_system]);

  const availableLanguages = useMemo(() => {
    if (!newSubject.education_system) return [];
    return educationStructure[newSubject.education_system]?.languages || [];
  }, [educationStructure, newSubject.education_system]);

  // IMPORTANT CHANGE:
  // Do NOT inject the subject name into the toggles. Keep the toggles strictly the languages
  // defined by the education structure (availableLanguages). This prevents creating new language labels.
  const uiAvailableLanguages = useMemo(() => {
    return availableLanguages || [];
  }, [availableLanguages]);

  // For sectors we return the grade-specific sector list; may be [] for general grades
  const availableSectors = useMemo(() => {
    if (!newSubject.education_system || !newSubject.grade) return [];
    const s = educationStructure[newSubject.education_system]?.sectors?.[newSubject.grade];
    // normalize object/array possibilities: some structures may have object per sector names mapping
    if (!s) return [];
    if (Array.isArray(s)) return s;
    if (typeof s === 'object') {
      // if object with sector keys (e.g. { "Scientific": [...], "Literature": [...] }) return keys
      return Object.keys(s);
    }
    return [];
  }, [educationStructure, newSubject.education_system, newSubject.grade]);

  // subjects available for the selected system/grade/sector
  const availableSubjects = useMemo(() => {
    if (!newSubject.education_system || !newSubject.grade) return [];
    const systemSubjects = subjectsBySystem[newSubject.education_system] || {};
    const gradeEntry = systemSubjects[newSubject.grade];
    if (Array.isArray(gradeEntry)) return gradeEntry;
    if (gradeEntry && typeof gradeEntry === 'object') {
      // if gradeEntry is object keyed by sector names
      // if user selected a sector (or sectors), combine the subject lists for them
      if (Array.isArray(newSubject.sector) && newSubject.sector.length > 0) {
        const combined = newSubject.sector.flatMap(sec => gradeEntry[sec] || []);
        return Array.from(new Set(combined));
      }
      // otherwise combine all sectors
      const combined = Object.values(gradeEntry).flat();
      return Array.from(new Set(combined));
    }
    return [];
  }, [subjectsBySystem, newSubject.education_system, newSubject.grade, newSubject.sector]);

  // If there is exactly one system available, auto-select it so hidden-select flows still work
  useEffect(() => {
    if (systems && systems.length === 1) {
      const only = systems[0];
      if (newSubject.education_system !== only) {
        safeSetNewSubject({ education_system: only });
      }
    }
  }, [systems, newSubject.education_system, safeSetNewSubject]);

  /* -------------------------
     Editing mode sync
     ------------------------- */
  useEffect(() => {
    if (editingIndex === null) {
      // creation mode — make sure persisted values are valid
      safeSetNewSubject(prev => {
        const next = { ...prev };
        if (next.education_system && !systems.includes(next.education_system)) next.education_system = '';
        const gradesForSystem = educationStructure[next.education_system]?.grades || [];
        if (next.grade && !gradesForSystem.includes(next.grade)) next.grade = '';
        const sectorsForGrade = availableSectors || [];
        if (next.sector && next.sector.length > 0) {
          next.sector = next.sector.filter(s => sectorsForGrade.includes(s));
        }
        const langs = educationStructure[next.education_system]?.languages || [];
        if (next.language && next.language.length > 0 && langs.length) {
          next.language = next.language.filter(l => langs.includes(l));
        }
        next.name = next.name || '';
        return next;
      });
    } else {
      // populate from formData
      const subject = formData.subjects?.[editingIndex];
      if (subject) {
        safeSetNewSubject({
          education_system: subject.education_system || '',
          grade: subject.grade || '',
          sector: normalizeArray(subject.sector),
          language: normalizeArray(subject.language),
          name: subject.name || ''
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingIndex, formData.subjects, educationStructure, systems]);

  /* -------------------------
     Auto-populate sectors & languages after subject change
     ------------------------- */
  const computeAutoSectorsFor = useCallback((system, grade, subjectName) => {
    // Try to find sectors that include the subject under SubjectsBySystem
    if (!system || !grade || !subjectName) return [];
    const sys = subjectsBySystem[system];
    if (!sys) return [];
    const gradeEntry = sys[grade];
    if (!gradeEntry) return [];
    // if gradeEntry is array -> general grade
    if (Array.isArray(gradeEntry)) return ['General'];
    if (typeof gradeEntry === 'object') {
      const sectors = [];
      for (const [secName, arr] of Object.entries(gradeEntry)) {
        if (Array.isArray(arr) && arr.map(s => String(s).toLowerCase()).includes(String(subjectName).toLowerCase())) {
          sectors.push(secName);
        }
      }
      // if no sectors found but gradeEntry has sectors -> default to all sector keys
      if (sectors.length === 0) {
        // Some subjects may not be present under any sector arrays (rare). In that case choose all sectors
        return Object.keys(gradeEntry);
      }
      return sectors;
    }
    return [];
  }, [subjectsBySystem]);

  const isLanguageSubject = useCallback((subjectName) => {
    if (!subjectName || !constants?.Languages) return false;
    return constants.Languages.map(l => String(l).toLowerCase()).includes(String(subjectName).toLowerCase());
  }, [constants]);

  useEffect(() => {
    // Whenever subject name changes (user selects a subject), auto-populate sectors & languages
    const name = newSubject.name;
    if (!name) return;

    // compute auto sectors
    const autoSectors = computeAutoSectorsFor(newSubject.education_system, newSubject.grade, name);
    if (autoSectors && autoSectors.length > 0) {
      // set only if different
      const currentS = normalizeArray(newSubject.sector);
      const joinCurr = arrayJoin(currentS);
      const joinAuto = arrayJoin(autoSectors);
      if (joinCurr !== joinAuto) {
        safeSetNewSubject({ sector: autoSectors });
      }
    }

    // compute auto languages
    if (isLanguageSubject(name)) {
      // NEW BEHAVIOR: when the system is "National", preselect ALL existing language tags
      // from the education structure (availableLanguages) and DO NOT create any new labels.
      if (newSubject.education_system === 'National' && Array.isArray(availableLanguages) && availableLanguages.length > 0) {
        const autoLangs = Array.from(new Set(availableLanguages.map(String)));
        const currentL = normalizeArray(newSubject.language);
        if (arrayJoin(currentL).toLowerCase() !== arrayJoin(autoLangs).toLowerCase()) {
          safeSetNewSubject({ language: autoLangs });
        }
      } else {
        // Non-National behavior: keep legacy auto-selection (language subject + English) but still only choose labels
        // that exist in uiAvailableLanguages. This avoids creating new labels for unknown languages.
        const desired = ['English', String(name)];
        const valid = desired.filter(d => uiAvailableLanguages.map(x => x.toLowerCase()).includes(String(d).toLowerCase()));
        const autoLangs = Array.from(new Set(valid.length ? valid : uiAvailableLanguages));
        const currentL = normalizeArray(newSubject.language);
        if (arrayJoin(currentL).toLowerCase() !== arrayJoin(autoLangs).toLowerCase()) {
          safeSetNewSubject({ language: autoLangs });
        }
      }
    } else {
      // not a language subject: if language empty, default to uiAvailableLanguages (allow tutor to uncheck)
      const currentL = normalizeArray(newSubject.language);
      const av = uiAvailableLanguages || [];
      if ((!currentL || currentL.length === 0) && av && av.length > 0) {
        safeSetNewSubject({ language: av });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSubject.name, newSubject.education_system, newSubject.grade, computeAutoSectorsFor, uiAvailableLanguages, isLanguageSubject, availableLanguages]);

  /* -------------------------
     Multi-toggle helpers for languages/sectors
     ------------------------- */
  const toggleLanguage = useCallback((lang) => {
    setNewSubject(prev => {
      const langs = normalizeArray(prev.language);
      const idx = langs.findIndex(l => String(l).toLowerCase() === String(lang).toLowerCase());
      if (idx >= 0) langs.splice(idx, 1);
      else langs.push(lang);
      return { ...prev, language: Array.from(new Set(langs)) };
    });
  }, []);

  const toggleSector = useCallback((sec) => {
    setNewSubject(prev => {
      const secs = normalizeArray(prev.sector);
      const idx = secs.findIndex(s => String(s).toLowerCase() === String(sec).toLowerCase());
      if (idx >= 0) secs.splice(idx, 1);
      else secs.push(sec);
      return { ...prev, sector: Array.from(new Set(secs)) };
    });
  }, []);

  const selectAllLanguages = useCallback(() => {
    // select all existing UI languages (which are strictly the availableLanguages)
    safeSetNewSubject({ language: uiAvailableLanguages || [] });
  }, [uiAvailableLanguages, safeSetNewSubject]);

  const selectAllSectors = useCallback(() => {
    safeSetNewSubject({ sector: availableSectors || [] });
  }, [availableSectors, safeSetNewSubject]);

  /* -------------------------
     Handlers add/update/delete
     ------------------------- */
  const handleAddSubject = useCallback(() => {
    // validation: arrays must have at least one entry
    if (!newSubject.name || !newSubject.education_system || !newSubject.grade) {
      console.error('Missing required fields:', newSubject);
      return;
    }
    if (!newSubject.sector || newSubject.sector.length === 0) {
      console.error('Sector required (auto-populated):', newSubject);
      return;
    }
    if (!newSubject.language || newSubject.language.length === 0) {
      console.error('Language required (auto-populated):', newSubject);
      return;
    }

    const subjectData = {
      ...newSubject,
      // ensure arrays are copied
      sector: normalizeArray(newSubject.sector),
      language: normalizeArray(newSubject.language),
      private_pricing: {
        price: 0,
        currency: 'EGP',
        period: 'session'
      }
    };

    onAddSubject(subjectData);

    // keep context for quick add
    safeSetNewSubject(prev => ({
      ...prev,
      name: ''
      // keep education_system, grade, sector, language to speed up adding similar subjects
    }));

    autoSelectedRef.current.subject = false;
  }, [newSubject, onAddSubject, safeSetNewSubject]);

  const handleDelete = useCallback((index) => {
    onDeleteSubject(index);
    if (editingIndex === index) setEditingIndex(null);
  }, [onDeleteSubject, editingIndex]);

  const handleEditSubject = useCallback((index) => {
    setEditingIndex(index);
  }, []);

  const handleUpdateSubject = useCallback(() => {
    if (!newSubject.name || !newSubject.education_system || !newSubject.grade ||
        !newSubject.sector || newSubject.sector.length === 0 ||
        !newSubject.language || newSubject.language.length === 0 ||
        editingIndex === null) {
      console.error('Missing required fields for update:', newSubject);
      return;
    }
    onUpdateSubject(editingIndex, {
      ...newSubject,
      sector: normalizeArray(newSubject.sector),
      language: normalizeArray(newSubject.language)
    });
    setEditingIndex(null);
  }, [newSubject, editingIndex, onUpdateSubject]);

  const cancelEdit = useCallback(() => setEditingIndex(null), []);

  /* -------------------------
     Helpers for UI state
     ------------------------- */
  const gradeEntry = subjectsBySystem?.[newSubject.education_system]?.[newSubject.grade];
  const requiresSector = !!gradeEntry && typeof gradeEntry === 'object' && !Array.isArray(gradeEntry);
  const isSubjectDisabled = requiresSector ? !newSubject.sector || newSubject.sector.length === 0 : false;
  const hideSystemSelect = systems.length === 1;
  // if subject is a language subject we still want it editable but mark it as auto-preselected
  const selectedIsLanguage = isLanguageSubject(newSubject.name);

  // Info popup handlers
  const handleMouseEnterInfo = useCallback(() => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    // compute position for portal tooltip
    try {
      const el = infoIconRef.current;
      if (el && typeof el.getBoundingClientRect === 'function') {
        const r = el.getBoundingClientRect();
        setTooltipPos({ left: r.left + window.scrollX + r.width / 2, top: r.top + window.scrollY });
      }
    } catch (e) {
      // ignore in SSR or if DOM not ready
    }
    setShowInfoPopup(true);
  }, []);

  const handleMouseLeaveInfo = useCallback(() => {
    infoTimeoutRef.current = setTimeout(() => {
      setShowInfoPopup(false);
    }, 300);
  }, []);

  // keep tooltip positioned on scroll/resize while visible
  useEffect(() => {
    if (!showInfoPopup) return undefined;
    const update = () => {
      try {
        const el = infoIconRef.current;
        if (el && typeof el.getBoundingClientRect === 'function') {
          const r = el.getBoundingClientRect();
          setTooltipPos({ left: r.left + window.scrollX + r.width / 2, top: r.top + window.scrollY });
        }
      } catch (e) {}
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    // initial update
    update();
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [showInfoPopup]);

  /* -------------------------
     Render helpers
     ------------------------- */
  const renderSubjectDetails = useCallback((subject, index) => (
    <motion.div
      key={subject._id || subject.tempId || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/70 dark:to-gray-800/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-600/50 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <GraduationCap size={16} className="text-primary shrink-0" />
          </div>
          <span className="font-medium">
            {subject.name || t('unnamedSubject')}
          </span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEditSubject(index)} className="h-8 w-8">
            <Edit size={14} className="text-primary" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(index)} className="h-8 w-8">
            <Trash size={14} className="text-destructive" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {t('System')}
          </div>
          <div>{subject.education_system || t('notSpecified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {t('Grade')}
          </div>
          <div>{subject.grade || t('notSpecified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {t('Sector')}
          </div>
          <div>{Array.isArray(subject.sector) ? subject.sector.join(', ') : subject.sector || t('notSpecified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {t('Language')}
          </div>
          <div>{Array.isArray(subject.language) ? subject.language.join(', ') : subject.language || t('notSpecified')}</div>
        </div>
      </div>
    </motion.div>
  ), [t, handleEditSubject, handleDelete]);

  /* -------------------------
     JSX
     ------------------------- */
  return (
    <div className={cn(
      "w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-4 z-30 border border-gray-200 dark:border-gray-700",
      "max-h-[500px] overflow-y-auto flex-1 min-w-0 md:max-w-xs mt-0 md:-mt-32"
    )}>
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
          <GraduationCap size={20} className="text-primary" />
        </div>
        {editingIndex !== null ? t('editSubject') : t('addNewSubject')}
        
        {/* Info Icon with Popup */}
        <div 
          className="relative ml-2"
          onMouseEnter={handleMouseEnterInfo}
          onMouseLeave={handleMouseLeaveInfo}
        >
          <Info 
            ref={infoIconRef}
            size={16} 
            className="text-muted-foreground cursor-help" 
          />

          {showInfoPopup && typeof document !== 'undefined' && createPortal(
            <div
              style={{
                position: 'absolute',
                left: tooltipPos.left,
                top: tooltipPos.top - 10,
                transform: 'translate(-50%, -100%)',
                zIndex: 9999
              }}
              className="w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg"
            >
              {t('checkSectorsLanguagesTooltip') || 'Make sure to check and adjust the sectors and languages you teach for this subject.'}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>,
            document.body
          )}
        </div>
      </div>


      <div className="space-y-3">
        {/* Education System */}
        {hideSystemSelect ? (
          <input type="hidden" value={newSubject.education_system} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <BookOpen size={12} />
              {t('educationSystem')}
            </Label>
            <Select
              value={newSubject.education_system}
              onValueChange={(val) => safeSetNewSubject({ education_system: val, grade: '', name: '', sector: [], language: [] })}
            >
              <SelectTrigger className="h-10 bg-white dark:bg-gray-700">
                <SelectValue placeholder={t('selectSystem')} />
              </SelectTrigger>
              <SelectContent className="z-50" position="popper">
                {systems.map((system) => (
                  <SelectItem key={system} value={system}>{system}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Grade */}
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <Award size={12} />
            {t('grade')}
          </Label>
          <Select
            value={newSubject.grade}
            onValueChange={(val) => safeSetNewSubject({ grade: val, name: '', sector: [], language: [] })}
            disabled={!newSubject.education_system}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-gray-700" aria-disabled={!newSubject.education_system}>
              <SelectValue placeholder={!newSubject.education_system ? t('selectSystemFirst') : t('selectGrade')} />
            </SelectTrigger>
            <SelectContent className="z-50" position="popper">
              {availableGrades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1">
            <GraduationCap size={12} />
            {t('subject')}
          </Label>
          <Select
            value={newSubject.name}
            onValueChange={(val) => safeSetNewSubject({ name: val })}
            disabled={!newSubject.grade || availableSubjects.length === 0}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-gray-700" aria-disabled={!newSubject.grade || availableSubjects.length === 0}>
              <SelectValue placeholder={!newSubject.grade ? t('selectGradeFirst') : (availableSubjects.length === 0 ? t('noSubjectsAvailable') : t('selectSubject'))} />
            </SelectTrigger>
            <SelectContent className="z-50" position="popper">
              {availableSubjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Sector (multi-chip + toggles) */}
        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {t('sector')}
            </span>
            <small className="text-xs text-muted-foreground">Auto-populated — editable</small>
          </Label>

          {/* Selected chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(newSubject.sector && newSubject.sector.length > 0) ? newSubject.sector.map(s => (
              <div key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => toggleSector(s)}
                  title={t('removeSector') || 'Remove'}
                  className="opacity-70 hover:opacity-100 text-primary"
                >
                  ✕
                </button>
              </div>
            )) : <div className="text-xs text-muted-foreground">{t('noSectorSelected')}</div>}
          </div>

          {/* Toggle list */}
          <div className="grid grid-cols-2 gap-2">
            {(availableSectors && availableSectors.length > 0) ? availableSectors.map(sec => {
              const isSelected = (newSubject.sector || []).map(x => x.toLowerCase()).includes(sec.toLowerCase());
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => toggleSector(sec)}
                  className={cn(
                    "text-xs px-2 py-1 rounded-md border transition-all",
                    isSelected 
                      ? "bg-primary text-white border-primary" 
                      : "bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary/50"
                  )}
                >
                  {sec}
                </button>
              );
            }) : <div className="text-xs text-muted-foreground col-span-2">{t('noSectorsAvailable')}</div>}
            {/* quick select-all */}
            {availableSectors && availableSectors.length > 1 && (
              <button 
                type="button" 
                onClick={selectAllSectors} 
                className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('selectAllSectors') || 'Select all sectors'}
              </button>
            )}
          </div>
        </div>

        {/* Language (multi-chip + toggles). Auto-preselected for language subjects but still editable */}
        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {t('language')}
            </span>
            <small className="text-xs text-muted-foreground">{selectedIsLanguage ? (t('autoPreselectedEditable') || 'Auto-preselected — editable') : 'Editable'}</small>
          </Label>

          <div className="flex flex-wrap gap-1 mb-2">
            {(newSubject.language && newSubject.language.length > 0) ? newSubject.language.map(l => (
              <div key={l} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                <span>{l}</span>
                {/* allow removal even for language subjects (editable) */}
                <button
                  type="button"
                  onClick={() => toggleLanguage(l)}
                  title={t('removeLanguage') || 'Remove'}
                  className="opacity-70 hover:opacity-100 text-primary"
                >✕</button>
              </div>
            )) : <div className="text-xs text-muted-foreground">{t('noLanguageSelected')}</div>}
          </div>

          {/* Always show toggles — language subjects are only auto-preselected but still editable */}
          <div className="grid grid-cols-2 gap-2">
            {(uiAvailableLanguages && uiAvailableLanguages.length > 0) ? uiAvailableLanguages.map(lang => {
              const isSelected = (newSubject.language || []).map(x => x.toLowerCase()).includes(lang.toLowerCase());
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "text-xs px-2 py-1 rounded-md border transition-all",
                    isSelected 
                      ? "bg-primary text-white border-primary" 
                      : "bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary/50"
                  )}
                >
                  {lang}
                </button>
              );
            }) : <div className="text-xs text-muted-foreground col-span-2">{t('noLanguagesAvailable')}</div>}
            {uiAvailableLanguages && uiAvailableLanguages.length > 1 && (
              <button 
                type="button" 
                onClick={selectAllLanguages} 
                className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('selectAllLanguages') || 'Select all languages'}
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        {editingIndex !== null ? (
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="w-full h-10"
              onClick={handleUpdateSubject}
              disabled={!newSubject.name || (newSubject.sector || []).length === 0 || (newSubject.language || []).length === 0}
            >
              <Check size={16} className="mr-1" />
              {t('updateSubject')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={cancelEdit}
            >
              {t('cancel')}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-10 mt-2"
            onClick={handleAddSubject}
            disabled={!newSubject.name || (newSubject.sector || []).length === 0 || (newSubject.language || []).length === 0}
          >
            <Plus size={16} className="mr-1" />
            {t('addSubject')}
          </Button>
        )}
      </div>

      {/* Current Subjects List */}
      {formData.subjects?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-primary" />
            {t('yourSubjects')}
          </h3>
          <div className="flex flex-col gap-3">
            {formData.subjects.map((subject, index) => (
              renderSubjectDetails(subject, index)
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubjectCard;