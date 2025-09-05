import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, GraduationCap, Trash, Edit, Check } from 'lucide-react';
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

const AddSubjectCard = ({ 
  formData = { subjects: [] }, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject, 
  constants, 
  t,
  isSubjectMutating
}) => {
  const [newSubject, setNewSubject] = useState({
    education_system: '',
    grade: '',
    sector: '',
    language: '',
    name: '',
    years_experience: 1
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Refs to avoid repeatedly auto-selecting the same value (prevents update loops)
  const autoSelectedRef = useRef({ system: false, grade: false, sector: false, language: false, subject: false });
  const prevSystemRef = useRef(null);

  useEffect(() => {
    if (editingIndex === null) {
      setNewSubject({
        education_system: '',
        grade: '',
        sector: '',
        language: '',
        name: '',
        years_experience: 1
      });
    } else {
      const subject = formData.subjects[editingIndex];
      if (subject) {
        setNewSubject({
          education_system: subject.education_system || '',
          grade: subject.grade || '',
          sector: subject.sector || '',
          language: subject.language || '',
          name: subject.name || '',
          years_experience: subject.years_experience || 1
        });
      }
    }
  }, [editingIndex, formData.subjects]);

  // Clear auto-select flags when constants change (fresh load)
  useEffect(() => {
    autoSelectedRef.current = { system: false, grade: false, sector: false, language: false, subject: false };
    prevSystemRef.current = null;
  }, [constants]);

  // If there is only one education system available, auto-select it for create mode (guarded)
  useEffect(() => {
    const systems = constants?.Education_Systems || [];
    if (
      systems.length === 1 &&
      editingIndex === null &&
      !newSubject.education_system &&
      !autoSelectedRef.current.system
    ) {
      setNewSubject(prev => ({ ...prev, education_system: systems[0] }));
      autoSelectedRef.current.system = true;
    }
  }, [constants, editingIndex, newSubject.education_system]);

  // Update available options when dependencies change
  useEffect(() => {
    if (!newSubject.education_system || !constants?.EducationStructure) {
      setAvailableGrades([]);
      setAvailableLanguages([]);
      return;
    }

    const grades = constants.EducationStructure[newSubject.education_system]?.grades || [];
    setAvailableGrades(grades);

    const languages = constants.EducationStructure[newSubject.education_system]?.languages || ['Arabic'];
    setAvailableLanguages(languages);

    // If the education system changed, reset dependent auto-select flags
    if (prevSystemRef.current !== newSubject.education_system) {
      autoSelectedRef.current.grade = false;
      autoSelectedRef.current.sector = false;
      autoSelectedRef.current.language = false;
      autoSelectedRef.current.subject = false;
      prevSystemRef.current = newSubject.education_system;
    }

    // Only reset grade/sector/name when entering create mode (not editing) and only when necessary
    if (editingIndex === null) {
      setNewSubject(prev => {
        const next = { ...prev };
        // don't overwrite user choices
        if (!next.grade) next.grade = '';
        if (!next.sector) next.sector = '';
        if (!languages.includes(next.language)) next.language = '';
        if (!next.name) next.name = '';
        return next;
      });
    }

    // If there's exactly one grade option, auto-select it once
    if (grades.length === 1 && !newSubject.grade && !autoSelectedRef.current.grade) {
      setNewSubject(prev => ({ ...prev, grade: grades[0] }));
      autoSelectedRef.current.grade = true;
    }

    // If there's exactly one language option, auto-select it once
    if (languages.length === 1 && !newSubject.language && !autoSelectedRef.current.language) {
      setNewSubject(prev => ({ ...prev, language: languages[0] }));
      autoSelectedRef.current.language = true;
    }
  }, [newSubject.education_system, constants, editingIndex]);

  useEffect(() => {
    if (!newSubject.grade || !newSubject.education_system || !constants?.EducationStructure) {
      setAvailableSectors([]);
      return;
    }

    const sectors = constants.EducationStructure[newSubject.education_system]?.sectors[newSubject.grade] || [];
    setAvailableSectors(sectors);

    if (editingIndex === null) {
      setNewSubject(prev => ({ ...prev, sector: prev.sector || '', name: prev.name || '' }));
    }

    // If there's exactly one sector, auto-select it once
    if (sectors.length === 1 && !newSubject.sector && !autoSelectedRef.current.sector) {
      setNewSubject(prev => ({ ...prev, sector: sectors[0] }));
      autoSelectedRef.current.sector = true;
    }
  }, [newSubject.grade, newSubject.education_system, constants, editingIndex]);

  useEffect(() => {
    if (!newSubject.education_system || !newSubject.grade) {
      setAvailableSubjects([]);
      return;
    }

    const systemSubjects = constants?.SubjectsBySystem?.[newSubject.education_system] || {};
    let subjects = [];

    try {
      const gradeEntry = systemSubjects[newSubject.grade];
      if (Array.isArray(gradeEntry)) {
        subjects = gradeEntry;
      } else if (gradeEntry && typeof gradeEntry === 'object') {
        subjects = gradeEntry[newSubject.sector] || [];
      } else {
        subjects = [];
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      subjects = [];
    }

    setAvailableSubjects(subjects);

    // If there's exactly one subject, auto-select it once
    if (subjects.length === 1 && !newSubject.name && !autoSelectedRef.current.subject) {
      setNewSubject(prev => ({ ...prev, name: subjects[0] }));
      autoSelectedRef.current.subject = true;
    }
  }, [newSubject.education_system, newSubject.grade, newSubject.sector, newSubject.language, constants]);

  const handleAddSubject = () => {
    // Validate all required fields
    if (!newSubject.name || 
        !newSubject.education_system || 
        !newSubject.grade || 
        !newSubject.sector || 
        !newSubject.language) {
      console.error('Missing required fields:', newSubject);
      return;
    }

    // Create a new subject object with complete data
    const subjectData = {
      ...newSubject,
      private_pricing: {
        price: 0,
        currency: 'EGP',
        period: 'session'
      }
    };

    onAddSubject(subjectData);

    setNewSubject({
      education_system: '',
      grade: '',
      sector: '',
      language: '',
      name: '',
      years_experience: 1
    });

    // Reset auto-select flags so next add works as expected
    autoSelectedRef.current = { system: false, grade: false, sector: false, language: false, subject: false };
  };

  const handleDelete = (index) => {
    onDeleteSubject(index);
  };

  const handleEditSubject = (index) => {
    setEditingIndex(index);
  };

  const handleUpdateSubject = () => {
    // Validate all required fields
    if (!newSubject.name || 
        !newSubject.education_system || 
        !newSubject.grade || 
        !newSubject.sector || 
        !newSubject.language || 
        editingIndex === null) {
      console.error('Missing required fields:', newSubject);
      return;
    }

    onUpdateSubject(editingIndex, newSubject);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const renderSubjectDetails = (subject, index) => {
    return (
      <motion.div
        key={subject._id || subject.tempId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="rounded-xl p-4 bg-muted/20 border border-muted"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span className="font-medium">
              {subject.name || t('unnamedSubject')}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditSubject(index)}
            >
              <Edit size={16} className="text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(index)}
            >
              <Trash size={16} className="text-destructive" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t('System')}: </span>
            <span>{subject.education_system || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Grade')}: </span>
            <span>{subject.grade || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Sector')}: </span>
            <span>{subject.sector || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Language')}: </span>
            <span>{subject.language || t('notSpecified')}</span>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">{t('yearsExperience')}: </span>
          <span>{subject.years_experience || 1}</span>
        </div>
      </motion.div>
    );
  };

  // Disabled helpers
  const isGradeDisabled = !newSubject.education_system;
  const isLanguageDisabled = !newSubject.education_system;
  const isSectorDisabled = !newSubject.grade;
  // Determine whether the chosen grade requires selecting a sector.
  const gradeEntry = constants?.SubjectsBySystem?.[newSubject.education_system]?.[newSubject.grade];
  const requiresSector = !!gradeEntry && typeof gradeEntry === 'object' && !Array.isArray(gradeEntry);
  const isSubjectDisabled = requiresSector ? !newSubject.sector : false;

  // Hide select controls if there's only one option and auto-select that option
  const hideSystemSelect = (constants?.Education_Systems?.length === 1);
  const hideGradeSelect = availableGrades.length === 1;
  const hideSectorSelect = availableSectors.length === 1;
  const hideLanguageSelect = availableLanguages.length === 1;
  const hideSubjectSelect = availableSubjects.length === 1;

  return (
    <div className={cn(
      "w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 mt-0 md:-mt-32",
      "max-h-[400px] overflow-y-auto flex-1 min-w-0 md:max-w-xs"
    )}>
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
        <GraduationCap size={20} />
        {editingIndex !== null ? t('editSubject') : t('addNewSubject')}
      </div>

      <div className="space-y-3">
        {/* Education System Select - hidden & auto-chosen if only one option */}
        {hideSystemSelect ? (
          <input type="hidden" value={newSubject.education_system} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">{t('educationSystem')}</Label>
            <Select
              value={newSubject.education_system}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, education_system: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('selectSystem')} />
              </SelectTrigger>
              <SelectContent>
                {constants?.Education_Systems?.map((system) => (
                  <SelectItem key={system} value={system}>
                    {system}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Grade Select - hidden & auto-chosen if only one option */}
        {hideGradeSelect ? (
          <input type="hidden" value={newSubject.grade} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">{t('grade')}</Label>
            <Select
              value={newSubject.grade}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, grade: val }))}
              disabled={isGradeDisabled}
            >
              <SelectTrigger className="h-10" aria-disabled={isGradeDisabled} title={isGradeDisabled ? t('selectSystemFirst') : undefined}>
                <SelectValue placeholder={isGradeDisabled ? t('selectSystemFirst') : t('selectGrade')} />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sector Select - hidden & auto-chosen if only one option */}
        {hideSectorSelect ? (
          <input type="hidden" value={newSubject.sector} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">{t('sector')}</Label>
            <Select
              value={newSubject.sector}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, sector: val }))}
              disabled={isSectorDisabled}
            >
              <SelectTrigger className="h-10" aria-disabled={isSectorDisabled ? 'true' : undefined} title={isSectorDisabled ? t('selectGradeFirst') : undefined}>
                <SelectValue placeholder={isSectorDisabled ? t('selectGradeFirst') : t('selectSector')} />
              </SelectTrigger>
              <SelectContent>
                {availableSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Language Select - hidden & auto-chosen if only one option */}
        {hideLanguageSelect ? (
          <input type="hidden" value={newSubject.language} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">{t('language')}</Label>
            <Select
              value={newSubject.language}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, language: val }))}
              disabled={isLanguageDisabled}
            >
              <SelectTrigger className="h-10" aria-disabled={isLanguageDisabled ? 'true' : undefined} title={isLanguageDisabled ? t('selectSystemFirst') : undefined}>
                <SelectValue placeholder={isLanguageDisabled ? t('selectSystemFirst') : t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject Select - hidden & auto-chosen if only one option */}
        {hideSubjectSelect ? (
          <input type="hidden" value={newSubject.name} />
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">{t('subject')}</Label>
            <Select
              value={newSubject.name}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, name: val }))}
              disabled={isSubjectDisabled || availableSubjects.length === 0}
            >
              <SelectTrigger className="h-10" aria-disabled={isSubjectDisabled || availableSubjects.length === 0 ? 'true' : undefined} title={isSubjectDisabled ? t('selectSectorFirst') : (availableSubjects.length === 0 ? t('noSubjectsAvailable') : undefined)}>
                <SelectValue placeholder={
                  isSubjectDisabled ? t('selectSectorFirst') :
                  availableSubjects.length === 0 ? t('noSubjectsAvailable') :
                  t('selectSubject')
                }>
                  {newSubject.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Years Experience Input */}
        <div className="space-y-1">
          <Label className="text-xs">{t('yearsExperience')}</Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={newSubject.years_experience}
            onChange={(e) => setNewSubject(prev => ({ 
              ...prev, 
              years_experience: Math.max(0, parseInt(e.target.value) || 0)
            }))}
            className="h-10"
          />
        </div>

        {/* Add/Update Buttons */}
        {editingIndex !== null ? (
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="w-full h-10"
              onClick={handleUpdateSubject}
              disabled={!newSubject.name}
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
            disabled={!newSubject.name}
          >
            <Plus size={16} className="mr-1" />
            {t('addSubject')}
          </Button>
        )}
      </div>

      {/* Current Subjects List */}
      {formData.subjects?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">{t('yourSubjects')}</h3>
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
