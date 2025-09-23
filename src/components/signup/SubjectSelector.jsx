import React, { useState, useMemo, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen, Search, Grid3X3, X } from "lucide-react";
import { StepDataContext } from "@/context/StepContext";

// --- Tiny UI primitives that use the provided CSS variable color schema ---
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-xl border shadow-sm w-full ${className}`}
    style={{
      backgroundColor: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      borderColor: 'hsl(var(--border))',
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <div className={`text-base font-semibold ${className}`}>{children}</div>
);

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded ${className}`}
    style={{
      backgroundColor: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
    }}
  >
    {children}
  </span>
);

// small helper to render semantic inline styles using the design tokens
const styles = {
  primaryTone: {
    backgroundColor: 'hsl(var(--primary) / 0.12)',
    color: 'hsl(var(--primary-foreground))',
  },
  subtleCard: {
    backgroundColor: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
    borderColor: 'hsl(var(--border))',
  },
  mutedText: { color: 'hsl(var(--muted-foreground))' },
  foregroundText: { color: 'hsl(var(--foreground))' },
};

export default function SubjectSelector({ subjects: propSubjects = null, selectedId = null, onSelect = () => {}, className = "" }) {
  const { state } = useContext(StepDataContext);

  // Use passed subjects if provided, otherwise use context subjects
  const subjects = Array.isArray(propSubjects) ? propSubjects : (state?.subjects || []);

  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(selectedId ? String(selectedId) : null);

  useEffect(() => {
    if (selectedId !== null && selectedId !== undefined) {
      setSelectedVariantId(String(selectedId));
    }
  }, [selectedId]);

  // Group subjects by name and produce variants
  const subjectGroups = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];

    const groupsMap = subjects.reduce((acc, subject) => {
      const subjectName = subject.name || "Untitled";
      if (!acc[subjectName]) acc[subjectName] = [];

      const variant = {
        id: subject.id?.toString() || `sub-${Math.random().toString(36).slice(2, 9)}`,
        name: `${subject.name} — ${subject.educationSystem || 'System'} (${subject.grade || 'Grade'})`,
        system: subject.educationSystem,
        grade: subject.grade,
        sector: Array.isArray(subject.sectors) && subject.sectors.length > 0 ? subject.sectors.join(', ') : 'General',
        language: Array.isArray(subject.languages) && subject.languages.length > 0 ? subject.languages.join(', ') : (subject.language || 'Arabic'),
        overview: subject.overview || '',
        price: subject.price || null,
        raw: subject,
      };

      acc[subjectName].push(variant);
      return acc;
    }, {});

    return Object.entries(groupsMap).map(([key, variants]) => ({ key, variants }));
  }, [subjects]);

  const flatVariants = useMemo(() => subjectGroups.flatMap(g => g.variants), [subjectGroups]);
  const selectedVariant = useMemo(() => flatVariants.find(v => v.id === (selectedVariantId?.toString())) || flatVariants[0] || null, [flatVariants, selectedVariantId]);

  const filteredGroups = useMemo(() => {
    if (!search) return subjectGroups;
    const q = search.trim().toLowerCase();
    return subjectGroups
      .map(g => ({
        ...g,
        variants: g.variants.filter(v =>
          v.name.toLowerCase().includes(q) ||
          String(v.grade).toLowerCase().includes(q) ||
          String(v.system || '').toLowerCase().includes(q) ||
          (v.sector || '').toLowerCase().includes(q)
        )
      }))
      .filter(g => g.variants.length > 0);
  }, [subjectGroups, search]);

  // call onSelect when selection changes
  useEffect(() => {
    if (!selectedVariant) return;
    onSelect && onSelect({ ...selectedVariant, subject: selectedVariant.raw });
  }, [selectedVariantId, selectedVariant, onSelect]);

  if (!subjects || subjects.length === 0) {
    return (
      <div className={`mt-6 mx-3 w-full ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary-foreground))' }}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <CardTitle>No Subjects Added Yet</CardTitle>
                <div className="text-sm" style={styles.mutedText}>
                  Add subjects in the onboarding flow to see them here
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 mt-6 w-full ${className}`} style={{ color: 'hsl(var(--foreground))' }}>
      <div className="flex flex-col gap-6">
        <Card className="w-full">
          <CardHeader className="items-start">
            <div className="flex items-center gap-3 w-full">
              <div
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary-foreground))' }}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  Subjects
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                    {flatVariants.length}
                  </span>
                </CardTitle>
                <div className="text-sm" style={styles.mutedText}>
                  Select a subject to view its variants
                </div>
              </div>
            </div>

            <div className="relative w-full mt-4 sm:mt-0 sm:w-80">
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'hsl(var(--popover))',
                  color: 'hsl(var(--popover-foreground))',
                  borderColor: 'hsl(var(--border))',
                }}
              >
                <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                  <span className="font-medium text-sm truncate w-full" title={selectedVariant?.name}>
                    {selectedVariant?.name}
                  </span>
                  <div className="flex gap-1 mt-1 items-center flex-wrap">
                    <Badge className="text-xs">
                      {selectedVariant?.system}
                    </Badge>
                    <Badge className="text-xs">
                      G{selectedVariant?.grade}
                    </Badge>
                    <Badge className="text-xs">
                      {selectedVariant?.language}
                    </Badge>
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute z-50 mt-2 w-full rounded-xl border overflow-hidden"
                    style={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', borderColor: 'hsl(var(--border))' }}
                  >
                    <div className="max-h-64 sm:max-h-96 overflow-y-auto p-2 sm:p-3 space-y-2">
                      {filteredGroups.length === 0 && (
                        <div className="text-sm p-4 text-center" style={styles.mutedText}>No matches</div>
                      )}

                      {filteredGroups.map((group) => {
                        const isExpanded = expandedGroup === group.key;
                        const preview = group.variants[0];
                        return (
                          <div key={group.key} className="rounded-md">
                            <div
                              className="mb-1 w-full p-2 sm:p-3 flex items-start gap-2 sm:gap-3 cursor-pointer rounded-md"
                              onClick={() => setExpandedGroup((prev) => (prev === group.key ? null : group.key))}
                              style={{ backgroundColor: isExpanded ? 'hsl(var(--input))' : 'transparent' }}
                            >
                              <div className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                  {group.key}{' '}
                                  <span className="ml-1 text-xs" style={styles.mutedText}>
                                    · {group.variants.length} variants
                                  </span>
                                </div>
                                <div className="text-xs truncate" style={styles.mutedText}>
                                  {preview ? `${preview.system} • G${preview.grade}` : '—'}
                                </div>
                                <div className="flex gap-1 mt-1 sm:mt-2 items-center flex-wrap">
                                  {preview && (
                                    <>
                                      <Badge className="text-xs">
                                        <Grid3X3 className="w-2 h-2 sm:w-3 sm:h-3 inline-block mr-1" /> {preview.sector}
                                      </Badge>
                                      <Badge className="text-xs">{preview.language}</Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="text-sm font-semibold whitespace-nowrap hidden sm:block" style={styles.foregroundText}>
                                    {preview?.price ?? ''}
                                  </div>
                                  <button 
                                    type="button" 
                                    className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setSelectedVariantId(preview.id); setIsOpen(false); }}
                                  >
                                    Select
                                  </button>
                                  <button
                                    type="button"
                                    className={`p-1 rounded transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                    style={{ color: 'hsl(var(--muted-foreground))' }}
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.14 }}
                                  className="px-2 sm:px-4 pb-2 sm:pb-3"
                                >
                                  <ul className="space-y-2 relative pl-4 sm:pl-6" style={{ borderLeft: `2px solid hsl(var(--muted))` }}>
                                    {group.variants.map((variant) => {
                                      const active = variant.id === selectedVariantId || (!selectedVariantId && variant === flatVariants[0]);
                                      return (
                                        <li key={variant.id} className="relative">
                                          <button
                                            type="button"
                                            onClick={() => { setSelectedVariantId(variant.id); setIsOpen(false); }}
                                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors flex items-center gap-2 sm:gap-3 text-sm`}
                                            style={{ backgroundColor: active ? 'hsl(var(--primary) / 0.12)' : 'transparent', color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--popover-foreground))' }}
                                          >
                                            <div className="min-w-0 flex-1">
                                              <div className="font-medium truncate">{variant.name}</div>
                                              <div className="text-xs truncate" style={styles.mutedText}>
                                                {variant.system} • G{variant.grade}
                                              </div>
                                              <div className="mt-1 sm:mt-2 flex gap-1 items-center flex-wrap">
                                                <Badge className="text-xs">{variant.sector}</Badge>
                                                <Badge className="text-xs">{variant.language}</Badge>
                                              </div>
                                            </div>
                                            <div className="text-sm font-semibold whitespace-nowrap flex-shrink-0">
                                              {variant.price ?? ''}
                                            </div>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}