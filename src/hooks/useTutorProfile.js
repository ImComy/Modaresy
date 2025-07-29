import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import useEditMode from '@/hooks/useEditMode';
import { mockTutors } from '@/data/enhanced';
import { mockSchedules } from '@/data/mockSchedules';

const getTutorData = (id) => {
  const numericId = Number(id);
  const baseTutor = mockTutors.find(t => String(t.id) === String(id) || t.id === numericId);
  if (!baseTutor) return null;
  return {
    ...baseTutor,
    subjects: baseTutor.subjects || [],
    schedule: mockSchedules.find(s => s.tutorId === numericId)?.schedule || [],
  };
};

const useTutorProfile = (propTutorId, externalEditing = null) => {
  const params = useParams();
  const id = propTutorId ?? params.id;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [originalTutor, setOriginalTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

<<<<<<< HEAD
  const isOwner = authState.isLoggedIn && authState.userId === parseInt(id);
=======
  const isOwner = authState.isLoggedIn && authState.userId === String(id);
>>>>>>> f48463cd3ab1f4179ef06b1c676d9ab31a295f09

  const {
    isEditing: internalEditing,
    startEditing,
    cancelEditing: cancelEditingInternal,
    saveChanges,
    markDirty,
    hasChanges,
  } = useEditMode({
    onSaveCallback: () => {
      try {
        setOriginalTutor(structuredClone(tutor));
        toast({
          title: 'Success',
          description: 'Changes saved successfully',
        });
      } catch (error) {
        console.error('Error saving changes:', error);
        toast({
          title: 'Error',
          description: 'Failed to save changes',
          variant: 'destructive',
        });
        throw error;
      }
    },
    onCancelCallback: () => {
      setTutor(structuredClone(originalTutor));
    },
  });

  const isEditing = externalEditing ?? internalEditing;

  const cancelEditing = () => {
    cancelEditingInternal();
    setTutor(structuredClone(originalTutor));
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = getTutorData(id);
      if (data) {
        setTutor(data);
        setOriginalTutor(structuredClone(data));

        const params = new URLSearchParams(location.search);
        const filterSubject = params.get('subject');
        const filterGrade = params.get('grade');
        const index = data.subjects.findIndex(
          s => s.subject === filterSubject && s.grade === filterGrade
        );
        setSelectedSubjectIndex(index >= 0 ? index : 0);
      } else {
        navigate('/');
        toast({
          title: 'Error',
          description: 'Tutor not found',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id, navigate, toast, location.search]);

  return {
    tutor,
    setTutor,
    isLoading,
    selectedSubjectIndex,
    setSelectedSubjectIndex,
    isOwner,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    markDirty,
    hasChanges,
  };
};

export default useTutorProfile;
