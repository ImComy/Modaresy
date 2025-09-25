import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js'

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

// ... (unchanged SelectTrigger, SelectScrollUpButton, SelectScrollDownButton, SelectLabel, SelectItem, SelectSeparator)
const SelectTrigger = React.forwardRef(({ className, children, error, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-colors',
        isRTL && 'flex-row-reverse text-right [&>span]:text-right',
        error && 'border-destructive focus:ring-destructive',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('py-1.5 px-3 text-sm font-semibold', isRTL && 'text-right', className)}
      {...props}
    />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors hover:bg-accent/50',
        isRTL ? 'pl-8 pr-2 text-right' : 'pr-8 pl-2 text-left',
        className
      )}
      {...props}
    >
      <span className={cn('absolute flex h-3.5 w-3.5 items-center justify-center', isRTL ? 'left-2' : 'right-2')}>
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/**
 * Arabic / general normalization helpers
 * - remove diacritics (tashkeel)
 * - normalize alef variations to ا
 * - normalize ye/aa variations
 * - remove tatweel, punctuation, extra spaces
 * - strip leading conjunction و if it's attached (helpful for Arabic searches)
 * - light stemming: remove trailing ة and map ى->ي, replace final ية -> ي
 */
function normalizeTextForSearch(input = '') {
  if (!input) return '';

  let s = String(input).trim().toLowerCase();

  // Remove tatweel
  s = s.replace(/ـ/g, '');

  // Remove Arabic diacritics (tashkeel)
  s = s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

  // Normalize alef variants to ا
  s = s.replace(/[إأآا]/g, 'ا');

  // Normalize hamza variations
  s = s.replace(/[ؤئ]/g, 'ء');

  // normalize ya and alef maqsura
  s = s.replace(/ى/g, 'ي');

  // normalize taa marbuta -> ه or ت? convert to ه to allow matches; we'll also strip final ة when tokenizing
  s = s.replace(/ة/g, 'ه');

  // Remove punctuation and separators and multiple spaces, hyphens, underscores, slashes
  s = s.replace(/[-_.,/\\(){}\[\]@#$%^&*+=~`"'؟،؛:<>…]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function tokenizeForSearch(normalized) {
  if (!normalized) return [];
  // split on spaces
  const rawTokens = normalized.split(' ').filter(Boolean);

  // strip attached leading conjunction 'و' if it looks glued: e.g., 'وطني' -> 'وطني' and also 'وطني' -> 'وطني' but often it's okay to also consider token without 'و'
  const tokens = rawTokens.flatMap(tok => {
    const variants = new Set();
    variants.add(tok);

    // strip leading و if word length > 2 (to avoid single letter)
    if (tok.length > 2 && tok.startsWith('و')) {
      variants.add(tok.slice(1));
    }

    // remove final ه that came from ة normalization to match both forms (العربي / العربية)
    if (tok.length > 2 && tok.endsWith('ه')) {
      variants.add(tok.slice(0, -1));
    }

    // collapse duplicates
    return Array.from(variants);
  });

  // unique tokens
  return Array.from(new Set(tokens));
}

const SearchableSelectContent = React.forwardRef(
  ({ className, items = [], position = 'popper', searchPlaceholder = 'Search...', ...props }, ref) => {
    const { i18n, t } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);

    // Preprocess items into normalized form & tokens for robust matching
    const normalizedItems = useMemo(() => {
      return items.map((it) => {
        const label = (it.label ?? '').toString();
        const normLabel = normalizeTextForSearch(label);
        const tokens = tokenizeForSearch(normLabel);
        // also create a "sorted tokens" string so order-insensitive exact-ish matches are easy
        const sortedTokensKey = tokens.slice().sort().join(' ');
        return {
          ...it,
          _normLabel: normLabel,
          _tokens: tokens,
          _sortedTokensKey: sortedTokensKey,
        };
      });
    }, [items]);

    // Fuse config: search across normalized label and tokens, prefer exact token matches first
    const fuse = useMemo(() => {
      return new Fuse(normalizedItems, {
        keys: [
          { name: '_tokens', weight: 0.9 },
          { name: '_normLabel', weight: 0.7 },
          { name: 'label', weight: 0.5 },
        ],
        includeScore: true,
        includeMatches: true,
        threshold: 0.45, // tuneable: smaller = stricter
        ignoreLocation: true,
        minMatchCharLength: 1,
      });
    }, [normalizedItems]);

    // Compute filtered items:
    const filteredItems = useMemo(() => {
      const selectedValue = props?.value;
      if (!search || search.trim() === '') {
        // include the selected item first if it isn't in the list
        let results = normalizedItems;
        if (
          selectedValue &&
          !results.some((item) => item.value === selectedValue)
        ) {
          const found = items.find((item) => item.value === selectedValue);
          if (found) results = [found, ...results];
        }
        return results;
      }

      // Normalize query and tokenise
      const normalizedQuery = normalizeTextForSearch(search);
      const queryTokens = tokenizeForSearch(normalizedQuery);

      // 1) Use Fuse for fuzzy matching
      const fuseResults = fuse.search(normalizedQuery).map(r => ({ item: r.item, score: r.score }));

      // 2) Boost/filter to require that every query token appears somewhere in the item's normalized tokens or normLabel (handles out-of-order tokens)
      const strictFiltered = fuseResults.filter(({ item }) => {
        return queryTokens.every(qt => {
          // exact token included in tokens
          if (item._tokens.some(tok => tok.includes(qt))) return true;
          // or token as substring of the normalized label
          if (item._normLabel.includes(qt)) return true;
          // or the sortedTokensKey contains qt
          if (item._sortedTokensKey.includes(qt)) return true;
          return false;
        });
      }).map(r => r.item);

      // If strictFiltered has results, use them (they're more relevant)
      let final = strictFiltered.length > 0 ? strictFiltered : fuseResults.map(r => r.item);

      // Ensure selectedValue still appears first if needed
      if (
        selectedValue &&
        !final.some((item) => item.value === selectedValue)
      ) {
        const found = items.find((item) => item.value === selectedValue);
        if (found) final = [found, ...final];
      }

      // Deduplicate while preserving order
      const seen = new Set();
      final = final.filter(it => {
        if (seen.has(it.value)) return false;
        seen.add(it.value);
        return true;
      });

      return final;
    }, [search, fuse, normalizedItems, props?.value, items]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeout);
    }, [filteredItems.length]);

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          dir={isRTL ? 'rtl' : 'ltr'}
          position={position}
          side="bottom"
          align={isRTL ? 'end' : 'start'}
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'p-2 border-b flex items-center gap-2 bg-background',
              isRTL && 'flex-row-reverse'
            )}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              dir={isRTL ? 'rtl' : 'ltr'}
              className={cn('h-8 text-sm', isRTL && 'text-right')}
              placeholder={t(searchPlaceholder)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </motion.div>
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            )}
          >
            <AnimatePresence>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SelectItem value={item.value} className="hover:bg-accent/50 transition-colors">
                      {item.label}
                    </SelectItem>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('px-4 py-2 text-sm text-muted-foreground', isRTL && 'text-right')}
                >
                  {t('noResultsFound', 'No results found')}
                </motion.div>
              )}
            </AnimatePresence>
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);
SearchableSelectContent.displayName = 'SearchableSelectContent';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SearchableSelectContent,
};
