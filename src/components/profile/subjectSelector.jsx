import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  BookOpen,
  Clock,
  Grid3X3,
  ChevronRight,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorScheduleManager from '@/components/profile/TutorScheduleManager';
import TutorReviews from '@/components/profile/TutorReviews';
import TutorLocationMap from './map';
import { useAuth } from '@/context/AuthContext';

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
  const { t, i18n } = useTranslation();
  const { authState } = useAuth();

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(subjects.length > 0 ? 0 : -1);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleRef = useRef(null);
  const listRef = useRef(null);

  const [portalStyle, setPortalStyle] = useState(null);

  const studentProfile = useMemo(() => {
    if (authState?.userData && String(authState?.userRole || '').toLowerCase() === 'student') {
      return authState.userData;
    }
    return null;
  }, [authState]);

  const orderedSubjects = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];
    if (!studentProfile) return subjects.map((s, i) => ({ subject: s, originalIndex: i }));

    const prefSystem = studentProfile.education_system || studentProfile.educationSystem;
    const prefGrade = studentProfile.grade;
    const prefSector = studentProfile.sector;
    const prefLanguage = studentProfile.studying_language || studentProfile.language || studentProfile.studyingLanguage;

    function scoreFor(sub) {
      const system = sub.education_system || sub.subject_id?.education_system;
      const grade = sub.grade || sub.subject_id?.grade;
      const sectors = Array.isArray(sub.sector) ? sub.sector : (sub.sector ? [sub.sector] : (sub.subject_id?.sector ? (Array.isArray(sub.subject_id.sector) ? sub.subject_id.sector : [sub.subject_id.sector]) : []));
      const languages = Array.isArray(sub.language) ? sub.language : (sub.language ? [sub.language] : (sub.subject_id?.language ? (Array.isArray(sub.subject_id.language) ? sub.subject_id.language : [sub.subject_id.language]) : []));

      let score = 0;
      if (prefSystem && system && String(system) === String(prefSystem)) score += 1;
      if (prefGrade && grade && String(grade) === String(prefGrade)) score += 1;
      if (prefSector && sectors && sectors.map(s => String(s)).includes(String(prefSector))) score += 1;
      if (prefLanguage && languages && languages.map(l => String(l)).includes(String(prefLanguage))) score += 1;

      return score;
    }

    const withScores = subjects.map((s, i) => ({ subject: s, originalIndex: i, score: scoreFor(s) }));

    withScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.originalIndex - b.originalIndex;
    });

    return withScores.map(({ subject, originalIndex }) => ({ subject, originalIndex }));
  }, [subjects, studentProfile]);

  // group by subject name but preserve orderedSubjects order
  const groupedOrdered = useMemo(() => {
    const groups = [];
    const nameKey = (s) => (s.subject.name || s.subject.subject_id?.name || '');
    orderedSubjects.forEach((entry, orderedIndex) => {
      const key = String(nameKey(entry) || '').trim();
      const found = groups.find(g => g.key === key);
      const item = { ...entry, orderedIndex };
      if (found) {
        found.items.push(item);
      } else {
        groups.push({ key, displayName: key, items: [item] });
      }
    });
    return groups;
  }, [orderedSubjects]);

  useEffect(() => {
    if (!orderedSubjects || orderedSubjects.length === 0) {
      setSelectedSubjectIndex(-1);
      setHighlightIndex(-1);
      return;
    }

    if (studentProfile) {
      const prevOriginalIndex = selectedSubjectIndex >= 0 && orderedSubjects[selectedSubjectIndex] ? orderedSubjects[selectedSubjectIndex].originalIndex : null;
      const foundIdx = prevOriginalIndex != null ? orderedSubjects.findIndex(o => o.originalIndex === prevOriginalIndex) : -1;
      if (foundIdx >= 0) {
        setSelectedSubjectIndex(foundIdx);
        return;
      }
      setSelectedSubjectIndex(0);
      return;
    }

    setSelectedSubjectIndex((idx) => {
      if (idx < 0 || idx >= orderedSubjects.length) return 0;
      return idx;
    });
  }, [orderedSubjects, studentProfile]);

  const selectedSubject = useMemo(() => {
    if (selectedSubjectIndex >= 0 && orderedSubjects[selectedSubjectIndex]) return orderedSubjects[selectedSubjectIndex].subject;
    return null;
  }, [orderedSubjects, selectedSubjectIndex]);

  const handleNestedChange = useCallback(
    (path, value) => {
      if (typeof onUpdateSubject === 'function' && selectedSubjectIndex >= 0 && orderedSubjects[selectedSubjectIndex]) {
        const originalIndex = orderedSubjects[selectedSubjectIndex].originalIndex;
        const updated = { ...(subjects[originalIndex] || {}), [path]: value };
        onUpdateSubject(originalIndex, updated);
      }
    },
    [onUpdateSubject, orderedSubjects, selectedSubjectIndex, subjects]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen((v) => !v);
    setHighlightIndex(-1);
    setSearchTerm('');
  }, []);

  const selectIndex = useCallback(
    (index) => {
      if (index < 0 || index >= orderedSubjects.length) return;
      setSelectedSubjectIndex(index);
      setIsOpen(false);
      setHighlightIndex(-1);
      setExpandedSubjectId(null);
      setExpandedGroupKey(null);
      setSearchTerm('');
    },
    [orderedSubjects.length]
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
      const len = orderedSubjects.length;
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
    [isOpen, orderedSubjects.length, highlightIndex, selectIndex]
  );

  const dir = i18n.dir();

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
      const positionStyle = dir === 'ltr' ? { left: rect.left } : { right: window.innerWidth - rect.right };
      setPortalStyle({
        top,
        ...positionStyle,
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
  }, [isOpen, dir]);

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

  const translateSubjectName = useCallback((name) => {
    if (!name && name !== 0) return '';
    return t(`constants.Subjects.${name}`, { defaultValue: name });
  }, [t]);

  // improved badge renderer: show up to 3 badges then +N
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
        <Badge key="grade" variant="secondary" className="text-[10px]">
          {translateValue(grade, 'grade')}
        </Badge>
      );
    }

    sectors.forEach((s, i) => {
      badges.push(
        <Badge key={`sec-${i}`} variant="outline" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
          <Grid3X3 size={10} />
          {translateValue(s, 'sector')}
        </Badge>
      );
    });

    languages.forEach((l, i) => {
      badges.push(
        <Badge key={`lang-${i}`} variant="outline" className="text-[10px] px-1.5 py-0.5">
          {translateValue(l, 'language')}
        </Badge>
      );
    });

    // cap badges visually
    const cap = 3;
    const visible = badges.slice(0, cap);
    if (badges.length > cap) {
      visible.push(
        <Badge key="more" variant="secondary" className="text-[10px] px-1.5 py-0.5">
          +{badges.length - cap}
        </Badge>
      );
    }
    return visible;
  };

  const renderSubjectDetailsInDropdown = (subject, originalIndex, showCompact = true) => {
    const system = subject.education_system || subject.subject_id?.education_system;
    const grade = subject.grade || subject.subject_id?.grade;
    const sectors = getDisplayValues(subject.sector || subject.subject_id?.sector);
    const languages = getDisplayValues(subject.language || subject.subject_id?.language);

    const subjectName = subject.name ? translateValue(subject.name, 'subject') : subject.subject_id?.name ? translateValue(subject.subject_id.name, 'subject') : t('unknownSubject', 'Unknown subject');

    return (
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate" title={subjectName}>
          {subjectName}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {(system ? translateValue(system, 'system') : '—')} • {(grade ? translateValue(grade, 'grade') : '—')}
        </div>

        {!showCompact && (
          <div className="mt-2 space-y-2">
            {sectors.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t('Sector', 'Sector')}:</span>
                {sectors.map((sector, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5" title={translateValue(sector, 'sector')}>
                    {translateValue(sector, 'sector')}
                  </Badge>
                ))}
              </div>
            )}

            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs font-medium text-muted-foreground">{t('Language', 'Language')}:</span>
                {languages.map((language, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5" title={translateValue(language, 'language')}>
                    {translateValue(language, 'language')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
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

  // Filter helper: if there's a search term filter items inside a group
  const groupMatchesSearch = (group, term) => {
    if (!term) return true;
    const lower = term.toLowerCase();
    return group.items.some(it => {
      const name = it.subject.name || it.subject.subject_id?.name || '';
      return String(name).toLowerCase().includes(lower) ||
        String(it.subject.grade || it.subject.subject_id?.grade || '').toLowerCase().includes(lower) ||
        String(it.subject.education_system || it.subject.subject_id?.education_system || '').toLowerCase().includes(lower);
    });
  };

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
          <Card className="w-full md:w-fit flex justify-center items-center">
            <CardHeader className="p-4 flex md:flex-col sm:flex-row items-start sm:items-center justify-start gap-4">
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
                    <span>{t('selectSubjectDropDown', 'Select a subject to view and edit details')}</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-96 max-w-full relative" onKeyDown={handleKeyDown}>
                <button
                  ref={toggleRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  onClick={toggleDropdown}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-background hover:bg-muted/5 transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium text-sm text-foreground truncate" title={selectedSubject?.name || selectedSubject?.subject_id?.name}>
                      {selectedSubject?.name ? translateValue(selectedSubject.name, 'subject') : selectedSubject?.subject_id?.name ? translateValue(selectedSubject.subject_id.name, 'subject') : t('unknownSubject', 'Unknown subject')}
                    </span>
                    <div className="flex gap-2 mt-1 items-center flex-wrap px-2">
                      {renderPreviewBadges(selectedSubject)}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && portalStyle &&
                  createPortal(
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: 'fixed',
                          top: `${portalStyle.top}px`,
                          ...portalStyle,
                          zIndex: 9999,
                          overflow: 'hidden',
                        }}
                        className="rounded-xl border bg-popover shadow-xl"
                        dir={dir}
                      >
                        <div style={{ maxHeight: portalStyle.maxHeight - 64, overflowY: 'auto' }} ref={listRef}>
                          <ul role="listbox" aria-label={t('subjectList', 'Subjects list')} className="space-y-2 p-3">
                            {groupedOrdered.filter(g => groupMatchesSearch(g, searchTerm)).map((group, gIdx) => {
                              const isGroupExpanded = expandedGroupKey === group.key;
                              const groupCount = group.items.length;
                              const firstItem = group.items[0];
                              const subjectForPreview = firstItem?.subject;

                              return (
                                <li key={`group-${gIdx}`} className="rounded-md">
                                  <div
                                    className={`w-full text-left p-3 flex items-start gap-3 cursor-pointer hover:bg-muted/3 transition-colors rounded-md flex-wrap`}
                                    onClick={() => setExpandedGroupKey(prev => prev === group.key ? null : group.key)}
                                    onMouseEnter={() => setHighlightIndex(firstItem?.orderedIndex ?? -1)}
                                    onMouseLeave={() => setHighlightIndex(-1)}
                                  >
                                    <div className="flex-shrink-0 w-9 h-9 rounded-md bg-muted/10 flex items-center justify-center text-muted-foreground mt-0.5">
                                      <BookOpen className="w-4 h-4" />
                                    </div>

                                    <div className="min-w-0 flex-1 rtl:text-right">
                                      <div className="font-medium text-sm truncate" title={translateSubjectName(group.key)}>
                                        {translateSubjectName(group.key) || t('unknownSubject', 'Unknown subject')}
                                        <span className="ml-2 text-xs text-muted-foreground">· {groupCount} {t('variants','variants')}</span>
                                      </div>
                                      <div className="flex gap-2 mt-2 items-center flex-wrap">{renderPreviewBadges(subjectForPreview)}</div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm font-semibold text-foreground whitespace-nowrap">{group.items[0]?.subject?.hourlyRate ?? group.items[0]?.subject?.price ?? '—'}</div>
                                        <button type="button" className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20">
                                          {t('Select')}
                                        </button>
                                        <button type="button" className={`p-1 rounded transition-transform ${isGroupExpanded ? 'rotate-90' : ''}`} aria-label={isGroupExpanded ? t('collapse','Collapse') : t('expand','Expand')}>
                                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {isGroupExpanded && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.14 }} className="px-4 pb-3">
                                        <ul className="space-y-2 relative before:content-[''] before:absolute before:inset-y-0 before:start-3 before:w-0.5 before:bg-muted ">
                                          {group.items
                                            .filter(it => {
                                              if (!searchTerm) return true;
                                              const name = it.subject.name || it.subject.subject_id?.name || '';
                                              return String(name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                String(it.subject.grade || it.subject.subject_id?.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
                                            })
                                            .map((it) => {
                                              const { subject, originalIndex, orderedIndex } = it;
                                              const isSelected = orderedIndex === selectedSubjectIndex;
                                              const isHighlighted = orderedIndex === highlightIndex;
                                              return (
                                                <li key={`variant-${orderedIndex}`} className="relative">
                                                  <button
                                                    type="button"
                                                    onClick={() => selectIndex(orderedIndex)}
                                                    onMouseEnter={() => setHighlightIndex(orderedIndex)}
                                                    onMouseLeave={() => setHighlightIndex(-1)}
                                                    className={`rtl:text-right w-full text-left ps-8 p-3 rounded-lg transition-colors flex items-center gap-3 relative before:content-[''] before:absolute before:start-2 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:bg-primary ${isSelected ? 'bg-primary/10 text-primary' : ''} ${isHighlighted && !isSelected ? 'bg-muted/5' : ''} flex-wrap`}
                                                  >
                                                    <div className="min-w-0 flex-1">
                                                      {renderSubjectDetailsInDropdown(subject, originalIndex, false)}
                                                    </div>
                                                  </button>
                                                </li>
                                              );
                                            })}
                                        </ul>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </motion.div>
                    </AnimatePresence>,
                    document.body
                  )}
              </div>
            </CardHeader>
          </Card>

          <Card className="w-full flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/70 dark:to-indigo-950/70 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
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