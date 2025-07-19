import { tutorService, validationService } from '../services/apiService';

// Fetch tutor data by ID
export const getTutorData = async (id, toast, t, navigate) => {
  try {
    const tutor = await tutorService.getTutor(id);
    if (!tutor) {
      throw new Error('Tutor not found');
    }
    return tutor;
  } catch (error) {
    toast({
      title: t('error'),
      description: t('tutorNotFound'),
      variant: 'destructive',
    });
    navigate('/');
    throw error;
  }
};

// Get grade label for display
export const getGradeLabel = (grade, t) => {
  const gradeMap = {
    'Secondary 1': t('secondary1', 'Secondary 1'),
    'Secondary 2': t('secondary2', 'Secondary 2'),
    'Secondary 3': t('secondary3', 'Secondary 3'),
    'Primary 1': t('primary1', 'Primary 1'),
    'Primary 2': t('primary2', 'Primary 2'),
    'Primary 3': t('primary3', 'Primary 3'),
    'Primary 4': t('primary4', 'Primary 4'),
    'Primary 5': t('primary5', 'Primary 5'),
    'Primary 6': t('primary6', 'Primary 6'),
    'Preparatory 1': t('preparatory1', 'Preparatory 1'),
    'Preparatory 2': t('preparatory2', 'Preparatory 2'),
    'Preparatory 3': t('preparatory3', 'Preparatory 3'),
    'KG': t('kg', 'KG'),
    'University': t('university', 'University'),
    'Other': t('other', 'Other'),
  };
  return gradeMap[grade] || grade;
};

// Calculate maximum years of experience
export const getMaxYearsExp = (subjects) => {
  return subjects?.reduce((max, subj) => Math.max(max, subj.yearsExp || 0), 0) || 0;
};

// Calculate average rating
export const getAverageRating = (subjects) => {
  const ratings = subjects?.map((s) => s.rating).filter((r) => typeof r === 'number') || [];
  const avg = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
  return ratings.length ? avg.toFixed(1) : null;
};

// Fetch education structure for validation or dropdowns
export const fetchEducationStructure = async (educationSystem, toast, t) => {
  try {
    const structure = await validationService.getEducationStructure(educationSystem);
    return structure;
  } catch (error) {
    toast({
      title: t('error'),
      description: t('educationStructureFetchError'),
      variant: 'destructive',
    });
    throw error;
  }
};

// Handle subject field changes
export const handleSubjectChange = (field, value, subjectIndex, setTutor, markDirty) => {
  if (!setTutor || typeof subjectIndex !== 'number') return;

  setTutor((prev) => {
    const updatedSubjects = [...(prev.subject_profiles || [])];
    updatedSubjects[subjectIndex] = {
      ...updatedSubjects[subjectIndex],
      [field]: value,
    };
    return {
      ...prev,
      subject_profiles: updatedSubjects,
    };
  });

  if (markDirty) markDirty();
};