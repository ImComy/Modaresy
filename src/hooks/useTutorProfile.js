import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import useEditMode from '@/hooks/useEditMode';
import { apiFetch } from '../api/apiService';

const useTutorProfile = (propTutorId, externalEditing = null) => {
  const params = useParams();
  const { tutorId: routeTutorId } = params;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { authState } = useAuth();
  
  const id = propTutorId ?? routeTutorId;
  const [tutor, setTutor] = useState(null);
  const [originalTutor, setOriginalTutor] = useState(null);
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
      
      // Fetch tutor data and base subjects
      const [tutorData, subjectsResponse] = await Promise.all([
        apiFetch(`/tutors/loadTutor/${tutorId}`),
        apiFetch(`/subjects/load/${tutorId}`)
      ]);

      if (!tutorData || tutorData.error) {
        throw new Error(tutorData?.error || 'Tutor not found');
      }

      // Extract base subjects from response
      const baseSubjects = subjectsResponse?.data?.baseSubjects || [];
      setSubjects(baseSubjects);

      const combinedData = {
        ...tutorData,
        subjects: baseSubjects,
        about_me: tutorData.about_me || ''
      };
      
      setTutor(combinedData);
      setOriginalTutor(structuredClone(combinedData));

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
      setTutor(structuredClone(originalTutor));
    },
  });

  const isEditing = externalEditing ?? internalEditing;

  const cancelEditing = useCallback(() => {
    cancelEditingInternal();
    setTutor(structuredClone(originalTutor));
  }, [cancelEditingInternal, originalTutor]);

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
      
      if (created && created._id) {
        await fetchTutorData(id); 
        return created;
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add subject', 
        variant: 'destructive' 
      });
      throw error;
    }
  }, [id, toast, fetchTutorData]);

  const updateSubject = useCallback(async (subjectId, updatedSubject) => {
    try {
      const response = await apiFetch(`/subjects/subjects/${subjectId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedSubject)
      });

      if (response.error) {
        throw new Error(response.error || 'Failed to update subject');
      }
      
      await fetchTutorData(id); 
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subject',
        variant: 'destructive',
      });
      throw error;
    }
  }, [id, toast, fetchTutorData]);

  const deleteSubject = useCallback(async (subjectId) => {
    try {
      const response = await apiFetch(`/subjects/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (response.error) {
        throw new Error(response.error || 'Failed to delete subject');
      }
      
      await fetchTutorData(id); 
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subject',
        variant: 'destructive',
      });
      throw error;
    }
  }, [id, toast, fetchTutorData]);


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
    deleteSubject
  };
};

export default useTutorProfile;