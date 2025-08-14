import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import EditToggleButton from '@/components/ui/EditToggleButton';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import SubjectSelector from '@/components/profile/subjectSelector';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorGroupsCard from '@/components/profile/TutorScheduleDisplay';
import TutorReviews from '@/components/profile/TutorReviews';
import useTutorProfile from '@/hooks/useTutorProfile';
import { Button } from '@/components/ui/button';
import useEditMode from '@/hooks/useEditMode';
import { API_BASE, apiFetch } from '@/api/apiService';

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  const { t } = useTranslation();
  
  const {
    tutor,
    isLoading,
    selectedSubjectIndex,
    setSelectedSubjectIndex,
    isOwner,
    subjects,
    reviews,
    fetchTutorData,
    addSubject: addSubjectToBackend,
    updateSubject: updateSubjectInBackend,
    deleteSubject: deleteSubjectFromBackend
  } = useTutorProfile(propTutorId, externalEditing);

  const {
    isEditing,
    hasChanges,
    editedData,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    updateNestedField,
    reset
  } = useEditMode({
    initialData: tutor,
    onSaveCallback: async (updatedData) => {
      try {
        const response = await apiFetch('/tutors/updateProfile', {
          method: 'PUT',
          body: JSON.stringify({
            updated_information: {
              ...updatedData,
              subjects: updatedData.subjects?.map(subject => ({
                ...subject,
                _id: subject._id,
              }))
            }
          })
        });

        if (response.error) throw new Error(response.error);
        await fetchTutorData(tutor._id);
        return response;
      } catch (error) {
        console.error('Error updating tutor profile:', error);
        throw error;
      }
    },
    onCancelCallback: () => reset()
  });

  // Derived data
  const currentSubjects = isEditing ? editedData?.subjects : subjects;
  const selectedSubject = selectedSubjectIndex >= 0 && currentSubjects?.[selectedSubjectIndex] 
    ? currentSubjects[selectedSubjectIndex] 
    : null;
  const editedSubject = selectedSubjectIndex >= 0 && editedData?.subjects?.[selectedSubjectIndex]
    ? editedData.subjects[selectedSubjectIndex]
    : null;

  // Handlers
  const handleSubjectFieldChange = async (index, field, value, isPricing = false) => {
    if (!subjects[index]?._id) return;

    const updatedSubject = { 
      ...subjects[index],
      private_pricing: {
        ...subjects[index].private_pricing,
        ...(isPricing && { [field]: value })
      },
      ...(!isPricing && { [field]: value })
    };

    try {
      await updateSubjectInBackend(subjects[index]._id, updatedSubject);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const addSubject = async (newSubject) => {
    try {
      const result = await addSubjectToBackend(newSubject);
      if (result) {
        const updatedSubjects = [...(editedData?.subjects || []), result];
        updateField('subjects', updatedSubjects);
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const updateSubject = async (index, subjectData) => {
    const subjectsToUpdate = editedData?.subjects || [];
    if (index < 0 || index >= subjectsToUpdate.length) return;
    try {
      const subjectToUpdate = subjectsToUpdate[index];
      if (!subjectToUpdate?._id) {
        console.error('Subject ID is missing for update');
        return;
      }
      // Optimistically update local state first
      const updatedSubjects = [...subjectsToUpdate];
      updatedSubjects[index] = { ...updatedSubjects[index], ...subjectData };
      updateField('subjects', updatedSubjects);
      console.log('Optimistically updated subject:', updatedSubjects[index]);

      // Then send to backend
      await updateSubjectInBackend(subjectToUpdate._id, subjectData);
    } catch (error) {
      console.error('Error updating subject:', error);
      // Optionally revert optimistic update here
    }
  };

  const removeSubject = async (index) => {
    const subjectsToDelete = editedData?.subjects || [];
    if (index < 0 || index >= subjectsToDelete.length) return;
    try {
      const subjectToDelete = subjectsToDelete[index];
      if (!subjectToDelete?._id) {
        console.error('Subject ID is missing for delete');
        return;
      }
      // Optimistically update local state
      const updatedSubjects = subjectsToDelete.filter((_, i) => i !== index);
      updateField('subjects', updatedSubjects);

      // Then send to backend
      await deleteSubjectFromBackend(subjectToDelete._id);
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    try {
      await saveChanges();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    updateField(field, value);
  };

  const handleNestedSubjectChange = (path, value) => {
    if (selectedSubjectIndex === -1) return;
    updateNestedField(`subjects.${selectedSubjectIndex}.${path}`, value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent border-primary"></span>
        <span className="ml-2">{t('loading')}...</span>
      </div>
    );
  }

  // Error state
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
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            onSave={saveChanges}
            hasChanges={hasChanges}
          />
        )}

      <TutorProfileHeader
        tutor={isEditing ? editedData : tutor}
        onChange={handleFieldChange}
        onAddSubject={addSubject}
        onUpdateSubject={updateSubject}
        onDeleteSubject={removeSubject}
        onSave={saveChanges}
        isEditing={isEditing}  
        isOwner={isOwner} 
      />
        {(currentSubjects || [])?.length === 0 ? (
          <NoSubjectsView 
            t={t} 
            isOwner={isOwner} 
            isEditing={isEditing} 
            onAddSubject={addSubject}
          />
        ) : null}
      </form>
    </motion.div>
  );
};

// Sub-components
const NoSubjectsView = ({ t, isOwner, isEditing, onAddSubject }) => (
  <div className="rounded-xl bg-muted/40 dark:bg-muted/10 border border-border px-6 py-12 text-center space-y-4 shadow-sm mt-10">
    <div className="flex justify-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <span className="text-2xl">📚</span>
      </div>
    </div>
    <h2 className="text-xl font-semibold text-foreground">
      {t('noSubjectsHeader')}
    </h2>
    <p className="text-muted-foreground max-w-md mx-auto text-sm">
      {t('noSubjectsDescription')}
    </p>
    {isOwner && isEditing && (
      <Button 
        onClick={() => onAddSubject({ name: 'New Subject' })}
        className="mt-4"
      >
        {t('addSubject')}
      </Button>
    )}
  </div>
);

const SubjectsView = ({
  tutor,
  isEditing,
  isOwner,
  selectedSubjectIndex,
  setSelectedSubjectIndex,
  subjects,
  selectedSubject,
  editedSubject,
  reviews,
  handleNestedSubjectChange,
  onRemoveSubject,
  t
}) => (
  <>
    <SubjectSelector
      tutor={tutor}
      selectedSubjectIndex={selectedSubjectIndex}
      setSelectedSubjectIndex={setSelectedSubjectIndex}
      subjects={subjects}
      isEditing={isEditing}
      onRemoveSubject={onRemoveSubject}
    />

        {selectedSubject && (
          <div className="space-y-8 border-t pt-8 mt-8">
            <h3 className="text-xl font-semibold">
              {selectedSubject.name} – {selectedSubject.grade}
            </h3>
          </div> 
        )}
     </>
);
        
//         <div className="block lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Mobile and primary desktop sections */}
//           <div className="lg:col-span-2 space-y-8">
//             <SubjectPricingInfo
//               subject={isEditing ? editedSubject : selectedSubject}
//               onFieldChange={handleNestedSubjectChange}
//               isEditing={isEditing}
//             />
            
//             <TutorVideoManager
//               subject={isEditing ? editedSubject : selectedSubject}
//               onFieldChange={handleNestedSubjectChange}
//               isEditing={isEditing}
//               isOwner={isOwner}
//             />

//             {!isEditing && (
//               <TutorReviews
//                 tutorId={tutor._id}
//                 reviews={reviews || []}
//               />
//             )}
//           </div>

//           {/* Secondary desktop sections */}
//           <div className="hidden lg:block space-y-8">
//             <TutorCourseInfo
//               subject={isEditing ? editedSubject : selectedSubject}
//               onFieldChange={handleNestedSubjectChange}
//               isEditing={isEditing}
//             />
            
//             {selectedSubject.groups?.length > 0 && (
//               <TutorGroupsCard
//                 subject={isEditing ? editedSubject : selectedSubject}
//                 onFieldChange={handleNestedSubjectChange}
//                 isEditing={isEditing}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     )}
//   </>
// );

export default TutorProfilePage;