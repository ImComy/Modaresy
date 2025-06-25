import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

const NavigationCard = ({
  navItems,
  selectedSection,
  setSelectedSection,
  handleSubmit,
}) => {
  const handleNavClick = (id) => {
    handleSubmit(); // Trigger save before changing section
    setSelectedSection(id);
  };

  const renderNavItem = (item) => {
    return (
      <Button
        key={item.id}
        variant="ghost"
        onClick={() => handleNavClick(item.id)}
        className={clsx(
          'relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-md sm:text-lg font-medium',
          selectedSection === item.id
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted/50 text-muted-foreground hover:text-primary'
        )}
      >
        {item.icon}
        <span>{item.label}</span>
      </Button>
    );
  };

  return (
    <div className="sticky top-20 z-30 bg-background rounded-lg">
      <Card className="bg-muted/50 border-none shadow-sm px-2 py-3 rounded-lg">
        <div className="flex flex-wrap justify-between sm:justify-center gap-1 sm:gap-2">
          {navItems.map(renderNavItem)}
        </div>
      </Card>
    </div>
  );
};

export default NavigationCard;