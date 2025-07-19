import { tutorService, studentService } from '../services/apiService';

export const saveProfileChanges = async (userType, updatedInformation, onSaveCallback, setIsEditing, setHasChanges, toast, t) => {
  try {
    const service = userType === 'Teacher' ? tutorService : studentService;
    await service.updateProfile(updatedInformation);
    if (onSaveCallback && typeof onSaveCallback === 'function') {
      onSaveCallback();
    }
    setIsEditing(false);
    setHasChanges(false);
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdateSuccess'),
    });
  } catch (error) {
    toast({
      title: t('error'),
      description: error.message || t('profileUpdateError'),
      variant: 'destructive',
    });
    throw error;
  }
};