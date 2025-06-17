import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

const NavigationCard = ({
  navItems,
  selectedSection,
  setSelectedSection,
  hasUnsavedChanges,
  hasMissingRequired,
}) => {
  const renderNavItem = (item) => {
    const hasChanges = hasUnsavedChanges(item.id);
    const hasErrors = hasMissingRequired(item.id);

    return (
      <Button
        key={item.id}
        variant="ghost"
        onClick={() => setSelectedSection(item.id)}
        className={clsx(
          'relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-md sm:text-lg font-medium',
          selectedSection === item.id
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted/50 text-muted-foreground hover:text-primary',
          hasErrors && 'text-red-600'
        )}
      >
        {item.icon}
        <span>{item.label}</span>

        {hasChanges && !hasErrors && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
        )}
        {hasErrors && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
        )}
      </Button>
    );
  };

  return (
    <div className="sticky top-20 z-30 bg-background">
      <Card className="bg-muted/50 border-none shadow-sm px-2 py-3 rounded-lg">
        <div className="flex flex-wrap justify-between sm:justify-center gap-1 sm:gap-2">
          {navItems.map(renderNavItem)}
        </div>
      </Card>
    </div>
  );
};

export default NavigationCard;
