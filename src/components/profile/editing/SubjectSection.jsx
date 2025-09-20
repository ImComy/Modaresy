import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, GraduationCap, Trash, Edit, Check, Info, BookOpen, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import MultiSelect from '@/components/ui/multi-select';

const normalizeArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return Array.from(new Set(v.filter(Boolean).map(String)));
  return [String(v)];
};
const arrayJoin = (arr) => (Array.isArray(arr) ? arr.join(', ') : arr || '');

const AddSubjectCard = ({
  formData = { subjects: [] },
  editedData,
  isEditing = false,
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
    grades: [], // multi-select
    sector: [], // selected sectors (applied to each grade on submit)
    language: [], // selected languages (applied to each grade on submit)
    name: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoTimeoutRef = useRef(null);
  const infoIconRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeSetNewSubject = useCallback((updater) => {
    setNewSubject(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      next.sector = normalizeArray(next.sector);
      next.language = normalizeArray(next.language);
      next.grades = Array.isArray(next.grades) ? Array.from(new Set(next.grades)) : (next.grades ? [next.grades] : []);
      const same =
        prev.education_system === next.education_system &&
        arrayJoin(prev.grades) === arrayJoin(next.grades) &&
        arrayJoin(prev.sector) === arrayJoin(next.sector) &&
        arrayJoin(prev.language) === arrayJoin(next.language) &&
        prev.name === next.name;
      return same ? prev : next;
    });
  }, []);

  // constants
  const systems = useMemo(() => {
    const cs = constants?.Education_Systems || (t('constants.Education_Systems', { returnObjects: true }) || {});
    return Array.isArray(cs) ? cs : Object.keys(cs || {});
  }, [constants, t]);

  const educationStructure = useMemo(() => {
    const es = constants?.EducationStructure || (t('constants.EducationStructure', { returnObjects: true }) || {});
    return (es && typeof es === 'object') ? es : {};
  }, [constants, t]);

  const subjectsBySystem = useMemo(() => {
    if (constants?.SubjectsBySystem) return constants.SubjectsBySystem;
    const subjectsObj = constants?.Subjects || t('constants.Subjects', { returnObjects: true }) || {};
    return { fallback: Object.keys(subjectsObj || {}) };
  }, [constants, t]);

  // list of existing subjects depending on edit mode
  const existingSubjectsList = useMemo(() => {
    return isEditing ? (Array.isArray(editedData?.subjects) ? editedData.subjects : []) : (Array.isArray(formData?.subjects) ? formData.subjects : []);
  }, [isEditing, editedData, formData]);

  // helper to check duplicates (name + grade + system) in existing subjects
  const isSubjectAlreadyAdded = useCallback((system, grade, name) => {
    if (!system || !grade || !name) return false;
    const nameLower = String(name).toLowerCase();
    const gradeLower = String(grade).toLowerCase();
    const sysLower = String(system).toLowerCase();
    return existingSubjectsList.some(s => {
      const sSys = String(s.education_system || s.system || '').toLowerCase();
      const sGrade = String(s.grade || s.subject_id?.grade || '').toLowerCase();
      const sName = String(s.name || s.subject_id?.name || '').toLowerCase();
      return sSys === sysLower && sGrade === gradeLower && sName === nameLower;
    });
  }, [existingSubjectsList]);

  const selectedGrades = newSubject.grades || [];
  const singleGradeMode = selectedGrades.length === 1;
  const activeGrade = singleGradeMode ? selectedGrades[0] : null;

  const availableGrades = useMemo(() => {
    if (!newSubject.education_system) return [];
    const gradesObj = educationStructure[newSubject.education_system]?.grades;
    if (!gradesObj) return [];
    if (Array.isArray(gradesObj)) return gradesObj;
    if (typeof gradesObj === 'object') return Object.keys(gradesObj);
    return [];
  }, [educationStructure, newSubject.education_system]);

  const systemLanguages = useMemo(() => {
    if (!newSubject.education_system) return [];
    const langs = educationStructure[newSubject.education_system]?.languages || [];
    if (Array.isArray(langs)) return langs;
    if (typeof langs === 'object') return Object.keys(langs);
    return [];
  }, [educationStructure, newSubject.education_system]);

  const getSectorsForGrade = useCallback((system, grade) => {
    if (!system || !grade) return [];
    const s = educationStructure[system]?.sectors?.[grade];
    if (!s) return [];
    if (Array.isArray(s)) return s;
    if (typeof s === 'object') return Object.keys(s);
    return [];
  }, [educationStructure]);

  const unionSectorsForSelectedGrades = useMemo(() => {
    const system = newSubject.education_system;
    if (!system || !selectedGrades || selectedGrades.length === 0) return [];
    const set = new Set();
    for (const g of selectedGrades) {
      const secs = getSectorsForGrade(system, g) || [];
      secs.forEach(s => set.add(s));
    }
    return Array.from(set);
  }, [newSubject.education_system, selectedGrades, getSectorsForGrade]);

  // helper: check whether a subject name exists for a specific grade in a system
  const subjectExistsForGrade = useCallback((system, grade, subjectName) => {
    if (!system || !grade || !subjectName) return false;
    const sys = subjectsBySystem[system] || subjectsBySystem.fallback || {};
    const gradeEntry = sys[grade];
    if (!gradeEntry) return false;
    const nameLower = String(subjectName).toLowerCase();
    if (Array.isArray(gradeEntry)) return gradeEntry.some(s => String(s).toLowerCase() === nameLower);
    if (typeof gradeEntry === 'object') {
      return Object.values(gradeEntry).some(arr => Array.isArray(arr) && arr.some(s => String(s).toLowerCase() === nameLower));
    }
    return String(gradeEntry).toLowerCase() === nameLower;
  }, [subjectsBySystem]);

  // compute available subjects: union across selected grades (works for single & multi)
  const availableSubjects = useMemo(() => {
    const system = newSubject.education_system;
    if (!system || !selectedGrades || selectedGrades.length === 0) return [];
    const set = new Set();
    for (const g of selectedGrades) {
      const sys = subjectsBySystem[system] || subjectsBySystem.fallback || {};
      const gradeEntry = sys[g];
      if (!gradeEntry) continue;
      if (Array.isArray(gradeEntry)) gradeEntry.forEach(s => set.add(s));
      else if (typeof gradeEntry === 'object') {
        Object.values(gradeEntry).forEach(arr => (Array.isArray(arr) ? arr : []).forEach(s => set.add(s)));
      } else if (typeof gradeEntry === 'string') set.add(gradeEntry);
    }
    return Array.from(set);
  }, [subjectsBySystem, newSubject.education_system, selectedGrades]);

  const hideSystemField = Array.isArray(systems) && systems.length === 1;
  const hideSubjectField = Array.isArray(availableSubjects) && availableSubjects.length === 1 && editingIndex === null;

  useEffect(() => {
    if (hideSystemField) {
      const only = systems[0];
      if (newSubject.education_system !== only) {
        safeSetNewSubject({ education_system: only, grades: [], name: '', sector: [], language: [] });
      }
    }
  }, [hideSystemField, systems]);

  useEffect(() => {
    if (hideSubjectField) {
      const only = availableSubjects[0];
      if (newSubject.name !== only) {
        safeSetNewSubject({ name: only });
      }
    }
  }, [hideSubjectField, availableSubjects]);

  useEffect(() => {
    if (editingIndex === null) {
      safeSetNewSubject(prev => {
        const next = { ...prev };
        if (next.education_system && !systems.includes(next.education_system)) next.education_system = '';
        const gradesForSystem = availableGrades || [];
        if (next.grades && next.grades.length > 0) {
          next.grades = next.grades.filter(g => gradesForSystem.includes(g));
        }
        const sectorsForActive = activeGrade ? getSectorsForGrade(next.education_system, activeGrade) : [];
        if (next.sector && next.sector.length > 0 && sectorsForActive && sectorsForActive.length) {
          next.sector = next.sector.filter(s => sectorsForActive.includes(s) || unionSectorsForSelectedGrades.includes(s));
        }
        const langs = systemLanguages || [];
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
          grades: subject.grade ? [subject.grade] : [],
          sector: normalizeArray(subject.sector),
          language: normalizeArray(subject.language),
          name: subject.name || ''
        });
      }
    }
  }, [editingIndex, editedData?.subjects, formData.subjects, educationStructure, systems, availableGrades, activeGrade]);

  const toggleGrade = useCallback((grade) => {
    safeSetNewSubject(prev => {
      const g = Array.isArray(prev.grades) ? [...prev.grades] : [];
      const idx = g.findIndex(x => String(x).toLowerCase() === String(grade).toLowerCase());
      if (idx >= 0) g.splice(idx, 1);
      else g.push(grade);
      return { ...prev, grades: Array.from(new Set(g)) };
    });
  }, [safeSetNewSubject]);

  const toggleSector = useCallback((sec) => {
    setNewSubject(prev => {
      const secs = normalizeArray(prev.sector);
      const idx = secs.findIndex(s => String(s).toLowerCase() === String(sec).toLowerCase());
      if (idx >= 0) secs.splice(idx, 1);
      else secs.push(sec);
      return { ...prev, sector: Array.from(new Set(secs)) };
    });
  }, []);

  const toggleLanguage = useCallback((lang) => {
    setNewSubject(prev => {
      const langs = normalizeArray(prev.language);
      const idx = langs.findIndex(l => String(l).toLowerCase() === String(lang).toLowerCase());
      if (idx >= 0) langs.splice(idx, 1);
      else langs.push(lang);
      return { ...prev, language: Array.from(new Set(langs)) };
    });
  }, []);

  const selectAllLanguages = useCallback(() => {
    safeSetNewSubject({ language: systemLanguages || [] });
  }, [systemLanguages, safeSetNewSubject]);

  const selectAllSectors = useCallback(() => {
    if (!singleGradeMode) {
      safeSetNewSubject({ sector: unionSectorsForSelectedGrades || [] });
      return;
    }
    safeSetNewSubject({ sector: getSectorsForGrade(newSubject.education_system, activeGrade) || [] });
  }, [singleGradeMode, unionSectorsForSelectedGrades, activeGrade, getSectorsForGrade, newSubject.education_system, safeSetNewSubject]);

  // PENDING PREVIEW: compute which subjects WOULD be created based on current selections
  // excludes grades where the subject doesn't exist or is already added
  const pendingSubjectsPreview = useMemo(() => {
    if (!newSubject.name || !newSubject.education_system || !selectedGrades || selectedGrades.length === 0) return [];
    const chosenSectors = normalizeArray(newSubject.sector);
    const chosenLanguages = normalizeArray(newSubject.language);
    const system = newSubject.education_system;
    const out = [];
    for (const g of selectedGrades) {
      // skip if subject doesn't exist for this grade
      if (!subjectExistsForGrade(system, g, newSubject.name)) continue;

      // skip if already added
      if (isSubjectAlreadyAdded(system, g, newSubject.name)) continue;

      const gradeEntry = subjectsBySystem[system]?.[g];
      const gradeRequiresSector = gradeEntry && typeof gradeEntry === 'object' && !Array.isArray(gradeEntry);
      const gradeSectors = getSectorsForGrade(system, g);

      let sectorsForThisGrade = [];
      if (chosenSectors && chosenSectors.length > 0) {
        if (gradeSectors && gradeSectors.length > 0) {
          sectorsForThisGrade = chosenSectors.filter(s => gradeSectors.map(x => String(x).toLowerCase()).includes(String(s).toLowerCase()));
        } else {
          sectorsForThisGrade = chosenSectors;
        }
      }

      if (gradeRequiresSector && (!sectorsForThisGrade || sectorsForThisGrade.length === 0)) {
        // skip grade
        continue;
      }

      if (!chosenLanguages || chosenLanguages.length === 0) continue;

      out.push({
        name: newSubject.name,
        education_system: system,
        grade: g,
        sector: sectorsForThisGrade,
        language: chosenLanguages,
        private_pricing: { price: 0, currency: 'EGP', period: 'session' }
      });
    }
    return out;
  }, [newSubject, selectedGrades, subjectsBySystem, subjectExistsForGrade, getSectorsForGrade, isSubjectAlreadyAdded]);

  const handleAddSubject = useCallback(async () => {
    if (!newSubject.name || !newSubject.education_system) return;
    if (!newSubject.language || newSubject.language.length === 0) return;

    if (singleGradeMode) {
      const grade = activeGrade;
      if (!grade) return;

      // verify subject exists for this grade
      if (!subjectExistsForGrade(newSubject.education_system, grade, newSubject.name)) return;

      // skip if duplicate
      if (isSubjectAlreadyAdded(newSubject.education_system, grade, newSubject.name)) return;

      const gradeEntry = subjectsBySystem[newSubject.education_system]?.[grade];
      const gradeRequiresSector = gradeEntry && typeof gradeEntry === 'object' && !Array.isArray(gradeEntry);
      const gradeSectors = getSectorsForGrade(newSubject.education_system, grade);
      const chosenSectors = normalizeArray(newSubject.sector);

      if (gradeRequiresSector) {
        const intersect = chosenSectors.filter(s => gradeSectors.map(x => String(x).toLowerCase()).includes(String(s).toLowerCase()));
        if (intersect.length === 0) return; // skip because not applicable
      }

      const subjectData = {
        name: newSubject.name,
        education_system: newSubject.education_system,
        grade,
        sector: chosenSectors,
        language: normalizeArray(newSubject.language),
        private_pricing: { price: 0, currency: 'EGP', period: 'session' }
      };

      try {
        const res = onAddSubject(subjectData);
        if (res && typeof res.then === 'function') await res;
      } catch (err) {
        console.error(err);
      }

      safeSetNewSubject(prev => ({ ...prev, name: '' }));
      return;
    }

    // MULTI-GRADE: build using pendingSubjectsPreview so incompatible or duplicate grades are automatically skipped
    const subjectsToCreate = pendingSubjectsPreview;
    if (!subjectsToCreate || subjectsToCreate.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const sd of subjectsToCreate) {
        try {
          // double-check duplicates right before submitting (race-safety)
          if (isSubjectAlreadyAdded(sd.education_system, sd.grade, sd.name)) continue;
          const r = onAddSubject(sd);
          if (r && typeof r.then === 'function') await r;
        } catch (err) {
          console.error('Failed to add subject for grade', sd.grade, err);
        }
      }
      safeSetNewSubject(prev => ({ ...prev, name: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [newSubject, singleGradeMode, activeGrade, pendingSubjectsPreview, onAddSubject, safeSetNewSubject, getSectorsForGrade, subjectsBySystem, subjectExistsForGrade, isSubjectAlreadyAdded]);

  const handleDelete = useCallback((index) => {
    onDeleteSubject(index);
    if (editingIndex === index) setEditingIndex(null);
  }, [onDeleteSubject, editingIndex]);

  const handleEditSubject = useCallback((index) => {
    setEditingIndex(index);
  }, []);

  const handleUpdateSubject = useCallback(() => {
    if (editingIndex === null) return;
    if (!singleGradeMode || !activeGrade) return;
    onUpdateSubject(editingIndex, {
      ...newSubject,
      grade: activeGrade,
      sector: normalizeArray(newSubject.sector),
      language: normalizeArray(newSubject.language)
    });
    setEditingIndex(null);
  }, [editingIndex, onUpdateSubject, newSubject, singleGradeMode, activeGrade]);

  const cancelEdit = useCallback(() => setEditingIndex(null), []);

  const translateConst = useCallback((pathBase, key, fallback) => {
    if (!key && key !== 0) return fallback || '';
    const full = `${pathBase}.${key}`;
    const translated = t(full, { defaultValue: null });
    if (translated && translated !== 'null') return translated;
    return fallback || key;
  }, [t]);

  const subjectRenderKey = useCallback((subject, idx) => {
    if (subject._id) return String(subject._id);
    const nm = (subject.name || subject.subject_id?.name || 'unknown').replace(/\s+/g, '_');
    const gr = (subject.grade || subject.subject_id?.grade || 'nograde').replace(/\s+/g, '_');
    return `${nm}-${gr}-${idx}`;
  }, []);

  const renderSubjectDetails = useCallback((subject, index) => (
    <motion.div
      key={subjectRenderKey(subject, index)}
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
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('System','System')}</div>
          <div>{translateConst('constants.Education_Systems', subject.education_system, subject.education_system) || t('notSpecified','Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Grade','Grade')}</div>
          <div>{translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.grades`, subject.grade, subject.grade) || t('notSpecified','Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Sector','Sector')}</div>
          <div>{Array.isArray(subject.sector) ? subject.sector.map(s => translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.sectors`, s, s)).join(', ') : translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.sectors`, subject.sector, subject.sector) || t('notSpecified','Not specified')}</div>
        </div>
        <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{t('Language','Language')}</div>
          <div>{Array.isArray(subject.language) ? subject.language.map(l => translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.languages`, l, translateConst('constants.Languages', l, l))).join(', ') : translateConst(`constants.EducationStructure.${subject.education_system || 'National'}.languages`, subject.language, translateConst('constants.Languages', subject.language, subject.language)) || t('notSpecified','Not specified')}</div>
        </div>
      </div>
    </motion.div>
  ), [t, handleEditSubject, handleDelete, dir, textAlign, translateConst, subjectRenderKey]);

  const handleMouseEnterInfo = useCallback(() => {
    if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
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
    infoTimeoutRef.current = setTimeout(() => setShowInfoPopup(false), 300);
  }, []);

  const effectiveSubjectsFromEdited = Array.isArray(editedData?.subjects) ? editedData.subjects : [];
  const effectiveSubjectsFromForm = Array.isArray(formData?.subjects) ? formData.subjects : [];
  const effectiveSubjects = isEditing ? effectiveSubjectsFromEdited : effectiveSubjectsFromForm;

  const displayedSubjects = useMemo(() => {
    const orig = Array.isArray(effectiveSubjects) ? [...effectiveSubjects] : [];
    if (editingIndex === null) return orig;

    if (editingIndex < 0 || editingIndex >= orig.length) return orig;

    const existing = orig[editingIndex];
    if (!existing) return orig;

    const preview = {
      ...existing,
      education_system: newSubject.education_system || existing.education_system,
      grade: (singleGradeMode && activeGrade) ? activeGrade : (existing.grade || activeGrade),
      name: newSubject.name || existing.name,
      sector: normalizeArray(newSubject.sector).length ? normalizeArray(newSubject.sector) : (Array.isArray(existing.sector) ? existing.sector : normalizeArray(existing.sector)),
      language: normalizeArray(newSubject.language).length ? normalizeArray(newSubject.language) : (Array.isArray(existing.language) ? existing.language : normalizeArray(existing.language)),
      private_pricing: existing.private_pricing || { price: 0, currency: 'EGP', period: 'session' },
      _id: existing._id
    };

    const copy = [...orig];
    copy[editingIndex] = preview;
    return copy;
  }, [isEditing, editedData, formData, editingIndex, newSubject, singleGradeMode, activeGrade]);

  return (
    <div
      dir={dir}
      style={{ direction: dir }}
      className={cn(
        "w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-4 z-10 border border-gray-200 dark:border-gray-700",
        "max-h-[500px] overflow-y-auto flex-1 min-w-0 md:max-w-xs mt-0 md:-mt-32"
      )}
    >
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700" style={{ textAlign }}>
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10" style={{ marginInlineEnd: dir === 'rtl' ? 0 : undefined }}>
          <GraduationCap size={20} className="text-primary" />
        </div>
        {editingIndex !== null ? t('editSubject','Edit subject') : t('addNewSubject','Add new subject')}
        <div className="relative ml-2" onMouseEnter={handleMouseEnterInfo} onMouseLeave={handleMouseLeaveInfo}>
          <Info ref={infoIconRef} size={16} className="text-muted-foreground cursor-help" aria-label={t('info','Info')} />
          {showInfoPopup && typeof document !== 'undefined' && createPortal(
            <div style={{ position: 'absolute', left: tooltipPos.left, top: tooltipPos.top - 10, transform: 'translate(-50%, -100%)', zIndex: 9999 }} className="w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
              {t('checkSectorsLanguagesTooltip','Make sure to check and adjust the sectors and languages you teach for this subject.')}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>,
            document.body
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!hideSystemField && (
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
              <BookOpen size={12} />
              {t('educationSystem','Education system')}
            </Label>
            <Select
              value={newSubject.education_system}
              onValueChange={(val) => safeSetNewSubject({ education_system: val, grades: [], name: '', sector: [], language: [] })}
            >
              <SelectTrigger className="h-10 bg-white dark:bg-gray-700">
                <SelectValue placeholder={t('selectSystem','Select system')} />
              </SelectTrigger>
              <SelectContent className="z-10" position="popper">
                {systems.map(system => <SelectItem key={system} value={system}>{translateConst('constants.Education_Systems', system, system)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
            <Award size={12} />
            {t('grade','Grade')}
          </Label>

          <MultiSelect
            options={availableGrades}
            selected={selectedGrades}
            onToggle={toggleGrade}
            placeholder={t('selectGrade','Select grade')}
            display={(g) => translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.grades`, g, g)}
            selectAllLabel={null}
            className=""
          />
        </div>

        {!hideSubjectField && (
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1" style={{ textAlign }}>
              <GraduationCap size={12} />
              {t('subject','Subject')}
            </Label>
            <Select
              value={newSubject.name}
              onValueChange={(val) => safeSetNewSubject({ name: val })}
              disabled={!newSubject.education_system || !selectedGrades.length || availableSubjects.length === 0}
            >
              <SelectTrigger className="h-10 bg-white dark:bg-gray-700" aria-disabled={!newSubject.education_system || !selectedGrades.length || availableSubjects.length === 0}>
                <SelectValue placeholder={!selectedGrades.length ? t('selectGradeFirst','Select a grade first') : (availableSubjects.length === 0 ? t('noSubjectsAvailable','No subjects available') : t('selectSubject','Select subject'))} />
              </SelectTrigger>
              <SelectContent className="z-10" position="popper">
                {availableSubjects.map(subject => <SelectItem key={subject} value={subject}>{translateConst('constants.Subjects', subject, subject)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between" style={{ textAlign }}>
            <span className="flex items-center gap-1"><MapPin size={12} />{t('sector','Sector')}</span>
            <small className="text-xs text-muted-foreground">{singleGradeMode ? t('selectSectorsForGrade','Select sectors for this grade') : t('selectSectorsForSelectedGrades','Select sectors - will be applied to each selected grade')}</small>
          </Label>

          { (singleGradeMode ? getSectorsForGrade(newSubject.education_system, activeGrade) : unionSectorsForSelectedGrades).length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {(singleGradeMode ? getSectorsForGrade(newSubject.education_system, activeGrade) : unionSectorsForSelectedGrades).map(sec => {
                const isSelected = (newSubject.sector || []).map(x => x.toLowerCase()).includes(sec.toLowerCase());
                return (
                  <button
                    key={`sector-${sec}`}
                    type="button"
                    onClick={() => toggleSector(sec)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md border transition-all",
                      isSelected ? "bg-primary text-white border-primary" : "bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary/50"
                    )}
                  >
                    {translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.sectors`, sec, sec)}
                  </button>
                );
              })}
              { (singleGradeMode ? getSectorsForGrade(newSubject.education_system, activeGrade) : unionSectorsForSelectedGrades).length > 1 && (
                <button type="button" onClick={selectAllSectors} className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  {t('selectAllSectors','Select all sectors')}
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">{t('noSectorsAvailable','No sectors available')}</div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between" style={{ textAlign }}>
            <span className="flex items-center gap-1"><BookOpen size={12} />{t('language','Language')}</span>
            <small className="text-xs text-muted-foreground">{t('selectLanguages','Select languages (applied to each selected grade)')}</small>
          </Label>

          { systemLanguages && systemLanguages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {systemLanguages.map(lang => {
                const isSelected = (newSubject.language || []).map(x => x.toLowerCase()).includes(lang.toLowerCase());
                return (
                  <button
                    key={`lang-${lang}`}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md border transition-all",
                      isSelected ? "bg-primary text-white border-primary" : "bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary/50"
                    )}
                  >
                    {translateConst(`constants.EducationStructure.${newSubject.education_system || 'National'}.languages`, lang, translateConst('constants.Languages', lang, lang))}
                  </button>
                );
              })}
              {systemLanguages.length > 1 && (
                <button type="button" onClick={selectAllLanguages} className="col-span-2 text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  {t('selectAllLanguages','Select all languages')}
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">{t('noLanguagesAvailable','No languages available')}</div>
          )}
        </div>

        {editingIndex !== null ? (
          <div className="flex gap-2 pt-2">
            <Button type="button" className="w-full h-10" onClick={handleUpdateSubject} disabled={!newSubject.name || !singleGradeMode || !activeGrade}>
              <Check size={16} className="mr-1" />{t('updateSubject','Update subject')}
            </Button>
            <Button type="button" variant="outline" className="w-full h-10" onClick={cancelEdit}>{t('cancel','Cancel')}</Button>
          </div>
        ) : (
          <Button
            className="w-full h-10 mt-2"
            onClick={handleAddSubject}
            disabled={isSubmitting || !newSubject.name || !newSubject.education_system || (newSubject.language || []).length === 0}
          >
            <Plus size={16} className="mr-1" />
            {isSubmitting ? t('adding','Adding...') : t('addSubject','Add subject')}
          </Button>
        )}
      </div>

      {displayedSubjects?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ textAlign }}>
            <GraduationCap size={16} className="text-primary" />
            {t('yourSubjects','Your subjects')}
          </h3>
          <div className="flex flex-col gap-3">
            {displayedSubjects.map((subject, index) => renderSubjectDetails(subject, index))}
          </div>
        </div>
      )}
    </div>
  );
};

const areEqualAddSubjectCard = (prevProps, nextProps) => {
  if (prevProps.constants !== nextProps.constants) return false;
  if (prevProps.isSubjectMutating !== nextProps.isSubjectMutating) return false;
  if (prevProps.isEditing !== nextProps.isEditing) return false;

  const prevSubs = prevProps.isEditing ? (Array.isArray(prevProps.editedData?.subjects) ? prevProps.editedData.subjects : []) : (Array.isArray(prevProps.formData?.subjects) ? prevProps.formData.subjects : []);
  const nextSubs = nextProps.isEditing ? (Array.isArray(nextProps.editedData?.subjects) ? nextProps.editedData.subjects : []) : (Array.isArray(nextProps.formData?.subjects) ? nextProps.formData.subjects : []);

  if (prevSubs.length !== nextSubs.length) return false;

  for (let i = 0; i < prevSubs.length; i++) {
    const a = prevSubs[i] || {};
    const b = nextSubs[i] || {};

    const aId = a._id || `${a.name || ''}-${a.grade || ''}`;
    const bId = b._id || `${b.name || ''}-${b.grade || ''}`;
    if (String(aId) !== String(bId)) return false;

    if ((a.name || '') !== (b.name || '')) return false;
    if ((a.grade || '') !== (b.grade || '')) return false;
    if ((a.education_system || '') !== (b.education_system || '')) return false;

    const sa = Array.isArray(a.sector) ? a.sector.map(String).sort().join('|') : String(a.sector || '');
    const sb = Array.isArray(b.sector) ? b.sector.map(String).sort().join('|') : String(b.sector || '');
    if (sa !== sb) return false;

    const la = Array.isArray(a.language) ? a.language.map(String).sort().join('|') : String(a.language || '');
    const lb = Array.isArray(b.language) ? b.language.map(String).sort().join('|') : String(b.language || '');
    if (la !== lb) return false;
  }

  return true;
};

export default React.memo(AddSubjectCard, areEqualAddSubjectCard);
