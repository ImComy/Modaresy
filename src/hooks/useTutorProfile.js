import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import useEditMode from '@/hooks/useEditMode';
import { apiFetch } from '../api/apiService';

const useTutorProfile = (propTutorId, externalEditing = null) => {
  console.log('useTutorProfile initialized with:', { propTutorId, externalEditing });
  
  // Router hooks
  const params = useParams();
  const { tutorId: routeTutorId } = params;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth context
  const { authState } = useAuth();
  
  // State management
  const id = propTutorId ?? routeTutorId;
  const [tutor, setTutor] = useState(null);
  const [originalTutor, setOriginalTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [subjectProfiles, setSubjectProfiles] = useState([]);
  
  // Derived state
  const isOwner = authState.isLoggedIn && authState.userId === String(id);

    // Data fetching
  const fetchTutorData = useCallback(async (tutorId) => {
    console.log('Fetching tutor data for ID:', tutorId);
    if (!tutorId || typeof tutorId !== 'string') {
      console.error('Invalid tutorId:', tutorId);
      toast({
        title: 'Error',
        description: 'Invalid tutor ID',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      
      // Parallel fetching for better performance
      const [tutorData, profilesResponse] = await Promise.all([
        apiFetch(`/tutors/loadTutor/${tutorId}`),
        apiFetch(`/tutors/loadSubjectProfiles/${tutorId}`)
      ]);

      if (!tutorData || tutorData.error) {
        throw new Error(tutorData?.error || 'Tutor not found');
      }

      console.log('Received tutor data:', tutorData);
      console.log('Received subject profiles:', profilesResponse);

      const profiles = Array.isArray(profilesResponse) ? profilesResponse : [];
      let reviewsData = { reviews: [] };

      // Only fetch reviews if there are subject profiles
      if (profiles.length > 0 && profiles[0]?._id) {
        reviewsData = await apiFetch(`/tutors/loadTutorReviews/${profiles[0]._id}`);
        console.log('Received reviews data:', reviewsData);
      }

      setSubjectProfiles(profiles);
      setReviews(reviewsData.reviews || []);
      
      const combinedData = {
        ...tutorData,
        subject_profiles: profiles,
        reviews: reviewsData.reviews || [],
        about_me: tutorData.about_me || tutorData.GeneralBio || '',
      };
      
      setTutor(combinedData);
      setOriginalTutor(structuredClone(combinedData));

      // Handle subject selection from URL params
      handleSubjectSelectionFromURL(profiles);
    } catch (error) {
      console.error('Error in fetchTutorData:', error);
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
      console.log('Attempting to save tutor profile:', updatedData);
      try {
          const payload = {
              updated_information: {
                  ...updatedData,

                  subject_profiles: undefined
              },
              subject_operations: []
          };

          // Compare with original data to determine operations
          const originalSubjectIds = originalTutor?.subject_profiles?.map(s => s._id) || [];
          const updatedSubjectIds = updatedData.subject_profiles?.map(s => s._id) || [];

          // Determine added subjects
          updatedData.subject_profiles?.forEach(subject => {
              if (!subject._id || !originalSubjectIds.includes(subject._id)) {
                  payload.subject_operations.push({
                      operation: 'add',
                      data: subject
                  });
              }
          });

          // Determine updated subjects
          updatedData.subject_profiles?.forEach(subject => {
              if (subject._id && originalSubjectIds.includes(subject._id)) {
                  const originalSubject = originalTutor.subject_profiles.find(s => s._id === subject._id);
                  if (JSON.stringify(subject) !== JSON.stringify(originalSubject)) {
                      payload.subject_operations.push({
                          operation: 'update',
                          id: subject._id,
                          data: subject
                      });
                  }
              }
          });

          // Determine deleted subjects
          originalSubjectIds.forEach(id => {
              if (!updatedSubjectIds.includes(id)) {
                  payload.subject_operations.push({
                      operation: 'delete',
                      id: id
                  });
              }
          });

          console.log('Sending payload:', payload);
          const response = await apiFetch('/tutors/updateProfile', {
              method: 'PUT',
              body: JSON.stringify(payload)
          });

          if (response.error) {
              throw new Error(response.error || 'Failed to save changes');
          }

          console.log('Save successful, refreshing data');
          await fetchTutorData(tutor._id); // Refresh data
          return response.user || response;
      } catch (error) {
          console.error('Save error:', error);
          toast({
              title: 'Error',
              description: error.message || 'Failed to save changes',
              variant: 'destructive',
          });
          throw error;
      }
  }, [tutor?._id, toast, originalTutor, fetchTutorData]);

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
      console.log('Edit mode canceled, resetting to original tutor data');
      setTutor(structuredClone(originalTutor));
    },
  });

  const isEditing = externalEditing ?? internalEditing;

  const cancelEditing = useCallback(() => {
    console.log('Canceling editing mode');
    cancelEditingInternal();
    setTutor(structuredClone(originalTutor));
  }, [cancelEditingInternal, originalTutor]);

  const handleSubjectSelectionFromURL = useCallback((profiles) => {
    const urlParams = new URLSearchParams(location.search);
    const subjectParam = urlParams.get('subject');
    const gradeParam = urlParams.get('grade');
    
    if (subjectParam && gradeParam) {
      console.log('Found subject params in URL:', { subjectParam, gradeParam });
      const subjectIndex = profiles.findIndex(profile => 
        profile.subject_id?.name === subjectParam && 
        profile.subject_id?.grade === gradeParam
      );
      
      if (subjectIndex >= 0) {
        console.log('Setting selected subject index from URL:', subjectIndex);
        setSelectedSubjectIndex(subjectIndex);
      }
    }
  }, [location.search]);

  const updateSelectedSubject = useCallback(async (index) => {
    console.log('Updating selected subject to index:', index);
    if (!subjectProfiles[index]?._id) {
      console.warn('No subject profile found at index:', index);
      return;
    }
    
    try {
      setSelectedSubjectIndex(index);
      const subjectId = subjectProfiles[index]._id;
      console.log('Fetching reviews for subject ID:', subjectId);
      
      const reviewsData = await apiFetch(`/tutors/loadTutorReviews/${subjectId}`);
      console.log('Received reviews:', reviewsData);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews for this subject',
        variant: 'destructive',
      });
    }
  }, [subjectProfiles, toast]);

  // Initial data load
  useEffect(() => {
    if (id && typeof id === 'string') {
      console.log('Initial data load for tutor ID:', id);
      fetchTutorData(id);
    } else {
      console.error('Invalid tutor ID:', id);
      navigate('/');
    }
  }, [id, location.search, fetchTutorData, navigate]);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Current tutor profile state:', {
      tutor,
      isLoading,
      selectedSubjectIndex,
      isOwner,
      isEditing,
      hasChanges,
      reviewsCount: reviews.length,
      subjectProfilesCount: subjectProfiles.length
    });
  }

const addSubject = useCallback(async (newSubject) => {
  try {
    // Call backend to create SubjectProfile
    const created = await apiFetch('/tutors/addSubjectProfile', {
      method: 'POST',
      body: JSON.stringify(newSubject),
    });
    if (created && created._id) {
      // Update local state with new SubjectProfile ID
      setTutor(prev => ({
        ...prev,
        subject_profiles: [...(prev.subject_profiles || []), created._id]
      }));
      // Optionally, refetch subject profiles
      await fetchTutorData(id);
    }
  } catch (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }
}, [id, toast, fetchTutorData]);

  const updateSubject = useCallback(async (subjectId, updatedSubject) => {
    try {
      const response = await apiFetch('/tutors/updateSubject', {
        method: 'PUT',
        body: JSON.stringify({
          tutor_id: id,
          subject_id: subjectId,
          updated_subject: updatedSubject
        })
      });

      if (response.error) {
        throw new Error(response.error || 'Failed to update subject');
      }

      await fetchTutorData(id); // Refresh data
      return response;
    } catch (error) {
      console.error('Update subject error:', error);
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
      const response = await apiFetch('/tutors/deleteSubject', {
        method: 'DELETE',
        body: JSON.stringify({
          tutor_id: id,
          subject_id: subjectId
        })
      });

      if (response.error) {
        throw new Error(response.error || 'Failed to delete subject');
      }

      await fetchTutorData(id); // Refresh data
      return response;
    } catch (error) {
      console.error('Delete subject error:', error);
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
    reviews,
    subjectProfiles,
    fetchTutorData,
    addSubject,
    updateSubject,
    deleteSubject
  };
};

export default useTutorProfile;