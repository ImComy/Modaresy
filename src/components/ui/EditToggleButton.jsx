import React from 'react';
import { Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const EditToggleButton = ({ isEditing, startEditing, cancelEditing, onSave }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed top-20 right-6 z-50 flex gap-3 items-center">
      {isEditing && (
        <button
          onClick={onSave}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-md border-2 shadow-lg backdrop-blur-md transition-all duration-200',
            'bg-green-100/80 text-green-800 border-green-300 hover:bg-green-200/90'
          )}
        >
          <Check size={18} strokeWidth={2.5} />
          <span className="text-sm font-semibold">{t('save', 'Save')}</span>
        </button>
      )}

      <button
        onClick={isEditing ? cancelEditing : startEditing}
        className={cn(
          'flex items-center gap-2 px-5 py-2 rounded-md border-2 shadow-lg backdrop-blur-md transition-all duration-200',
          isEditing
            ? 'bg-red-100/70 text-red-800 border-red-300 hover:bg-red-200/80'
            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.9)]'
        )}
      >
        {isEditing ? <X size={18} strokeWidth={2.5} /> : <Pencil size={18} strokeWidth={2.5} />}
        <span className="text-sm font-semibold">
          {isEditing ? t('cancel', 'Cancel') : t('editProfile', 'Edit Profile')}
        </span>
      </button>
    </div>
  );
};

export default EditToggleButton;
