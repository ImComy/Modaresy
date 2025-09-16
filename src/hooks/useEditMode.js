import { useState, useCallback, useEffect, useRef } from 'react';

export default function useEditMode({ 
  onSaveCallback = () => {},
  onCancelCallback = () => {},
  initialData = null 
} = {}) {
  // Log init only once on mount and whenever the presence of initialData actually changes.
  // This preserves the debugging output but avoids noisy logs on every render.
  const _initialPresentRef = useRef(null);
  useEffect(() => {
    const present = !!initialData;
    if (_initialPresentRef.current === null) {
      _initialPresentRef.current = present;
      console.log('[useEditMode] init', { initialDataPresent: present });
      return;
    }

    if (_initialPresentRef.current !== present) {
      // debounce rapid toggles (common during fetch) to avoid log spam
      if (!_initialPresentRef.debounceTimer) _initialPresentRef.debounceTimer = null;
      if (_initialPresentRef.debounceTimer) clearTimeout(_initialPresentRef.debounceTimer);
      _initialPresentRef.debounceTimer = setTimeout(() => {
        _initialPresentRef.current = present;
        console.log('[useEditMode] init', { initialDataPresent: present });
        _initialPresentRef.debounceTimer = null;
      }, 50);
    }
    return () => {
      if (_initialPresentRef.debounceTimer) {
        clearTimeout(_initialPresentRef.debounceTimer);
        _initialPresentRef.debounceTimer = null;
      }
    };
  }, [initialData]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Keep originalData in a ref to avoid rerenders when storing large snapshots
  const originalDataRef = useRef(initialData);
  const [editedData, setEditedData] = useState(initialData);

  // small deep-equal helper for primitives and small objects
  const isEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a === 'object' && a != null && typeof b === 'object' && b != null) {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  // keep ref in sync with incoming initialData only when it actually changes
  // or when we're not currently editing. This avoids resetting the ref each render
  // which previously caused repeated re-initialization and re-renders.
  useEffect(() => {
    try {
      const prev = originalDataRef.current;
      const prevJson = prev === undefined ? null : JSON.stringify(prev);
      const nextJson = initialData === undefined ? null : JSON.stringify(initialData);
      if (prevJson !== nextJson) {
        originalDataRef.current = initialData;
        console.log('[useEditMode] originalDataRef synced (effect)', { hasOriginal: !!originalDataRef.current });
      }
    } catch (e) {
      // If serialization fails for some reason, fall back to direct assign once.
      originalDataRef.current = initialData;
      console.log('[useEditMode] originalDataRef synced (fallback)');
    }
  }, [initialData]);

  const startEditing = useCallback(() => {
  console.log('[useEditMode] startEditing called');
    if (!originalDataRef.current) {
      console.warn('Cannot start editing - originalData is null');
      return;
    }

    try {
      // Create a deep copy of the original data for editing
      const dataCopy = typeof structuredClone === 'function' ? structuredClone(originalDataRef.current) : JSON.parse(JSON.stringify(originalDataRef.current));
  setEditedData(dataCopy);
  console.log('[useEditMode] setEditedData (start)', { previewKeys: Object.keys(dataCopy || {}) });
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
  console.log('[useEditMode] cancelEditing called');
  setIsEditing(false);
  setHasChanges(false);
  setEditedData(originalDataRef.current);
    if (onCancelCallback) {
      onCancelCallback();
    }
  }, [onCancelCallback]);

  const updateField = useCallback((field, value) => {
    setEditedData(prev => {
      if (!prev) return prev;

      // Support functional updaters for value to enable safe concurrent updates
      const newFieldValue = (typeof value === 'function') ? value(prev[field]) : value;

      // Avoid updates when values are structurally equal
      if (isEqual(prev[field], newFieldValue)) {
        return prev;
      }

      const updated = { ...prev, [field]: newFieldValue };
      console.log('[useEditMode] updateField', { field, newFieldValue });
      // Check if the edited data differs from the original snapshot
      const changed = JSON.stringify(updated) !== JSON.stringify(originalDataRef.current);
      setHasChanges(changed);
      return updated;
    });
  }, []);

  const updateNestedField = useCallback((path, value) => {
    setEditedData(prev => {
      if (!prev) {
        console.warn('Cannot update nested field - editedData is null');
        return prev;
      }

      // Create a deep copy to avoid mutation issues.
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

      const lastKey = keys[keys.length - 1];

  // If the value is identical (structural equality), bail out early
  if (isEqual(current[lastKey], value)) return prev;

      // Set the value on the target property
      current[lastKey] = value;

      const changed = JSON.stringify(updated) !== JSON.stringify(originalDataRef.current);
      console.log('[useEditMode] updateNestedField', { path, changed });
      if (changed !== hasChanges) setHasChanges(changed);
      return updated;
    });
  }, [hasChanges]);

  const saveChanges = useCallback(async () => {
  console.log('[useEditMode] saveChanges called');
    if (!editedData) {
      console.warn('Cannot save - editedData is null');
      return false;
    }

    setIsSubmitting(true);
    try {
      if (onSaveCallback) {
  const result = await onSaveCallback(editedData);
  console.log('[useEditMode] save callback result', { ok: !!result });
        
        // Update the original data with the response from the server
        const newOriginalData = {
          ...originalDataRef.current,
          ...(result?.user || result || editedData)
        };
        
  originalDataRef.current = newOriginalData;
  console.log('[useEditMode] originalDataRef updated after save');
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
  console.log('[useEditMode] reset called');
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