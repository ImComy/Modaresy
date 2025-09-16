import { useState, useCallback, useEffect, useRef } from 'react';

export default function useEditMode({ 
  onSaveCallback = () => {},
  onCancelCallback = () => {},
  initialData = null 
} = {}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Keep originalData in a ref to avoid rerenders when storing large snapshots
  const originalDataRef = useRef(initialData);
  const [editedData, setEditedData] = useState(initialData);

  // Update internal state when initialData changes
  useEffect(() => {
    try {
      const changed = JSON.stringify(initialData) !== JSON.stringify(originalDataRef.current);
      if (initialData && changed) {
        console.log('Initial data updated, resetting state');
        originalDataRef.current = initialData;
        setEditedData(initialData);
        setHasChanges(false);
      }
    } catch (e) {
      // fallback conservative update
      originalDataRef.current = initialData;
      setEditedData(initialData);
      setHasChanges(false);
    }
  }, [initialData]);

  const startEditing = useCallback(() => {
    console.log('Starting editing mode');
    if (!originalDataRef.current) {
      console.warn('Cannot start editing - originalData is null');
      return;
    }

    try {
      // Create a deep copy of the original data for editing
      const dataCopy = typeof structuredClone === 'function' ? structuredClone(originalDataRef.current) : JSON.parse(JSON.stringify(originalDataRef.current));
      setEditedData(dataCopy);
      setIsEditing(true);
      setHasChanges(false);
      console.log('Editing started with data copy:', dataCopy);
    } catch (error) {
      console.error('Error starting edit mode:', error);
      setEditedData(originalDataRef.current);
      setIsEditing(true);
      setHasChanges(false);
    }
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setHasChanges(false);
    setEditedData(originalDataRef.current);
    if (onCancelCallback) {
      onCancelCallback();
    }
  }, [onCancelCallback]);

  const updateField = useCallback((field, value) => {
    setEditedData(prev => {
      if (!prev) {
        return prev;
      }

      // Support functional updaters for value to enable safe concurrent updates
      const newFieldValue = (typeof value === 'function') ? value(prev[field]) : value;

      const updated = { ...prev, [field]: newFieldValue };
      // Check if the value actually changed
    const changed = JSON.stringify(updated) !== JSON.stringify(originalDataRef.current);
      if (changed !== hasChanges) {
        setHasChanges(changed);
      }
      return updated;
    });
  }, [hasChanges]);

  const updateNestedField = useCallback((path, value) => {
    setEditedData(prev => {
      if (!prev) {
        console.warn('Cannot update nested field - editedData is null');
        return prev;
      }

      // Create a deep copy to avoid mutation issues.
      // This is simpler and safer than manual traversal with shallow copies.
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      
      const keys = path.split('.');
      
      // Traverse to the parent of the target property
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || current[key] === null) {
          console.warn(`Path ${path} not found in data structure at key: ${key}`);
          return prev; // Return original state if path is broken
        }
        current = current[key];
      }
      
      // Set the value on the target property
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      
    const changed = JSON.stringify(updated) !== JSON.stringify(originalDataRef.current);
      if (changed !== hasChanges) {
        setHasChanges(changed);
      }
      return updated;
    });
  }, [hasChanges]);

  const saveChanges = useCallback(async () => {
    if (!editedData) {
      console.warn('Cannot save - editedData is null');
      return false;
    }

    setIsSubmitting(true);
    try {
      if (onSaveCallback) {
        const result = await onSaveCallback(editedData);
        console.log('Save successful, result:', result);
        
        // Update the original data with the response from the server
        const newOriginalData = {
          ...originalDataRef.current,
          ...(result?.user || result || editedData)
        };
        
        originalDataRef.current = newOriginalData;
        setIsEditing(false);
        setHasChanges(false);
        console.log('Edit mode closed after successful save');
        return true;
      }
      console.warn('No save callback provided');
      return false;
    } catch (error) {
      console.error('Error saving changes:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [editedData, onSaveCallback]);

  const reset = useCallback(() => {
    console.log('Resetting edited data to original');
  setEditedData(originalDataRef.current);
    setHasChanges(false);
  }, []);

  return {
    isEditing,
    isSubmitting,
    hasChanges,
    editedData,
  originalDataRef: originalDataRef.current,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    updateNestedField,
    markDirty: () => {
      console.log('Manually marking as dirty');
      setHasChanges(true);
    },
    reset,
    setEditedData: (data) => {
      console.log('Directly setting edited data:', data);
      setEditedData(data);
      const changed = JSON.stringify(data) !== JSON.stringify(originalDataRef.current);
      setHasChanges(changed);
    }
  };
}