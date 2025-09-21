import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubjectsDisplay({ tutor = {}, t }) {
  const subjects = tutor.subjects || [];
  const { i18n } = useTranslation();
  const dir = i18n && typeof i18n.dir === 'function' ? i18n.dir() : 'ltr';
  const textAlign = dir === 'rtl' ? 'right' : 'left';

  const normalizeArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [String(value)];
  };

  // helper to translate values with multiple fallbacks
  const translateValue = (value, type) => {
    if (!value && value !== 0) return '';
    // direct subject mapping
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
      // try national languages then generic Languages
      const national = t(`constants.EducationStructure.National.languages.${value}`, { defaultValue: null });
      if (national) return national !== 'null' ? national : t(`constants.Languages.${value}`, { defaultValue: value });
      return t(`constants.Languages.${value}`, { defaultValue: value });
    }
    // generic fallback
    return t(value, { defaultValue: value });
  };

  const Chips = ({ value, ariaLabel, type = 'generic' }) => {
    const items = normalizeArrayField(value);
    if (items.length === 0) {
      return <span className="font-medium text-xs" style={{ textAlign }}>{t('notSpecified', 'Not specified')}</span>;
    }

    return (
      <div
        className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full p-1"
        aria-label={ariaLabel}
        style={{ direction: dir }}
      >
        {items.map((it, i) => {
          const translated = (() => {
            if (type === 'sector') return translateValue(it, 'sector');
            if (type === 'language') return translateValue(it, 'language');
            if (type === 'subject') return translateValue(it, 'subject');
            if (type === 'grade') return translateValue(it, 'grade');
            return translateValue(it, 'generic');
          })();

          return (
            <span
              key={it + i}
              className="flex-shrink-0 text-[10px] px-2 py-1 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 backdrop-blur-sm whitespace-nowrap transition-all hover:scale-105 hover:border-primary/50"
              title={it}
              style={{ textAlign }}
            >
              {translated}
            </span>
          );
        })}
      </div>
    );
  };

  // Group subjects by normalized name (case-insensitive, trimmed)
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of subjects) {
      const key = (s.name || '').toString().trim().toLowerCase() || `__no_name__${Math.random()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return Array.from(map.entries()); // [ [key, [subjects...]], ... ]
  }, [subjects]);

  // timeline line position (left for ltr, right for rtl)
  const timelineLineStyle = dir === 'rtl' ? { right: '0.5rem', left: 'auto' } : { left: '0.5rem', right: 'auto' };

  return (
    <div
      dir={dir}
      style={{ direction: dir }}
      className={cn(
        "w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-4 z-10 border border-gray-200 dark:border-gray-700",
        "max-h-[70vh] overflow-y-auto flex-1 min-w-0 md:max-w-xs md:-mt-40 sm:mt-20"
      )}
    >
      <div
        className="text-lg font-semibold flex items-center gap-2 text-primary mb-4 pb-2 border-b border-gray-100 dark:border-gray-700"
        style={{ textAlign }}
      >
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
          <GraduationCap size={20} className="text-primary" />
        </div>
        {t('teachesSubjects', 'Teaches')}
      </div>

      {subjects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {grouped.map(([key, group], idx) => {
            const displayName = translateValue(group[0].name, 'subject') || t('unnamedSubject', 'Unnamed subject');

            return (
              <motion.div
                key={`${key}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/70 dark:to-gray-800/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                style={{ direction: dir }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <GraduationCap size={16} className="text-primary shrink-0" />
                  </div>
                  <h4 className="text-base font-semibold truncate flex-1" style={{ textAlign }}>
                    {displayName}
                  </h4>
                </div>

                {/* if only one variant, show same layout as before */}
                {group.length === 1 ? (
                  (() => {
                    const subject = group[0];
                    return (
                      <div className="text-xs text-muted-foreground flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                              {t('System', 'System')}
                            </div>
                            <div className="font-medium truncate text-xs" style={{ textAlign }}>
                              {subject.education_system ? translateValue(subject.education_system, 'system') : t('notSpecified', 'Not specified')}
                            </div>
                          </div>

                          <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                              {t('Grade', 'Grade')}
                            </div>
                            <div className="font-medium truncate text-xs" style={{ textAlign }}>
                              {subject.grade ? translateValue(subject.grade, 'grade') : t('notSpecified', 'Not specified')}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                              {t('Sector', 'Sector')}
                            </div>
                            <Chips value={subject.sector} ariaLabel={`${t('Sector', 'Sector')} for ${subject.name || ''}`} type="sector" />
                          </div>

                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                              {t('Language', 'Language')}
                            </div>
                            <Chips value={subject.language} ariaLabel={`${t('Language', 'Language')} for ${subject.name || ''}`} type="language" />
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // multiple variants: render a compact vertical timeline of variants inside the same card
                  <div className="relative">
                    {/* vertical line */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 z-0 mx-1"
                      style={timelineLineStyle}
                    />

                    <div className="flex flex-col gap-4">
                      {group.map((subject, i) => (
                        <div
                          key={`${key}-var-${i}`}
                          className="relative flex items-start gap-3 z-10"
                        >
                          {/* dot */}
                          <div className="flex-shrink-0 flex justify-center mx-1" style={{ width: '1rem' }}>
                            <div className="w-3 h-3 rounded-full bg-primary/60 border border-white dark:border-gray-800 shadow-sm mt-5" />
                          </div>

                          {/* content */}
                          <div className="flex-1 p-2 rounded-md border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                            <div className="grid grid-cols-2 gap-2 ">
                              <div className="w-fit bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                                  {subject.education_system ? translateValue(subject.education_system, 'system') : t('notSpecified', 'Not specified')}
                                </div>
                                <div className="font-medium truncate text-xs" style={{ textAlign }}>
                                  {subject.grade ? translateValue(subject.grade, 'grade') : t('notSpecified', 'Not specified')}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 space-y-2">
                              <div>
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                                  {t('Sector', 'Sector')}
                                </div>
                                <Chips value={subject.sector} ariaLabel={`${t('Sector', 'Sector')} for ${subject.name || ''}`} type="sector" />
                              </div>

                              <div>
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1" style={{ textAlign }}>
                                  {t('Language', 'Language')}
                                </div>
                                <Chips value={subject.language} ariaLabel={`${t('Language', 'Language')} for ${subject.name || ''}`} type="language" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 bg-gradient-to-br from-gray-100/50 to-gray-200/30 dark:from-gray-700/30 dark:to-gray-800/20 flex flex-col items-center text-center text-muted-foreground gap-3" style={{ textAlign }}>
          <div className="p-2 rounded-full bg-primary/10">
            <GraduationCap size={32} className="text-primary/60" />
          </div>
          <p className="font-medium text-sm">{t('noSubjectsAdded', 'No subjects added')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('subjectsWillAppear', 'Subjects will appear here once added')}</p>
        </div>
      )}
    </div>
  );
}