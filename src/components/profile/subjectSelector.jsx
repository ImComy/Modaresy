import React, { useMemo, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const SubjectSelector = ({ tutor, selectedSubjectIndex, setSelectedSubjectIndex }) => {
  const { t } = useTranslation();
  const subjects = tutor.subjects || [];

  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  // Initial prefill for 1 subject or default to first
  useEffect(() => {
    if (subjects.length === 1) {
      const subj = subjects[0];
      setSelectedSubjectIndex(0);
      setSelectedType(subj.type);
      setSelectedGrade(subj.grade);
    } else if (subjects.length > 1) {
      const first = subjects[0];
      setSelectedType(first.type);
      setSelectedGrade(first.grade);
    }
  }, [subjects]);

  // Grade options for current type
  const gradeOptions = useMemo(() => {
    return [...new Set(subjects.filter(s => s.type === selectedType).map(s => s.grade))];
  }, [selectedType, subjects]);

  // Auto-select first grade when type changes
  useEffect(() => {
    if (gradeOptions.length > 0) {
      setSelectedGrade(gradeOptions[0]);
    }
  }, [gradeOptions]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      s => s.type === selectedType && s.grade === selectedGrade
    );
  }, [selectedType, selectedGrade, subjects]);

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
                key={idx}
                onClick={() => {
                  setSelectedSubjectIndex(idx);
                  setSelectedType(subj.type);
                  setSelectedGrade(subj.grade);
                }}
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
  return (
    <div className="space-y-4 mb-6">
      <p className="text-base font-semibold">{t('selectSubjectToView', 'Select a subject to view')}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectType', 'Select Type')} />
          </SelectTrigger>
          <SelectContent>
            {[...new Set(subjects.map(s => s.type))].map((type, idx) => (
              <SelectItem key={idx} value={type}>
                {t(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-full sm:w-1/2">
            <SelectValue placeholder={t('selectGrade', 'Select Grade')} />
          </SelectTrigger>
          <SelectContent>
            {gradeOptions.map((grade, idx) => (
              <SelectItem key={idx} value={grade}>
                {t(grade)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subj, idx) => {
            const globalIdx = subjects.findIndex(
              s => s.subject === subj.subject && s.grade === subj.grade && s.type === subj.type
            );
            const isActive = selectedSubjectIndex === globalIdx;

            return (
              <button
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
          })
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('noSubjectsFound', 'No subjects found for this selection.')}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubjectSelector;
