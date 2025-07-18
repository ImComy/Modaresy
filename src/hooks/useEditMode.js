import { useState } from 'react';

export default function useEditMode({ onSaveCallback } = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setHasChanges(false); 
  };

  const markDirty = () => {
    if (!hasChanges) setHasChanges(true);
  };

  const saveChanges = () => {
    if (onSaveCallback && typeof onSaveCallback === 'function') {
      onSaveCallback(); 
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  return {
    isEditing,
    hasChanges,
    startEditing,
    cancelEditing,
    saveChanges,
    markDirty,
  };
}
