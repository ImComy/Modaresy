import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import Fuse from "fuse.js";

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No options found.",
  disabled = false,
  error = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt
      ),
    [options]
  );

  // Initialize Fuse.js for fuzzy matching
  const fuse = useMemo(
    () =>
      new Fuse(normalizedOptions, {
        keys: ["label"],
        threshold: 0.4,
      }),
    [normalizedOptions]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    return fuse.search(search).map((res) => res.item);
  }, [search, fuse, normalizedOptions]);

  const toggleSelect = (value) => {
    if (disabled) return;
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const removeSelected = (value, e) => {
    e.stopPropagation();
    toggleSelect(value);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        contentRef.current &&
        !contentRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`relative w-full ${className}`} {...props}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full min-h-10 px-3 py-2 flex items-center gap-1.5 flex-wrap rounded-md border ${
          error ? "border-destructive" : "border-muted"
        } bg-card text-sm text-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${triggerClassName}`}
      >
        <div className="flex flex-wrap gap-1 flex-grow">
          {selected.length > 0 ? (
            selected.map((value) => {
              const label =
                normalizedOptions.find((o) => o.value === value)?.label ||
                value;
              return (
                <span
                  key={value}
                  className="bg-muted text-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1 max-h-6"
                >
                  {label}
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => removeSelected(value, e)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") removeSelected(value, e);
                    }}
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown size={16} className="opacity-50 shrink-0" />
      </button>

      {open && (
        <div
          ref={contentRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 mt-1 w-full rounded-md border border-muted bg-popover shadow-md max-h-60 overflow-hidden animate-in fade-in-0 slide-in-from-top-1 ${contentClassName}`}
        >
          <input
            type="search"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full px-3 py-2 text-sm border-b border-muted outline-none text-foreground bg-popover placeholder:text-muted-foreground"
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground select-none">
                {emptyPlaceholder}
              </p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => toggleSelect(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleSelect(option.value);
                      }
                    }}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-2 text-sm ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected && <Check size={16} />}
                    <span>{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
