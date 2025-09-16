import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/api/apiService';
import useEditMode from './useEditMode';

const useTutorProfile = (propTutorId, externalEditing = null) => {
  const params = useParams();
  const { tutorId: routeTutorId } = params;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { authState } = useAuth();
  
  const id = propTutorId ?? routeTutorId;
  const [tutor, setTutor] = useState(null);
  const originalTutorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [subjects, setSubjects] = useState([]);

  const isOwner = authState.isLoggedIn && authState.userId === String(id);

  // Data fetching
  const fetchTutorData = useCallback(async (tutorId) => {
    if (!tutorId || typeof tutorId !== 'string') {
      toast({ title: 'Error', description: 'Invalid tutor ID', variant: 'destructive' });
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch tutor data and subjects
      const [tutorData, subjectsResponse] = await Promise.all([
        apiFetch(`/tutors/loadTutor/${tutorId}`),
        apiFetch(`/subjects/load/${tutorId}`)
      ]);

      if (!tutorData || tutorData.error) {
        throw new Error(tutorData.error || 'Failed to load tutor data');
      }

      // Extract and transform subjects data
      const baseSubjects = subjectsResponse?.data?.baseSubjects || [];
      const subjectProfiles = subjectsResponse?.data?.subjectProfiles || [];
      
      const profileMap = new Map();
      subjectProfiles.forEach(profile => {
        if (profile.subject_id?._id) {
          profileMap.set(profile.subject_id._id.toString(), profile);
        }
      });

      // Merge base subjects with their profiles
      const mergedSubjects = baseSubjects.map(subject => {
        const profile = profileMap.get(subject._id.toString());
        return {
          ...subject,
          ...(profile || {}), // Merge profile data
          profileId: profile?._id, // Keep a distinct profileId
          _id: subject._id // Ensure base subject ID is the main _id
        };
      });

      const combinedData = {
        ...tutorData,
        subjects: mergedSubjects,
        about_me: tutorData.about_me || '',
        availability: tutorData.availability || null
      };
      
  setTutor(combinedData);
  originalTutorRef.current = structuredClone(combinedData);
      setSubjects(mergedSubjects);  // Set subjects to merged array

      // Handle subject selection from URL params
      handleSubjectSelectionFromURL(baseSubjects);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tutor data',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [location.search, navigate, toast]);

  const handleSave = useCallback(async (updatedData) => {
    try {
      await apiFetch('/tutors/updateProfile', {
        method: 'PUT',
        body: JSON.stringify({
          ...updatedData,
          subjects: undefined
        })
      });
      
      await fetchTutorData(id); 
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
      throw error;
    }
  }, [id, toast, fetchTutorData]);

  // Edit mode management
  const {
    isEditing: internalEditing,
    startEditing,
    cancelEditing: cancelEditingInternal,
    saveChanges,
    markDirty,
    hasChanges,
  } = useEditMode({
    onSaveCallback: handleSave,
    onCancelCallback: () => {
  setTutor(structuredClone(originalTutorRef.current));
    },
  });

  const isEditing = externalEditing ?? internalEditing;

  const cancelEditing = useCallback(() => {
    cancelEditingInternal();
    setTutor(structuredClone(originalTutorRef.current));
  }, [cancelEditingInternal]);

  const handleSubjectSelectionFromURL = useCallback((subjects) => {
    const urlParams = new URLSearchParams(location.search);
    const subjectParam = urlParams.get('subject');
    const gradeParam = urlParams.get('grade');
    
    if (subjectParam && gradeParam) {
      const subjectIndex = subjects.findIndex(subject => 
        subject.name === subjectParam && 
        subject.grade === gradeParam
      );
      
      if (subjectIndex >= 0) {
        setSelectedSubjectIndex(subjectIndex);
      }
    }
  }, [location.search]);

  const updateSelectedSubject = useCallback((index) => {
    setSelectedSubjectIndex(index);
  }, []);

  // Initial data load
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchTutorData(id);
    } else {
      navigate('/');
    }
  }, [id, location.search, fetchTutorData, navigate]);

  // Subject CRUD operations
  const addSubject = useCallback(async (subjectData) => {
    try {
      const created = await apiFetch('/subjects/subjects', {
        method: 'POST',
        body: JSON.stringify(subjectData),
      });
      if (created.error) throw new Error(created.error);
      return created;
    } catch (error) {
      toast({ title: 'Error', description: `Failed to add subject: ${error.message}`, variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  const updateSubject = useCallback(async (subjectId, updatedSubject) => {
    try {
      const response = await apiFetch(`/subjects/subjects/${subjectId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedSubject)
      });
      if (response.error) throw new Error(response.error);
      return response;
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update subject: ${error.message}`, variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  const deleteSubject = useCallback(async (subjectId) => {
    try {
      const response = await apiFetch(`/subjects/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      // If apiFetch returns null/undefined (common for 204 No Content), treat as success.
      // If it returns an object, check for .error.
      if (!response) {
        // update local state immediately so UI shows the deletion
        setSubjects(prev => {
          const next = prev.filter(s => String(s._id) !== String(subjectId));
          // clamp selected index
          setSelectedSubjectIndex(idx => {
            const newIdx = Math.max(0, Math.min(idx, Math.max(0, next.length - 1)));
            return newIdx;
          });
          return next;
        });

        setTutor(prev => {
          if (!prev) return prev;
          const nextTutor = { ...prev, subjects: (prev.subjects || []).filter(s => String(s._id) !== String(subjectId)) };
          originalTutorRef.current = structuredClone(nextTutor);
          return nextTutor;
        });

        // mark as dirty in edit-mode (if appropriate)
        try { markDirty(); } catch (e) { /* ignore if markDirty not available */ }

        return { success: true };
      }

      // If response present, check for error
      if (response.error) {
        throw new Error(response.error);
      }

      // successful JSON response path - also update local state
      setSubjects(prev => {
        const next = prev.filter(s => String(s._id) !== String(subjectId));
        setSelectedSubjectIndex(idx => Math.max(0, Math.min(idx, Math.max(0, next.length - 1))));
        return next;
      });

      setTutor(prev => {
        if (!prev) return prev;
        const nextTutor = { ...prev, subjects: (prev.subjects || []).filter(s => String(s._id) !== String(subjectId)) };
        originalTutorRef.current = structuredClone(nextTutor);
        return nextTutor;
      });

      try { markDirty(); } catch (e) {}

      return { success: true };
    } catch (error) {
      toast({ title: 'Error', description: `Failed to delete subject: ${error.message}`, variant: 'destructive' });
      throw error;
    }
  }, [toast, markDirty]);

  const updateSubjectProfile = useCallback(async (profileId, updateData) => {
    try {
      const response = await apiFetch(`/subjects/profiles/${profileId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (response.error) throw new Error(response.error);
      return response;
    } catch (error) {
      toast({ title: 'Error', description: `Failed to update subject profile: ${error.message}`, variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  const deleteSubjectProfile = useCallback(async (profileId) => {
    try {
      const response = await apiFetch(`/subjects/profiles/${profileId}`, {
        method: 'DELETE',
      });
      if (response.error && response.status !== 204) throw new Error(response.error);
      return { success: true };
    } catch (error) {
      toast({ title: 'Error', description: `Failed to delete subject profile: ${error.message}`, variant: 'destructive' });
      throw error;
    }
  }, [toast]);


  return {
    tutor,
    setTutor,
    isLoading,
    selectedSubjectIndex,
    setSelectedSubjectIndex: updateSelectedSubject,
    isOwner,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    markDirty,
    hasChanges,
    subjects,
    fetchTutorData,
    addSubject,
    updateSubject,
    deleteSubject,
    updateSubjectProfile,
    deleteSubjectProfile
  };
};

export default useTutorProfile;