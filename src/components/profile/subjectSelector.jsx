import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Star, Clock, Users, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorScheduleManager from '@/components/profile/TutorScheduleManager';
import TutorReviews from '@/components/profile/TutorReviews';
import TutorLocationMap from './map';

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

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(
    subjects.length > 0 ? 0 : -1
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const toggleRef = useRef(null);
  const listRef = useRef(null);

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

  const selectedSubject = useMemo(() => {
    return selectedSubjectIndex >= 0 ? subjects[selectedSubjectIndex] : null;
  }, [subjects, selectedSubjectIndex]);

  const handleNestedChange = useCallback(
    (path, value) => {
      if (typeof onUpdateSubject === 'function' && selectedSubjectIndex >= 0) {
        const updated = {
          ...(subjects[selectedSubjectIndex] || {}),
          [path]: value,
        };
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
    },
    [subjects.length]
  );

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

  const renderPreviewBadges = (sub) => {
    if (!sub) return null;
    const fields = ['education_system', 'grade', 'sector', 'language'];

    return fields
      .map((field) => [field, sub[field] || sub.subject_id?.[field]])
      .filter(([, val]) => Boolean(val))
      .slice(0, 3)
      .map(([field, val], idx) => (
        <Badge
          key={`${field}-${idx}`}
          variant="secondary"
          className="text-[10px] px-1.5 py-0.5 truncate max-w-[96px]"
        >
          {val}
        </Badge>
      ));
  };

  const subjectsCount = subjects?.length || 0;

  // Calculate tutor stats for the floating component
  const tutorStats = useMemo(() => {
    const totalStudents = subjects.reduce((acc, subject) => acc + (subject.studentsCount || 0), 0);
    const totalReviews = subjects.reduce((acc, subject) => acc + (subject.reviewsCount || 0), 0);
    const avgRating = subjects.reduce((acc, subject) => acc + (subject.averageRating || 0), 0) / subjectsCount;
    
    return {
      totalStudents,
      totalReviews,
      avgRating: avgRating || 0,
      experience: tutor.experience || '2+ years'
    };
  }, [subjects, subjectsCount, tutor]);

  if (!subjects || subjectsCount === 0) {
    return (
      <div className="rounded-xl bg-[color:hsl(var(--muted))/0.08] border border-[color:hsl(var(--border))] px-6 py-10 text-center space-y-4 shadow-sm mt-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[color:hsl(var(--primary))/0.08] text-[color:hsl(var(--primary))] flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-[color:hsl(var(--foreground))]">
          {t('noSubjectsHeader', 'No Subjects Added')}
        </h2>
        <p className="text-[color:hsl(var(--muted-foreground))] max-w-md mx-auto text-sm">
          {t(
            'noSubjectsDescription',
            "This tutor hasn't added any subjects yet."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col-reverse lg:flex-row gap-6">
        {/* Subject Selector Card */}
        <Card className=" md:w-fit flex justify-center items-center">
          <CardHeader className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[color:hsl(var(--primary))/0.08] text-[color:hsl(var(--primary))]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[color:hsl(var(--foreground))] flex items-center gap-2">
                  {t('subjectss', 'Subjects')}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[color:hsl(var(--muted))/0.12] text-[color:hsl(var(--muted-foreground))] ml-2">
                    {subjectsCount}
                  </span>
                </CardTitle>
                <div className="text-sm text-[color:hsl(var(--muted-foreground))]">
                  {t(
                    'chooseSubjectTip',
                    'Select a subject to view and edit details'
                  )}
                </div>
              </div>
            </div>

            {/* Dropdown */}
            <div className="w-96 max-w-full relative" onKeyDown={handleKeyDown}>
              <button
                ref={toggleRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-[color:hsl(var(--background))] hover:bg-[color:hsl(var(--muted))/0.06] transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:hsl(var(--ring))]"
              >
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-medium text-sm text-[color:hsl(var(--foreground))] truncate">
                    {selectedSubject?.name ||
                      selectedSubject?.subject_id?.name ||
                      t('unknownSubject', 'Unknown subject')}
                  </span>
                  <div className="flex gap-2 mt-1 items-center flex-wrap">
                    {renderPreviewBadges(selectedSubject)}
                    {selectedSubject?.hourlyRate || selectedSubject?.price ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0.5"
                      >
                        {selectedSubject.hourlyRate ?? selectedSubject.price}{' '}
                        {t('egp', 'EGP')}
                      </Badge>
                    ) : (
                      <span className="text-xs text-[color:hsl(var(--muted-foreground))]">
                        —
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[color:hsl(var(--muted-foreground))] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.ul
                    ref={listRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    role="listbox"
                    aria-label={t('subjectList', 'Subjects list')}
                    className="absolute left-0 right-0 z-50 mt-2 w-full rounded-xl border bg-[color:hsl(var(--popover))] shadow-xl overflow-y-auto max-h-72"
                  >
                    {subjects.map((subject, idx) => {
                      const name =
                        subject.name ||
                        subject.subject_id?.name ||
                        t('unknownSubject', 'Unknown subject');
                      const isSelected = idx === selectedSubjectIndex;
                      const isHighlighted = idx === highlightIndex;
                      return (
                        <li
                          key={subject._id || subject.tempId || `${idx}`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <button
                            type="button"
                            onClick={() => selectIndex(idx)}
                            onMouseEnter={() => setHighlightIndex(idx)}
                            onMouseLeave={() => setHighlightIndex(-1)}
                            className={`w-full text-left px-4 py-3 flex flex-col gap-2 transition-colors ${
                              isSelected
                                ? 'bg-[color:hsl(var(--primary))/0.08] text-[color:hsl(var(--primary))]'
                                : ''
                            } ${
                              isHighlighted && !isSelected
                                ? 'bg-[color:hsl(var(--muted))/0.06]'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-[color:hsl(var(--muted))/0.06] flex items-center justify-center text-[color:hsl(var(--muted-foreground))]">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {name}
                                  </div>
                                  <div className="text-xs text-[color:hsl(var(--muted-foreground))] truncate">
                                    {subject.subject_id?.grade ||
                                      subject.grade ||
                                      '—'}{' '}
                                    •{' '}
                                    {subject.subject_id?.education_system ||
                                      subject.education_system ||
                                      '—'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {subject.hourlyRate || subject.price ? (
                                  <div className="text-sm font-semibold text-[color:hsl(var(--foreground))]">
                                    {subject.hourlyRate ?? subject.price}{' '}
                                    {t('egp', 'EGP')}
                                  </div>
                                ) : (
                                  <div className="text-xs text-[color:hsl(var(--muted-foreground))]">
                                    —
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-1 flex-wrap">
                              {['education_system', 'grade', 'sector', 'language'].map(
                                (f) =>
                                  subject?.[f] || subject?.subject_id?.[f] ? (
                                    <Badge
                                      key={f}
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0.5 truncate max-w-[96px]"
                                    >
                                      {subject[f] || subject.subject_id?.[f]}
                                    </Badge>
                                  ) : null
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>
        </Card>

        {/* Floating Stats Component */}
        <Card className="md:w-full sm:w-fit  bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/70 dark:to-indigo-950/70 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <TutorLocationMap
            tutor={tutor}
            isEditing={isEditing}
            onChange={onTutorChange}
            isOwner={isOwner}
          />
        </Card>
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
                <TutorVideoManager
                  videos={selectedSubject?.youtube || []}
                  isEditing={isEditing}
                  isOwner={isOwner}
                  onVideosChange={(newVideos) =>
                    handleNestedChange('youtube', newVideos)
                  }
                />
                {!isEditing && (
                  <TutorReviews
                    tutorId={tutor._id}
                    subjectProfile={selectedSubject}
                    onReviewUpdate={onReviewUpdate}
                  />
                )}
              </div>

              <div className="space-y-6">
                <TutorCourseInfo
                  subject={selectedSubject}
                  tutor={tutor}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
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
            <TutorVideoManager
              videos={selectedSubject?.youtube || []}
              isEditing={isEditing}
              isOwner={isOwner}
              onVideosChange={(newVideos) =>
                handleNestedChange('youtube', newVideos)
              }
            />
            <TutorCourseInfo
              subject={selectedSubject}
              tutor={tutor}
              isEditing={isEditing}
              onFieldChange={handleNestedChange}
              onTutorChange={onTutorChange}
            />
            <TutorScheduleManager
              tutor={tutor}
              subject={selectedSubject}
              isEditing={isEditing}
              onFieldChange={handleNestedChange}
              onTutorChange={onTutorChange}
            />
            {!isEditing && (
              <TutorReviews
                tutorId={tutor._id}
                subjectProfile={selectedSubject}
                onReviewUpdate={onReviewUpdate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;