import React, { useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const SubjectSelector = ({ tutor, selectedSubjectIndex, setSelectedSubjectIndex }) => {
  const { t } = useTranslation();
  const subjects = tutor.subjects || [];

  // Initialize selectedSubjectIndex if invalid
  useEffect(() => {
    if (subjects.length > 0 && (selectedSubjectIndex < 0 || selectedSubjectIndex >= subjects.length)) {
      setSelectedSubjectIndex(0);
    }
  }, [subjects, selectedSubjectIndex, setSelectedSubjectIndex]);

  // Compute unique types and grades for dropdowns
  const types = useMemo(() => [...new Set(subjects.map(s => s.type))], [subjects]);
  const grades = useMemo(() => {
    const currentType = subjects[selectedSubjectIndex]?.type || types[0];
    return [...new Set(subjects.filter(s => s.type === currentType).map(s => s.grade))];
  }, [subjects, selectedSubjectIndex]);

  // Handle type change
  const handleTypeChange = (type) => {
    const firstSubjectWithType = subjects.findIndex(s => s.type === type);
    if (firstSubjectWithType >= 0) {
      setSelectedSubjectIndex(firstSubjectWithType);
    }
  };

  // Handle grade change
  const handleGradeChange = (grade) => {
    const currentType = subjects[selectedSubjectIndex]?.type || types[0];
    const matchingSubjectIndex = subjects.findIndex(s => s.type === currentType && s.grade === grade);
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
          {t('noSubjectsDescription', 'This tutor hasn’t added any subjects yet.')}
        </p>
      </div>
    );
  }

  // Simple layout for 3 or fewer subjects
  if (subjects.length <= 3) {
    return (
      <div className="space-y-3 mb-6">
        <p className="text-base font-semibold">{t('selectSubjectToView', 'Select a subject to view')}</p>
        <div className="flex flex-wrap gap-3">
          {subjects.map((subj, idx) => {
            const isActive = selectedSubjectIndex === idx;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setSelectedSubjectIndex(idx)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border shadow-sm flex items-center gap-2
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary'
                      : 'bg-muted text-muted-foreground border-muted hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                {t(subj.subject)} - {t(subj.grade)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full UI for larger subject sets
  const currentType = subjects[selectedSubjectIndex]?.type || types[0];
  const currentGrade = subjects[selectedSubjectIndex]?.grade || grades[0];

  return (
    <div className="space-y-4 mb-6">
      <p className="text-base font-semibold">{t('selectSubjectToView', 'Select a subject to view')}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectType', 'Select Type')} />
          </SelectTrigger>
          <SelectContent>
            {types.map((type, idx) => (
              <SelectItem key={idx} value={type}>
                {t(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentGrade} onValueChange={handleGradeChange}>
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectGrade', 'Select Grade')} />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade, idx) => (
              <SelectItem key={idx} value={grade}>
                {t(grade)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {subjects
          .filter(s => s.type === currentType && s.grade === currentGrade)
          .map((subj, idx) => {
            const globalIdx = subjects.findIndex(
              s => s.subject === subj.subject && s.grade === subj.grade && s.type === subj.type
            );
            const isActive = selectedSubjectIndex === globalIdx;

            return (
              <button
                type="button"
                key={idx}
                onClick={() => setSelectedSubjectIndex(globalIdx)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border shadow-sm flex items-center gap-2
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary'
                      : 'bg-muted text-muted-foreground border-muted hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                {t(subj.subject)}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default SubjectSelector;