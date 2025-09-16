import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MultiSelect
 * - options: array of values
 * - selected: array of selected values
 * - onToggle(opt): optional, toggles a single option
 * - onChange(newArray): optional, called with updated array
 * - placeholder: string
 * - display(opt): function to render label
 * - selectAllLabel, onSelectAll (optional)
 * - renderTags: whether to render chips/tags below the control (default: true)
 */
export default function MultiSelect({
  options = [],
  selected = [],
  onToggle,
  onChange,
  placeholder = 'Select...',
  display = (v) => (v == null ? '' : String(v)),
  selectAllLabel,
  onSelectAll,
  renderTags = true,
  className
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const isSelected = useCallback((opt) => {
    return Array.isArray(selected) && selected.some(s => String(s) === String(opt));
  }, [selected]);

  const toggle = useCallback((opt) => {
    if (typeof onToggle === 'function') return onToggle(opt);
    if (typeof onChange === 'function') {
      const exists = isSelected(opt);
      const next = Array.isArray(selected) ? [...selected] : [];
      if (exists) {
        return onChange(next.filter(s => String(s) !== String(opt)));
      }
      return onChange([...next, opt]);
    }
  }, [onToggle, onChange, selected, isSelected]);

  const displayText = Array.isArray(selected) && selected.length > 0
    ? selected.map(s => display(s)).join(', ')
    : '';

  // small animation configs
  const dropdownMotion = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };
  const itemHover = { scale: 1.02 };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="block truncate">{displayText || placeholder}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground"><path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5"
            initial={dropdownMotion.initial}
            animate={dropdownMotion.animate}
            exit={dropdownMotion.exit}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="px-1">
              {options.map(opt => {
                const sel = isSelected(opt);
                return (
                  <motion.button
                    layout
                    key={String(opt)}
                    type="button"
                    onClick={() => toggle(opt)}
                    whileHover={itemHover}
                    whileTap={{ scale: 0.995 }}
                    className={cn(
                      'relative w-full text-left cursor-pointer select-none py-2 pl-10 pr-4 transition-colors rounded',
                      sel ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    aria-pressed={sel}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(opt); } }}
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                      {sel ? <CheckCircle className="h-5 w-5" /> : <span className="w-5 h-5" />}
                    </span>
                    <span className="block truncate">{display(opt)}</span>
                  </motion.button>
                );
              })}

              {selectAllLabel && options.length > 1 && (
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => { if (typeof onSelectAll === 'function') onSelectAll(); }}
                    className="w-full text-xs px-2 py-1 rounded-md border border-border bg-background hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {selectAllLabel}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* chips */}
      {renderTags && (
        <div className="flex flex-wrap gap-2 mt-3">
          <AnimatePresence mode="popLayout">
            {Array.isArray(selected) && selected.map(s => (
              <motion.div
                layout
                key={String(s)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs shadow-sm"
              >
                <span className="truncate max-w-[10rem]">{display(s)}</span>
                <button type="button" aria-label={`Remove ${display(s)}`} onClick={() => toggle(s)} className="opacity-80 hover:opacity-100">✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
