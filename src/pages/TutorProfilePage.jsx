import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import EditToggleButton from '@/components/ui/EditToggleButton';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import SubjectSelector from '@/components/profile/subjectSelector';
import useTutorProfile from '@/hooks/useTutorProfile';
import useEditMode from '@/hooks/useEditMode';
import { apiFetch } from '@/api/apiService';

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  const { t } = useTranslation();

  const {
    tutor,
    isLoading,
    isOwner,
    subjects,
    fetchTutorData,
    addSubject: addSubjectToBackend,
    updateSubject: updateSubjectInBackend,
    deleteSubject: deleteSubjectFromBackend,
    updateSubjectProfile,
    deleteSubjectProfile,
  } = useTutorProfile(propTutorId, externalEditing);

  const {
    isEditing,
    hasChanges,
    editedData,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    reset,
    isSubmitting
  } = useEditMode({
    initialData: tutor,
    onSaveCallback: async (updatedData) => {
      try {
        const originalSubjects = tutor?.subjects || [];
        const updatedSubjects = updatedData.subjects || [];

        const originalSubjectIds = new Set(originalSubjects.map(s => s._id));
        const updatedSubjectIds = new Set(updatedSubjects.map(s => s._id).filter(id => id));

        const addedSubjects = updatedSubjects.filter(s => !s._id);
        const deletedSubjectIds = originalSubjects.filter(s => !updatedSubjectIds.has(s._id)).map(s => s._id);
        const existingSubjectsToUpdate = updatedSubjects.filter(s => s._id && originalSubjectIds.has(s._id));

        const promises = [];

        addedSubjects.forEach(subject => {
          promises.push(addSubjectToBackend(subject));
        });

        deletedSubjectIds.forEach(subjectId => {
          promises.push(deleteSubjectFromBackend(subjectId));
        });

        existingSubjectsToUpdate.forEach(subject => {
          const { profileId, ...coreData } = subject;
          const { name, grade, education_system, language, sector, years_experience, ...profileData } = coreData;

          ['group_pricing', 'private_pricing'].forEach(key => {
            if (profileData[key]?.offer?.percentage) {
              profileData[key].offer.percentage = Number(profileData[key].offer.percentage);
            }
          });
          
          if (profileData.additional_pricing) {
            profileData.additional_pricing = profileData.additional_pricing.map(item => ({
              ...item,
              offer: item.offer ? {
                ...item.offer,
                percentage: Number(item.offer.percentage) || 0
              } : null
            }));
          }
          
          const coreFields = { name, grade, education_system, language, sector, years_experience };

          promises.push(updateSubjectInBackend(subject._id, coreFields));

          if (profileId) {
            const profileFields = Object.keys(profileData).reduce((acc, key) => {
              if (!['subjects', '_id', 'tutor_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
                acc[key] = profileData[key];
              }
              return acc;
            }, {});
            promises.push(updateSubjectProfile(profileId, profileFields));
          }
        });

        const tutorProfileData = { ...updatedData };
        delete tutorProfileData.subjects;
        promises.push(apiFetch('/tutors/updateProfile', {
          method: 'PUT',
          body: JSON.stringify({ updated_information: tutorProfileData })
        }));

        await Promise.all(promises);

        await fetchTutorData(tutor._id);
        return { success: true };

      } catch (error) {
        console.error('Error updating tutor profile:', error);
        throw error;
      }
    },
    onCancelCallback: () => reset()
  });

  const addSubject = (newSubject) => {
    const updatedSubjects = [...(editedData?.subjects || []), { ...newSubject, tempId: Date.now() }];
    updateField('subjects', updatedSubjects);
  };

  const updateSubject = (index, subjectData) => {
    const updatedSubjects = [...(editedData?.subjects || [])];
    if (index < 0 || index >= updatedSubjects.length) return;
    
    updatedSubjects[index] = { ...updatedSubjects[index], ...subjectData };
    updateField('subjects', updatedSubjects);
  };

  const removeSubject = (index) => {
    const subjectsToDelete = editedData?.subjects || [];
    if (index < 0 || index >= subjectsToDelete.length) return;

    const updatedSubjects = subjectsToDelete.filter((_, i) => i !== index);
    updateField('subjects', updatedSubjects);
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!hasChanges) return;
    try {
      await saveChanges();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent border-primary"></span>
        <span className="ml-2">{t('loading')}...</span>
      </div>
    );
  }

  if (!tutor) {
    return <div className="text-center py-10">{t('tutorNotFound')}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <form onSubmit={handleSubmit}>
        {isOwner && (
          <EditToggleButton
            isEditing={isEditing}
            isSaving={isSubmitting}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            onSave={saveChanges} 
          />
        )}

        <TutorProfileHeader
          tutor={isEditing ? editedData : tutor}
          onChange={updateField}
          onAddSubject={addSubject}
          onUpdateSubject={updateSubject}
          onDeleteSubject={removeSubject}
          isEditing={isEditing}
          isOwner={isOwner}
        />

        <SubjectSelector
          tutor={isEditing ? editedData : tutor}
          subjects={isEditing && editedData?.subjects ? editedData.subjects : (subjects || [])}
          isEditing={isEditing}
          isOwner={isOwner}
          onUpdateSubject={updateSubject}
          onDeleteSubject={removeSubject}
          onTutorChange={updateField}
          onReviewUpdate={() => fetchTutorData(tutor._id)}
        />
      </form>
    </motion.div>
  );
};

export default TutorProfilePage;
