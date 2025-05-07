import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const MultiSelect = ({
  options, // Array of { value: string, label: string }
  selected, // Array of selected values (strings)
  onChange, // Function called with updated array of selected values
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No options found.",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  error = false, // Added error prop
  ...props
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleSelect = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value, e) => {
    e.stopPropagation(); // Prevent popover from opening/closing
    const newSelected = selected.filter((item) => item !== value);
    onChange(newSelected);
  };

  const getLabel = (value) => {
    return options.find(option => option.value === value)?.label || value;
  };

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 px-3 py-2", // Adjusted height
            selected.length === 0 && "text-muted-foreground",
            error && "border-destructive focus:ring-destructive", // Apply error border
            triggerClassName
          )}
        >
          <div className="flex flex-wrap gap-1 flex-grow mr-2 rtl:ml-2 rtl:mr-0">
            {selected.length > 0 ? (
              selected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="py-0.5 px-1.5 text-xs"
                >
                  {getLabel(value)}
                  <button
                    aria-label={`Remove ${getLabel(value)}`}
                    onClick={(e) => handleRemove(value, e)}
                    className="ml-1 rtl:mr-1 rtl:ml-0 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(value, e);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
          className={cn("w-[--radix-popover-trigger-width] p-0", contentClassName)} // Match trigger width
          style={{ width: triggerRef.current ? `${triggerRef.current.offsetWidth}px` : 'auto' }}
          align="start" // Align start to match trigger
      >
        <Command className={className}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // Use value for filtering
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { MultiSelect };
