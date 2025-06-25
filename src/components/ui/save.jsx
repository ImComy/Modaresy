import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SaveButton = ({
  isLoading = false,
  label = 'Save Changes',
  type = 'submit', // for forms
  onClick,
  className,
}) => {
  return (
    <div className="pt-6 flex justify-start">
      <Button
        type={type}
        onClick={onClick}
        disabled={isLoading}
        className={cn(
          'gap-2 px-6 py-2 text-sm font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400',
          className
        )}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
};

export default SaveButton;
