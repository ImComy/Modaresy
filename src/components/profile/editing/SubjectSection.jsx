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
import { useTranslation } from 'react-i18next';

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
  isSubjectMutating
}) => {
  const { t, i18n } = useTranslation();
  const dir = (i18n && typeof i18n.dir === 'function') ? i18n.dir() : 'ltr';
  const textAlign = dir === 'rtl' ? 'right' : 'left';

  const [newSubject, setNewSubject] = useState({
    education_system: '',
    grade: '',
    sector: [],
    language: [],
    name: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoTimeoutRef = useRef(null);
  const infoIconRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0, width: 0 });

  const autoSelectedRef = useRef({
    system: false,
    grade: false,
    sector: false,
    language: false,
    subject: false
  });

  const safeSetNewSubject = useCallback((updater) => {
    setNewSubject(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      next.sector = normalizeArray(next.sector);
      next.language = normalizeArray(next.language);
      const same =
        prev.education_system === next.education_system &&
        prev.grade === next.grade &&
        arrayJoin(prev.sector) === arrayJoin(next.sector) &&
        arrayJoin(prev.language) === arrayJoin(next.language) &&
        prev.name === next.name;
      return same ? prev : next;
    });
  }, []);

  const systems = useMemo(() => {
    const cs = constants?.Education_Systems || (t('constants.Education_Systems', { returnObjects: true }) || {});
    return Array.isArray(cs) ? cs : Object.keys(cs || {});
  }, [constants, t]);

  const educationStructure = useMemo(() => {
    const es = constants?.EducationStructure || (t('constants.EducationStructure', { returnObjects: true }) || {});
    if (es && typeof es === 'object') return es;
    return {};
  }, [constants, t]);

  const subjectsBySystem = useMemo(() => {
    if (constants?.SubjectsBySystem) return constants.SubjectsBySystem;
    const subjectsObj = constants?.Subjects || t('constants.Subjects', { returnObjects: true }) || {};
    return { fallback: Object.keys(subjectsObj || {}) };
  }, [constants, t]);

  const availableGrades = useMemo(() => {
    if (!newSubject.education_system) return [];
    const gradesObj = educationStructure[newSubject.education_system]?.grades || educationStructure[newSubject.education_system]?.grades;
    if (!gradesObj) return [];
    if (Array.isArray(gradesObj)) return gradesObj;
    if (typeof gradesObj === 'object') return Object.keys(gradesObj);
    return [];
  }, [educationStructure, newSubject.education_system]);

  const availableLanguages = useMemo(() => {
    if (!newSubject.education_system) return [];
    const langs = educationStructure[newSubject.education_system]?.languages || {};
    if (Array.isArray(langs)) return langs;
    if (typeof langs === 'object') return Object.keys(langs);
    return [];
  }, [educationStructure, newSubject.education_system]);

  const uiAvailableLanguages = useMemo(() => {
    return availableLanguages || [];
  }, [availableLanguages]);

  const availableSectors = useMemo(() => {
    if (!newSubject.education_system || !newSubject.grade) return [];
    const s = educationStructure[newSubject.education_system]?.sectors?.[newSubject.grade];
    if (!s) return [];
    if (Array.isArray(s)) return s;
    if (typeof s === 'object') {
      return Object.keys(s);
    }
    return [];
  }, [educationStructure, newSubject.education_system, newSubject.grade]);

  const availableSubjects = useMemo(() => {
    if (!newSubject.education_system || !newSubject.grade) return [];
    const sys = subjectsBySystem[newSubject.education_system] || subjectsBySystem.fallback || {};
    const gradeEntry = sys[newSubject.grade];
    if (Array.isArray(gradeEntry)) return gradeEntry;
    if (gradeEntry && typeof gradeEntry === 'object') {
      if (Array.isArray(newSubject.sector) && newSubject.sector.length > 0) {
        const combined = newSubject.sector.flatMap(sec => gradeEntry[sec] || []);
        return Array.from(new Set(combined));
      }
      const combined = Object.values(gradeEntry).flat();
      return Array.from(new Set(combined));
    }
    if (Array.isArray(sys)) return sys;
    if (typeof sys === 'object') return Object.keys(sys);
    return [];
  }, [subjectsBySystem, newSubject.education_system, newSubject.grade, newSubject.sector]);

  useEffect(() => {
    if (systems && systems.length === 1) {
      const only = systems[0];
      if (newSubject.education_system !== only) {
        safeSetNewSubject({ education_system: only });
      }
    }
  }, [systems, newSubject.education_system, safeSetNewSubject]);

  useEffect(() => {
    if (editingIndex === null) {
      safeSetNewSubject(prev => {
        const next = { ...prev };
        if (next.education_system && !systems.includes(next.education_system)) next.education_system = '';
        const gradesForSystem = availableGrades || [];
        if (next.grade && !gradesForSystem.includes(next.grade)) next.grade = '';
        const sectorsForGrade = availableSectors || [];
        if (next.sector && next.sector.length > 0) {
          next.sector = next.sector.filter(s => sectorsForGrade.includes(s));
        }
        const langs = availableLanguages || [];
        if (next.language && next.language.length > 0 && langs.length) {
          next.language = next.language.filter(l => langs.includes(l));
        }
        next.name = next.name || '';
        return next;
      });
    } else {
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
  }, [editingIndex, formData.subjects, educationStructure, systems, availableGrades, availableSectors, availableLanguages, safeSetNewSubject]);

  const computeAutoSectorsFor = useCallback((system, grade, subjectName) => {
    if (!system || !grade || !subjectName) return [];
    const sys = subjectsBySystem[system] || {};
    const gradeEntry = sys[grade];
    if (!gradeEntry) return [];
    if (Array.isArray(gradeEntry)) return ['General'];
    if (typeof gradeEntry === 'object') {
      const sectors = [];
      for (const [secName, arr] of Object.entries(gradeEntry)) {
        if (Array.isArray(arr) && arr.map(s => String(s).toLowerCase()).includes(String(subjectName).toLowerCase())) {
          sectors.push(secName);
        }
      }
      if (sectors.length === 0) {
        return Object.keys(gradeEntry);
      }
      return sectors;
    }
    return [];
  }, [subjectsBySystem]);

  const isLanguageSubject = useCallback((subjectName) => {
    if (!subjectName) return false;
    const langsConst = constants?.Languages || t('constants.Languages', { returnObjects: true }) || {};
    const langs = Array.isArray(langsConst) ? langsConst : Object.keys(langsConst || {});
    return langs.map(l => String(l).toLowerCase()).includes(String(subjectName).toLowerCase());
  }, [constants, t]);

  useEffect(() => {
    const name = newSubject.name;
    if (!name) return;

    const autoSectors = computeAutoSectorsFor(newSubject.education_system, newSubject.grade, name);
    if (autoSectors && autoSectors.length > 0) {
      const currentS = normalizeArray(newSubject.sector);
      const joinCurr = arrayJoin(currentS);
      const joinAuto = arrayJoin(autoSectors);
      if (joinCurr !== joinAuto) {
        safeSetNewSubject({ sector: autoSectors ?? autoSectors });
      }
    }

    if (isLanguageSubject(name)) {
      if (newSubject.education_system === 'National' && Array.isArray(availableLanguages) && availableLanguages.length > 0) {
        const autoLangs = Array.from(new Set(availableLanguages.map(String)));
        const currentL = normalizeArray(newSubject.language);
        if (arrayJoin(currentL).toLowerCase() !== arrayJoin(autoLangs).toLowerCase()) {
          safeSetNewSubject({ language: autoLangs });
        }
      } else {
        const desired = ['English', String(name)];
        const valid = desired.filter(d => uiAvailableLanguages.map(x => x.toLowerCase()).includes(String(d).toLowerCase()));
        const autoLangs = Array.from(new Set(valid.length ? valid : uiAvailableLanguages));
        const currentL = normalizeArray(newSubject.language);
        if (arrayJoin(currentL).toLowerCase() !== arrayJoin(autoLangs).toLowerCase()) {
          safeSetNewSubject({ language: autoLangs });
        }
      }
    } else {
      const currentL = normalizeArray(newSubject.language);
      const av = uiAvailableLanguages || [];
      if ((!currentL || currentL.length === 0) && av && av.length > 0) {
        safeSetNewSubject({ language: av });
      }
    }
  }, [newSubject.name, newSubject.education_system, newSubject.grade, computeAutoSectorsFor, uiAvailableLanguages, isLanguageSubject, availableLanguages, safeSetNewSubject]);

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
    safeSetNewSubject({ language: uiAvailableLanguages || [] });
  }, [uiAvailableLanguages, safeSetNewSubject]);

  const selectAllSectors = useCallback(() => {
    safeSetNewSubject({ sector: availableSectors || [] });
  }, [availableSectors, safeSetNewSubject]);

  const handleAddSubject = useCallback(() => {
    if (!newSubject.name || !newSubject.education_system || !newSubject.grade) {
      return;
    }
    if (!newSubject.sector || newSubject.sector.length === 0) {
      return;
    }
    if (!newSubject.language || newSubject.language.length === 0) {
      return;
    }

    const subjectData = {
      ...newSubject,
      sector: normalizeArray(newSubject.sector),
      language: normalizeArray(newSubject.language),
      private_pricing: {
        price: 0,
        currency: 'EGP',
        period: 'session'
      }
    };

    onAddSubject(subjectData);

    safeSetNewSubject(prev => ({
      ...prev,
      name: ''
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

  const gradeEntry = subjectsBySystem?.[newSubject.education_system]?.[newSubject.grade];
  const requiresSector = !!gradeEntry && typeof gradeEntry === 'object' && !Array.isArray(gradeEntry);
  const isSubjectDisabled = requiresSector ? !newSubject.sector || newSubject.sector.length === 0 : false;
  const hideSystemSelect = systems.length === 1;
  const selectedIsLanguage = isLanguageSubject(newSubject.name);

  const handleMouseEnterInfo = useCallback(() => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    try {
      const el = infoIconRef.current;
      if (el && typeof el.getBoundingClientRect === 'function') {
        const r = el.getBoundingClientRect();
        setTooltipPos({ left: r.left + window.scrollX + r.width / 2, top: r.top + window.scrollY });
      }
    } catch (e) {}
    setShowInfoPopup(true);
  }, []);

  const handleMouseLeaveInfo = useCallback(() => {
    infoTimeoutRef.current = setTimeout(() => {
      setShowInfoPopup(false);
    }, 300);
  }, []);

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
    update();
    return () => {
    };
  }, [showInfoPopup]);

  const translateConst = (pathBase, key, fallback) => {
    if (!key && key !== 0) return fallback || '';
    const full = `${pathBase}.${key}`;
    const translated = t(full, { defaultValue: null });
    if (translated && translated !== 'null') return translated;
    return fallback || key;
  };

  const renderSubjectDetails = useCallback((subject, index) => (
    <motion.div
      key={subject._id || subject.tempId || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/70 dark:to-gray-800/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-600/50 shadow-sm"
      style={{ direction: dir }}
    >
      <div className="flex items-center justify-between mb-2" style={{ textAlign }}>
        <div className="flex items-center gap-2" style={{ justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start' }}>
          <div className="p-1 rounded-md bg-primary/10" style={{ order: dir === 'rtl' ? 2 : 0 }}>
            <GraduationCap size={16} className="text-primary shrink-0" />
          </div>
          <span className="font-medium">{translateConst('constants.Subjects', subject.name || subject.subject_id?.name, subject.name || subject.subject_id?.name)}</span>
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
      <div className="grid grid-cols-2 gap-2 text-xs" style={{ textAlign }}>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('System', 'System')}</div>
          <div>{translateConst('constants.Education_Systems', subject.education_system, subject.education_system) || t('notSpecified', 'Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Grade', 'Grade')}</div>
          <div>{translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.grades`, subject.grade, subject.grade) || t('notSpecified', 'Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Sector', 'Sector')}</div>
          <div>{Array.isArray(subject.sector) ? subject.sector.map(s => translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.sectors`, s, s)).join(', ') : translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.sectors`, subject.sector, subject.sector) || t('notSpecified', 'Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Language', 'Language')}</div>
          <div>{Array.isArray(subject.language) ? subject.language.map(l => translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.languages`, l, translateConst('constants.Languages', l, l))).join(', ') : translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.languages`, subject.language, translateConst('constants.Languages', subject.language, subject.language)) || t('notSpecified', 'Not specified')}</div>
        </div>
      </div>
    </motion.div>
  ), [t, handleEditSubject, handleDelete, dir, textAlign]);

  return (
    <div
      dir={dir}
      style={{ direction: dir }}
      className={cn(
        "w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-4 z-30 border border-gray-200 dark:border-gray-700",
        "max-h-[500px] overflow-y-auto flex-1 min-w-0 md:max-w-xs mt-0 md:-mt-32"
      )}
    >
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700" style={{ textAlign }}>
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10" style={{ marginInlineEnd: dir === 'rtl' ? 0 : undefined }}>
          <GraduationCap size={20} className="text-primary" />
        </div>
        {editingIndex !== null ? t('editSubject', 'Edit subject') : t('addNewSubject', 'Add new subject')}
        <div
          className="relative ml-2"
          onMouseEnter={handleMouseEnterInfo}
          onMouseLeave={handleMouseLeaveInfo}
        >
          <Info
            ref={infoIconRef}
            size={16}
            className="text-muted-foreground cursor-help"
            aria-label={t('info', 'Info')}
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
              {t('checkSectorsLanguagesTooltip', 'Make sure to check and adjust the sectors and languages you teach for this subject.')}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>,
            document.body
          )}
        </div>
      </div>

      <div className="space-y-3">
        {hideSystemSelect ? (
          <input type="hidden" value={newSubject.education_system} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
              <BookOpen size={12} />
              {t('educationSystem', 'Education system')}
            </Label>
            <Select
              value={newSubject.education_system}
              onValueChange={(val) => safeSetNewSubject({ education_system: val, grade: '', name: '', sector: [], language: [] })}
            >
              <SelectTrigger className="h-10 bg-white dark:bg-gray-700">
                <SelectValue placeholder={t('selectSystem', 'Select system')} />
              </SelectTrigger>
              <SelectContent className="z-50" position="popper">
                {systems.map((system) => (
                  <SelectItem key={system} value={system}>{translateConst('constants.Education_Systems', system, system)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
            <Award size={12} />
            {t('grade', 'Grade')}
          </Label>
          <Select
            value={newSubject.grade}
            onValueChange={(val) => safeSetNewSubject({ grade: val, name: '', sector: [], language: [] })}
            disabled={!newSubject.education_system}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-gray-700" aria-disabled={!newSubject.education_system}>
              <SelectValue placeholder={!newSubject.education_system ? t('selectSystemFirst', 'Select system first') : t('selectGrade', 'Select grade')} />
            </SelectTrigger>
            <SelectContent className="z-50" position="popper">
              {availableGrades.map((grade) => <SelectItem key={grade} value={grade}>{translateConst(`constants.EducationStructure.${newSubject.education_system}.grades`, grade, translateConst('constants.EducationStructure.National.grades', grade, grade))}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
            <GraduationCap size={12} />
            {t('subject', 'Subject')}
          </Label>
          <Select
            value={newSubject.name}
            onValueChange={(val) => safeSetNewSubject({ name: val })}
            disabled={!newSubject.grade || availableSubjects.length === 0}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-gray-700" aria-disabled={!newSubject.grade || availableSubjects.length === 0}>
              <SelectValue placeholder={!newSubject.grade ? t('selectGradeFirst', 'Select grade first') : (availableSubjects.length === 0 ? t('noSubjectsAvailable', 'No subjects available') : t('selectSubject', 'Select subject'))} />
            </SelectTrigger>
            <SelectContent className="z-50" position="popper">
              {availableSubjects.map((subject) => <SelectItem key={subject} value={subject}>{translateConst('constants.Subjects', subject, subject)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between" style={{ textAlign }}>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {t('sector', 'Sector')}
            </span>
            <small className="text-xs text-muted-foreground">{t('autoPopulatedEditable', 'Auto-populated — editable')}</small>
          </Label>

          <div className="flex flex-wrap gap-1 mb-2" style={{ textAlign }}>
            {(newSubject.sector && newSubject.sector.length > 0) ? newSubject.sector.map(s => (
              <div key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                <span>{translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.sectors`, s, s)}</span>
                <button
                  type="button"
                  onClick={() => toggleSector(s)}
                  title={t('removeSector', 'Remove')}
                  className="opacity-70 hover:opacity-100 text-primary"
                >
                  ✕
                </button>
              </div>
            )) : <div className="text-xs text-muted-foreground">{t('noSectorSelected', 'No sector selected')}</div>}
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ textAlign }}>
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
                  {translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.sectors`, sec, sec)}
                </button>
              );
            }) : <div className="text-xs text-muted-foreground col-span-2">{t('noSectorsAvailable', 'No sectors available')}</div>}
            {availableSectors && availableSectors.length > 1 && (
              <button
                type="button"
                onClick={selectAllSectors}
                className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('selectAllSectors', 'Select all sectors')}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between" style={{ textAlign }}>
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {t('language', 'Language')}
            </span>
            <small className="text-xs text-muted-foreground">{selectedIsLanguage ? t('autoPreselectedEditable', 'Auto-preselected — editable') : t('editable', 'Editable')}</small>
          </Label>

          <div className="flex flex-wrap gap-1 mb-2" style={{ textAlign }}>
            {(newSubject.language && newSubject.language.length > 0) ? newSubject.language.map(l => (
              <div key={l} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                <span>{translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.languages`, l, translateConst('constants.Languages', l, l))}</span>
                <button
                  type="button"
                  onClick={() => toggleLanguage(l)}
                  title={t('removeLanguage', 'Remove')}
                  className="opacity-70 hover:opacity-100 text-primary"
                >✕</button>
              </div>
            )) : <div className="text-xs text-muted-foreground">{t('noLanguageSelected', 'No language selected')}</div>}
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ textAlign }}>
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
                  {translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.languages`, lang, translateConst('constants.Languages', lang, lang))}
                </button>
              );
            }) : <div className="text-xs text-muted-foreground col-span-2">{t('noLanguagesAvailable', 'No languages available')}</div>}
            {uiAvailableLanguages && uiAvailableLanguages.length > 1 && (
              <button
                type="button"
                onClick={selectAllLanguages}
                className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('selectAllLanguages', 'Select all languages')}
              </button>
            )}
          </div>
        </div>

        {editingIndex !== null ? (
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="w-full h-10"
              onClick={handleUpdateSubject}
              disabled={!newSubject.name || (newSubject.sector || []).length === 0 || (newSubject.language || []).length === 0}
            >
              <Check size={16} className="mr-1" />
              {t('updateSubject', 'Update subject')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={cancelEdit}
            >
              {t('cancel', 'Cancel')}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-10 mt-2"
            onClick={handleAddSubject}
            disabled={!newSubject.name || (newSubject.sector || []).length === 0 || (newSubject.language || []).length === 0}
          >
            <Plus size={16} className="mr-1" />
            {t('addSubject', 'Add subject')}
          </Button>
        )}
      </div>

      {formData.subjects?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ textAlign }}>
            <GraduationCap size={16} className="text-primary" />
            {t('yourSubjects', 'Your subjects')}
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
