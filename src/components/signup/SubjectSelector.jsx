import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen, Search, Grid3X3 } from "lucide-react";

// --- Tiny UI primitives that use the provided CSS variable color schema ---
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-xl border shadow-sm ${className}`}
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
  <div className={`p-4 flex items-center justify-between ${className}`}>{children}</div>
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

// --- The standalone UI-only Subject Selector (color tokens wired to your schema) ---
export default function SubjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const fakeGroups = useMemo(
    () => [
      {
        key: "Mathematics",
        variants: [
          { id: "m-ig-10", name: "Mathematics — IGCSE (Grade 10)", system: "IGCSE", grade: "10", sector: "Science", language: "English", price: "$20/hr" },
          { id: "m-nat-12", name: "Mathematics — National (Grade 12)", system: "National", grade: "12", sector: "Science", language: "Arabic", price: "$25/hr" },
        ],
      },
      {
        key: "Physics",
        variants: [
          { id: "p-ig-11", name: "Physics — IGCSE (Grade 11)", system: "IGCSE", grade: "11", sector: "Science", language: "English", price: "$22/hr" },
        ],
      },
      {
        key: "English",
        variants: [
          { id: "e-int-9", name: "English — International (Grade 9)", system: "International", grade: "9", sector: "Arts", language: "English", price: "$18/hr" },
          { id: "e-nat-10", name: "English — National (Grade 10)", system: "National", grade: "10", sector: "Arts", language: "Arabic", price: "$16/hr" },
          { id: "e-beg-7", name: "English — Beginner (Grade 7)", system: "National", grade: "7", sector: "Arts", language: "English", price: "$12/hr" },
        ],
      },
    ],
    []
  );

  const flatVariants = useMemo(() => fakeGroups.flatMap((g) => g.variants), [fakeGroups]);
  const selectedVariant = flatVariants.find((v) => v.id === selectedVariantId) ?? flatVariants[0];

  const filteredGroups = useMemo(() => {
    if (!search) return fakeGroups;
    const q = search.trim().toLowerCase();
    return fakeGroups
      .map((g) => ({
        ...g,
        variants: g.variants.filter(
          (v) => v.name.toLowerCase().includes(q) || String(v.grade).toLowerCase().includes(q) || String(v.system).toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.variants.length > 0);
  }, [fakeGroups, search]);

  return (
    <div className="space-y-6 mt-6 max-w-3xl" style={{ color: 'hsl(var(--foreground))' }}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="md:w-fit flex-1">
            <CardHeader className="items-start">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-md"
                  style={{ backgroundColor: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary-foreground))' }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Subjects
                    <span
                      className="text-xs px-2 py-0.5 rounded-full ml-2"
                      style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                    >
                      {flatVariants.length}
                    </span>
                  </CardTitle>
                  <div className="text-sm" style={styles.mutedText}>
                    Select a subject to view its variants
                  </div>
                </div>
              </div>

              <div className="relative w-80">
                <button
                  type="button"
                  onClick={() => setIsOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    borderColor: 'hsl(var(--border))',
                  }}
                >
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium text-sm truncate" title={selectedVariant?.name}>
                      {selectedVariant?.name}
                    </span>
                    <div className="flex gap-2 mt-1 items-center flex-wrap">
                      <Badge style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }} className="">
                        {selectedVariant?.system}
                      </Badge>
                      <Badge className="" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                        G{selectedVariant?.grade}
                      </Badge>
                      <Badge className="" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                        {selectedVariant?.language}
                      </Badge>
                    </div>
                  </div>

                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                      <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                        {filteredGroups.length === 0 && (
                          <div className="text-sm p-4 text-center" style={styles.mutedText}>No matches</div>
                        )}

                        {filteredGroups.map((group) => {
                          const isExpanded = expandedGroup === group.key;
                          const preview = group.variants[0];
                          return (
                            <div key={group.key} className="rounded-md">
                              <div
                                className="mb-1 w-full p-3 flex items-start gap-3 cursor-pointer rounded-md"
                                onClick={() => setExpandedGroup((prev) => (prev === group.key ? null : group.key))}
                                style={{ backgroundColor: isExpanded ? 'hsl(var(--input))' : 'transparent' }}
                              >
                                <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                                  <BookOpen className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">
                                    {group.key}{' '}
                                    <span className="ml-2 text-xs" style={styles.mutedText}>
                                      · {group.variants.length} variants
                                    </span>
                                  </div>
                                  <div className="text-xs truncate" style={styles.mutedText}>
                                    {preview ? `${preview.system} • G${preview.grade}` : '—'}
                                  </div>
                                  <div className="flex gap-2 mt-2 items-center flex-wrap">
                                    {preview && (
                                      <>
                                        <Badge className="">
                                          <Grid3X3 className="w-3 h-3 inline-block mr-1" /> {preview.sector}
                                        </Badge>
                                        <Badge className="">{preview.language}</Badge>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold whitespace-nowrap" style={styles.foregroundText}>
                                      {preview?.price ?? '—'}
                                    </div>
                                    <button type="button" className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20">                      
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
                                    className="px-4 pb-3"
                                  >
                                    <ul className="space-y-2 relative pl-6" style={{ borderLeft: `2px solid hsl(var(--muted))` }}>
                                      {group.variants.map((variant) => {
                                        const active = variant.id === selectedVariantId || (!selectedVariantId && variant === flatVariants[0]);
                                        return (
                                          <li key={variant.id} className="relative">
                                            <button
                                              type="button"
                                              onClick={() => setSelectedVariantId(variant.id)}
                                              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3`}
                                              style={{ backgroundColor: active ? 'hsl(var(--primary) / 0.12)' : 'transparent', color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--popover-foreground))' }}
                                            >
                                              <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm truncate">{variant.name}</div>
                                                <div className="text-xs truncate" style={styles.mutedText}>
                                                  {variant.system} • G{variant.grade}
                                                </div>
                                                <div className="mt-2 flex gap-2 items-center flex-wrap">
                                                  <Badge>{variant.sector}</Badge>
                                                  <Badge>{variant.language}</Badge>
                                                </div>
                                              </div>
                                              <div className="text-sm font-semibold whitespace-nowrap">{variant.price}</div>
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
    </div>
  );
}
