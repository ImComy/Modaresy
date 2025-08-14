import React, { useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const SubjectSelector = ({ 
  tutor, 
  selectedSubjectIndex, 
  setSelectedSubjectIndex,
  subjects = [],
  isEditing = false,
  onRemoveSubject
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (subjects.length > 0 && (selectedSubjectIndex < 0 || selectedSubjectIndex >= subjects.length)) {
      setSelectedSubjectIndex(0);
    }
  }, [subjects, selectedSubjectIndex, setSelectedSubjectIndex]);
  
  const educationSystems = useMemo(() => [
    ...new Set(subjects.map(s => s.education_system || s.subject_id?.education_system))
  ], [subjects]);

  const gradeOptions = useMemo(() => {
    const currentSystem = subjects[selectedSubjectIndex]?.education_system || 
                         subjects[selectedSubjectIndex]?.subject_id?.education_system || 
                         educationSystems[0];
    
    const gradeMap = new Map();
    
    subjects
      .filter(s => 
        (s.education_system || s.subject_id?.education_system) === currentSystem
      )
      .forEach(s => {
        const grade = s.grade || s.subject_id?.grade;
        if (!gradeMap.has(grade)) {
          gradeMap.set(grade, {
            grade,
            sector: s.sector || s.subject_id?.sector,
            language: s.language || s.subject_id?.language,
            system: s.education_system || s.subject_id?.education_system
          });
        }
      });
    
    return Array.from(gradeMap.values());
  }, [subjects, selectedSubjectIndex, educationSystems]);

  const handleSystemChange = (system) => {
    const firstSubjectWithSystem = subjects.findIndex(s => s.education_system === system);
    if (firstSubjectWithSystem >= 0) {
      setSelectedSubjectIndex(firstSubjectWithSystem);
    }
  };

  const handleGradeChange = (grade) => {
    const currentSystem = subjects[selectedSubjectIndex]?.education_system || educationSystems[0];
    const matchingSubjectIndex = subjects.findIndex(s => 
      s.education_system === currentSystem && 
      s.grade === grade
    );
    if (matchingSubjectIndex >= 0) {
      setSelectedSubjectIndex(matchingSubjectIndex);
    }
  };

  if (!subjects.length) {
    return (
      <div className="rounded-xl bg-muted/40 dark:bg-muted/10 border border-border px-6 py-12 text-center space-y-4 shadow-sm">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          {t('noSubjectsHeader', 'No Subjects Added')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {t('noSubjectsDescription', 'This tutor hasn\'t added any subjects yet.')}
        </p>
      </div>
    );
  }

  const currentSystem = subjects[selectedSubjectIndex]?.education_system || educationSystems[0];
  const currentGrade = subjects[selectedSubjectIndex]?.grade || '';

  return (
    <div className="space-y-4 mb-6">
      <p className="text-base font-semibold">{t('selectSubjectToView', 'Select a subject to view')}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={currentSystem} onValueChange={handleSystemChange}>
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectSystem', 'Select Education System')} />
          </SelectTrigger>
          <SelectContent>
            {educationSystems.map((system, idx) => (
              <SelectItem key={idx} value={system}>
                {t(system)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={currentGrade}
          onValueChange={handleGradeChange}
        >
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectGrade', 'Select Grade')} />
          </SelectTrigger>
          <SelectContent>
            {gradeOptions.map((option, idx) => (
              <SelectItem key={idx} value={option.grade}>
                <div className="flex flex-col">
                  <span className="font-medium">{t(option.grade)}</span>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{t(option.system)}</span>
                    {option.sector && <span>• {t(option.sector)}</span>}
                    {option.language && <span>• {t(option.language)}</span>}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {subjects
          .filter(s => 
            s.education_system === currentSystem && 
            s.grade === currentGrade
          )
          .map((subject, idx) => {
            const globalIdx = subjects.findIndex(
              s => s._id === subject._id
            );
            const isActive = selectedSubjectIndex === globalIdx;
            const subjectName = subject.name;

            return (
              <div key={idx} className="relative group">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectIndex(globalIdx)}
                  className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border shadow-sm flex items-center gap-2
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary'
                        : 'bg-muted text-muted-foreground border-muted hover:bg-primary/10 hover:text-primary'
                    }`}
                >
                  {subjectName}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onRemoveSubject(globalIdx)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SubjectSelector;