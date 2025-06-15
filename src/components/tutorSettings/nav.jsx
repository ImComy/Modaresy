import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

const NavigationCard = ({ navItems, selectedSection, setSelectedSection, hasUnsavedChanges, hasMissingRequired }) => {
  const renderNavItem = (item) => {
    const hasChanges = hasUnsavedChanges(item.id);
    const hasErrors = hasMissingRequired(item.id);

    return (
      <Button
        key={item.id}
        variant={selectedSection === item.id ? 'default' : 'ghost'}
        onClick={() => setSelectedSection(item.id)}
        className={clsx(
          'w-full justify-between relative group',
          hasErrors && 'text-red-600'
        )}
      >
        <span>{item.label}</span>
        {hasChanges && !hasErrors && (
          <span className="w-2 h-2 bg-yellow-500 rounded-full absolute right-3 top-2" />
        )}
        {hasErrors && (
          <span className="w-2 h-2 bg-red-600 rounded-full absolute right-3 top-2 animate-ping" />
        )}
      </Button>
    );
  };

  return (
    <div className="order-1 lg:order-2 space-y-4 lg:sticky lg:top-24 h-fit">
      <Card className="bg-muted/40 border">
        <CardHeader>
          <CardTitle className="text-lg">Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {navItems.map(renderNavItem)}
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationCard;