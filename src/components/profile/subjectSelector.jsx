import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  BookOpen,
  Clock,
  Grid3X3,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorScheduleManager from '@/components/profile/TutorScheduleManager';
import TutorReviews from '@/components/profile/TutorReviews';
import TutorLocationMap from './map';

const MENU_MAX_HEIGHT_PX = 18 * 16;

const SubjectSelector = ({
  tutor,
  subjects = [],
  isEditing = false,
  isOwner,
  onUpdateSubject,
  onTutorChange,
  onReviewUpdate,
}) => {
  const { t } = useTranslation();

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(subjects.length > 0 ? 0 : -1);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  const toggleRef = useRef(null);
  const listRef = useRef(null);

  const [portalStyle, setPortalStyle] = useState(null);

  useEffect(() => {
    if (!subjects || subjects.length === 0) {
      setSelectedSubjectIndex(-1);
      setHighlightIndex(-1);
      return;
    }
    setSelectedSubjectIndex((idx) => {
      if (idx < 0 || idx >= subjects.length) return 0;
      return idx;
    });
  }, [subjects]);

  const selectedSubject = useMemo(() => (selectedSubjectIndex >= 0 ? subjects[selectedSubjectIndex] : null), [subjects, selectedSubjectIndex]);

  const handleNestedChange = useCallback(
    (path, value) => {
      if (typeof onUpdateSubject === 'function' && selectedSubjectIndex >= 0) {
        const updated = { ...(subjects[selectedSubjectIndex] || {}), [path]: value };
        onUpdateSubject(selectedSubjectIndex, updated);
      }
    },
    [onUpdateSubject, subjects, selectedSubjectIndex]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen((v) => !v);
    setHighlightIndex(-1);
  }, []);

  const selectIndex = useCallback(
    (index) => {
      if (index < 0 || index >= subjects.length) return;
      setSelectedSubjectIndex(index);
      setIsOpen(false);
      setHighlightIndex(-1);
      setExpandedSubjectId(null);
    },
    [subjects.length]
  );

  const toggleExpandSubject = useCallback((subjectId, e) => {
    e.stopPropagation();
    setExpandedSubjectId(prev => prev === subjectId ? null : subjectId);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      const len = subjects.length;
      if (!len) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => (i < len - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => (i > 0 ? i - 1 : len - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIndex >= 0) selectIndex(highlightIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    },
    [isOpen, subjects.length, highlightIndex, selectIndex]
  );

  useEffect(() => {
    if (!isOpen) {
      setPortalStyle(null);
      return;
    }
    function update() {
      const btn = toggleRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top;
      if (spaceBelow >= MENU_MAX_HEIGHT_PX) {
        top = rect.bottom;
      } else if (spaceBelow >= 80) {
        top = rect.bottom;
      } else if (spaceAbove >= MENU_MAX_HEIGHT_PX) {
        top = rect.top - Math.min(MENU_MAX_HEIGHT_PX, spaceAbove);
      } else {
        top = Math.max(8, rect.bottom);
      }
      setPortalStyle({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(MENU_MAX_HEIGHT_PX, Math.max(120, window.innerHeight - 80)),
      });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const ro = new ResizeObserver(update);
    if (toggleRef.current) ro.observe(toggleRef.current);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro.disconnect();
    };
  }, [isOpen]);

  const getDisplayValues = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const translateValue = (value, type) => {
    if (!value && value !== 0) return '';
    if (type === 'subject') {
      return t(`constants.Subjects.${value}`, { defaultValue: value });
    }
    if (type === 'grade') {
      return t(`constants.EducationStructure.National.grades.${value}`, { defaultValue: value });
    }
    if (type === 'system') {
      return t(`constants.Education_Systems.${value}`, { defaultValue: value });
    }
    if (type === 'sector') {
      return t(`constants.EducationStructure.National.sectors.${value}`, { defaultValue: value });
    }
    if (type === 'language') {
      const national = t(`constants.EducationStructure.National.languages.${value}`, { defaultValue: null });
      if (national && national !== 'null') return national;
      return t(`constants.Languages.${value}`, { defaultValue: value });
    }
    return t(value, { defaultValue: value });
  };

  const renderPreviewBadges = (sub) => {
    if (!sub) return null;

    const system = sub.education_system || sub.subject_id?.education_system;
    const grade = sub.grade || sub.subject_id?.grade;
    const sectors = getDisplayValues(sub.sector || sub.subject_id?.sector);
    const languages = getDisplayValues(sub.language || sub.subject_id?.language);

    const badges = [];

    if (system) {
      badges.push(
        <Badge key="system" variant="secondary" className="text-[10px] px-1.5 py-0.5">
          {translateValue(system, 'system')}
        </Badge>
      );
    }

    if (grade) {
      badges.push(
        <Badge key="grade" variant="secondary" className="text-[10px] px-1.5 py-0.5">
          {translateValue(grade, 'grade')}
        </Badge>
      );
    }

    if (sectors.length > 0) {
      badges.push(
        <Badge key="sectors" variant="outline" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
          <Grid3X3 size={10} />
          {sectors.length === 1 ? translateValue(sectors[0], 'sector') : `${sectors.length} ${t('sectors', 'sectors')}`}
        </Badge>
      );
    }

    if (languages.length > 0) {
      badges.push(
        <Badge key="languages" variant="outline" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
          {languages.length === 1 ? translateValue(languages[0], 'language') : `${languages.length} ${t('languages', 'languages')}`}
        </Badge>
      );
    }

    return badges.slice(0, 4);
  };

  const renderSubjectDetailsInDropdown = (subject) => {
    const system = subject.education_system || subject.subject_id?.education_system;
    const grade = subject.grade || subject.subject_id?.grade;
    const sectors = getDisplayValues(subject.sector || subject.subject_id?.sector);
    const languages = getDisplayValues(subject.language || subject.subject_id?.language);
    const isExpanded = expandedSubjectId === (subject._id || subject.tempId);

    return (
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate">
          {subject.name ? translateValue(subject.name, 'subject') : subject.subject_id?.name ? translateValue(subject.subject_id.name, 'subject') : t('unknownSubject', 'Unknown subject')}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {(system ? translateValue(system, 'system') : '—')} • {(grade ? translateValue(grade, 'grade') : '—')}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-2"
            >
              {sectors.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs font-medium text-muted-foreground">{t('Sector', 'Sector')}:</span>
                  {sectors.map((sector, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {translateValue(sector, 'sector')}
                    </Badge>
                  ))}
                </div>
              )}

              {languages.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs font-medium text-muted-foreground">{t('Language', 'Language')}:</span>
                  {languages.map((language, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {translateValue(language, 'language')}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const subjectsCount = subjects?.length || 0;

  const tutorStats = useMemo(() => {
    const totalStudents = subjects.reduce((acc, subject) => acc + (subject.studentsCount || 0), 0);
    const totalReviews = subjects.reduce((acc, subject) => acc + (subject.reviewsCount || 0), 0);
    const avgRating = (subjects.reduce((acc, subject) => acc + (subject.averageRating || 0), 0) / (subjectsCount || 1)) || 0;
    return {
      totalStudents,
      totalReviews,
      avgRating,
      experience: tutor?.experience || '2+ years',
    };
  }, [subjects, subjectsCount, tutor]);

  if (!subjects || subjectsCount === 0) {
    return (
      <div className="rounded-xl bg-muted/10 border border-border px-6 py-10 text-center space-y-4 shadow-sm mt-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {t('noSubjectsHeader', 'No Subjects Added')}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {t('noSubjectsDescriptions', "This tutor hasn't added any subjects yet.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col gap-6">
        <div>
          <TutorVideoManager
            videos={tutor?.youtube || []}
            isEditing={isEditing}
            isOwner={isOwner}
            onVideosChange={(newVideos) => onTutorChange('youtube', newVideos)}
          />
        </div>
        <div className='flex flex-col-reverse lg:flex-row gap-6'>
          <Card className="md:w-fit flex justify-center items-center">
            <CardHeader className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    {t('subjectss', 'Subjects')}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-2">
                      {subjectsCount}
                    </span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {t('chooseSubjectTip', 'Select a subject to view and edit details')}
                  </div>
                </div>
              </div>

              <div className="sm:w-fit md:w-96 max-w-full relative" onKeyDown={handleKeyDown}>
                <button
                  ref={toggleRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  onClick={toggleDropdown}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-background hover:bg-muted/5 transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium text-sm text-foreground truncate">
                      {selectedSubject?.name ? translateValue(selectedSubject.name, 'subject') : selectedSubject?.subject_id?.name ? translateValue(selectedSubject.subject_id.name, 'subject') : t('unknownSubject', 'Unknown subject')}
                    </span>
                    <div className="flex gap-2 mt-1 items-center flex-wrap">
                      {renderPreviewBadges(selectedSubject)}
                      {selectedSubject?.hourlyRate || selectedSubject?.price ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                          {selectedSubject.hourlyRate ?? selectedSubject.price}{' '}
                          {t('egp', 'EGP')}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && portalStyle &&
                  createPortal(
                    <AnimatePresence>
                      <motion.ul
                        ref={listRef}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        role="listbox"
                        aria-label={t('subjectList', 'Subjects list')}
                        style={{
                          position: 'fixed',
                          top: `${portalStyle.top}px`,
                          left: `${portalStyle.left}px`,
                          width: portalStyle.width,
                          zIndex: 9999,
                          maxHeight: portalStyle.maxHeight,
                          overflowY: 'auto',
                        }}
                        className="rounded-xl border bg-popover shadow-xl overflow-y-auto"
                      >
                        {subjects.map((subject, idx) => {
                          const isSelected = idx === selectedSubjectIndex;
                          const isHighlighted = idx === highlightIndex;
                          const subjectId = subject._id || subject.tempId || `${idx}`;
                          const isExpanded = expandedSubjectId === subjectId;

                          return (
                            <li key={subjectId} role="option" aria-selected={isSelected}>
                              <button
                                type="button"
                                onClick={() => selectIndex(idx)}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                onMouseLeave={() => setHighlightIndex(-1)}
                                className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${isSelected ? 'bg-primary/10 text-primary' : ''} ${isHighlighted && !isSelected ? 'bg-muted/5' : ''}`}
                              >
                                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-muted/10 flex items-center justify-center text-muted-foreground mt-0.5">
                                  <BookOpen className="w-4 h-4" />
                                </div>

                                {renderSubjectDetailsInDropdown(subject)}

                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-2">
                                    {subject.hourlyRate || subject.price ? (
                                      <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                                        {subject.hourlyRate ?? subject.price} {t('egp', 'EGP')}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">—</div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => toggleExpandSubject(subjectId, e)}
                                      className={`p-1 rounded transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    >
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </motion.ul>
                    </AnimatePresence>,
                    document.body
                  )}
              </div>
            </CardHeader>
          </Card>

          <Card className="md:w-full sm:w-fit bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/70 dark:to-indigo-950/70 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
            <TutorLocationMap tutor={tutor} isEditing={isEditing} onChange={onTutorChange} isOwner={isOwner} />
          </Card>
        </div>
      </div>

      {selectedSubject && (
        <div className="space-y-8 mt-8">
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <SubjectPricingInfo
                  subject={selectedSubject}
                  tutor={tutor}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
                {!isEditing && (
                  <TutorReviews tutorId={tutor._id} subjectProfile={selectedSubject} onReviewUpdate={onReviewUpdate} />
                )}
              </div>

              <div className="space-y-6">
                <TutorScheduleManager
                  tutor={tutor}
                  subject={selectedSubject}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
              </div>
            </div>
          </div>

          <div className="lg:hidden space-y-6">
            <SubjectPricingInfo
              subject={selectedSubject}
              onFieldChange={handleNestedChange}
              isEditing={isEditing}
            />
            <TutorScheduleManager
              tutor={tutor}
              subject={selectedSubject}
              isEditing={isEditing}
              onFieldChange={handleNestedChange}
              onTutorChange={onTutorChange}
            />
            {!isEditing && (
              <TutorReviews tutorId={tutor._id} subjectProfile={selectedSubject} onReviewUpdate={onReviewUpdate} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;
