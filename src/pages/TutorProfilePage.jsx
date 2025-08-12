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
import { API_BASE, apiFetch } from '@/api/apiService'; // Reusing apiFetch from previous files

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  console.log('TutorProfilePage rendered with:', { propTutorId, externalEditing });
  const { t } = useTranslation();
  
  const {
    tutor,
    isLoading,
    selectedSubjectIndex,
    setSelectedSubjectIndex,
    isOwner,
    subjectProfiles,
    reviews,
    fetchTutorData,
    addSubject: addSubjectToBackend,
    updateSubject: updateSubjectInBackend,
    deleteSubject: deleteSubjectFromBackend
  } = useTutorProfile(propTutorId, externalEditing);

  // Edit mode management - reuse the save logic from useTutorProfile
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
        console.log('Saving tutor profile data:', updatedData);
        const response = await apiFetch('/tutors/updateProfile', {
          method: 'PUT',
          body: JSON.stringify({
            updated_information: {
              ...updatedData,
              subject_profiles: updatedData.subject_profiles?.map(profile => ({
                _id: profile._id,
                subject_id: profile.subject_id,
                price: profile.price,
                ...(profile.videos && { videos: profile.videos }),
                ...(profile.groups && { groups: profile.groups })
              }))
            }
          })
        });

        if (response.error) {
          throw new Error(response.error || 'Failed to update profile');
        }

        console.log('Profile update successful:', response);
        await fetchTutorData(tutor._id); // Refresh data
        return response.user || response;
      } catch (error) {
        console.error('Error updating tutor profile:', error);
        throw error;
      }
    },
    onCancelCallback: () => {
      console.log('Resetting tutor profile data');
      reset();
    }
  });

  // Derived data
  const subjects = subjectProfiles || [];
  const selectedSubject = selectedSubjectIndex >= 0 && selectedSubjectIndex < subjects.length 
    ? subjects[selectedSubjectIndex] 
    : null;
  const editedSubject = selectedSubjectIndex >= 0 && editedData?.subject_profiles?.[selectedSubjectIndex]
    ? editedData.subject_profiles[selectedSubjectIndex]
    : null;

  // Handlers

  const handleSubjectFieldChange = async (index, field, value, isPricing = false) => {
    if (selectedSubjectIndex === -1) return;

    const subjectId = subjectProfiles[index]._id;
    const updatedSubject = { ...subjectProfiles[index] };

    if (isPricing) {
      updatedSubject.private_pricing = {
        ...updatedSubject.private_pricing,
        [field]: value
      };
    } else {
      updatedSubject.subject_id = {
        ...updatedSubject.subject_id,
        [field]: value
      };
    }

    try {
      await updateSubjectInBackend(subjectId, updatedSubject);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  // Replace the existing addSubject with:
  const addSubject = async (newSubject) => {
    try {
      await addSubjectToBackend(newSubject);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  // Replace the existing removeSubject with:
  const removeSubject = async (index) => {
    if (index < 0 || index >= subjectProfiles.length) return;
    
    try {
      await deleteSubjectFromBackend(subjectProfiles[index]._id);
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      console.log('No changes to save');
      return;
    }
    
    try {
      console.log('Submitting tutor profile changes');
      await saveChanges();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    console.log(`Updating field ${field} with value:`, value);
    updateField(field, value);
  };

  const handleNestedSubjectChange = (path, value) => {
    if (selectedSubjectIndex === -1) {
      console.warn('No subject selected, cannot update nested field');
      return;
    }
    console.log(`Updating nested subject path ${path} with value:`, value);
    updateNestedField(`subject_profiles.${selectedSubjectIndex}.${path}`, value);
  };

  // Loading state
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent border-primary"></span>
        <span className="ml-2">{t('loading')}...</span>
      </div>
    );
  }

  // Error state
  if (!tutor) {
    console.log('Rendering tutor not found state');
    return <div className="text-center py-10">{t('tutorNotFound')}</div>;
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Current TutorProfilePage state:', {
      tutor,
      isEditing,
      hasChanges,
      selectedSubjectIndex,
      subjectsCount: subjects.length,
      reviewsCount: reviews.length,
      selectedSubject
    });
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
          tutor={tutor}
          onFieldChange={handleFieldChange}
          isEditing={isEditing}
          isOwner={isOwner}
        />

        {subjects.length === 0 ? (
          <NoSubjectsView 
            t={t} 
            isOwner={isOwner} 
            isEditing={isEditing} 
          />
        ) : (
          <SubjectsView
            tutor={tutor}
            isEditing={isEditing}
            isOwner={isOwner}
            selectedSubjectIndex={selectedSubjectIndex}
            setSelectedSubjectIndex={setSelectedSubjectIndex}
            subjects={subjects}
            selectedSubject={selectedSubject}
            editedSubject={editedSubject}
            reviews={reviews}
            handleNestedSubjectChange={handleNestedSubjectChange}
            t={t}
          />
        )}
      </form>
    </motion.div>
  );
};

// Extracted sub-components for better readability
const NoSubjectsView = ({ t }) => (
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
  t
}) => (
  <>
    <SubjectSelector
      tutor={tutor}
      selectedSubjectIndex={selectedSubjectIndex}
      setSelectedSubjectIndex={setSelectedSubjectIndex}
      subjects={subjects}
      isEditing={isEditing}
    />

    {selectedSubject && editedSubject ? (
      <div className="space-y-8 border-t pt-8 mt-8">
        <h3 className="text-xl font-semibold">
          {selectedSubject.subject_id?.name} – {selectedSubject.subject_id?.grade}
        </h3>
        <div className="block lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MobileSubjectSections
              isEditing={isEditing}
              editedSubject={editedSubject}
              selectedSubject={selectedSubject}
              handleNestedSubjectChange={handleNestedSubjectChange}
              isOwner={isOwner}
              tutor={tutor}
              reviews={reviews}
            />
            <DesktopPrimarySections
              isEditing={isEditing}
              editedSubject={editedSubject}
              selectedSubject={selectedSubject}
              handleNestedSubjectChange={handleNestedSubjectChange}
              isOwner={isOwner}
              tutor={tutor}
              reviews={reviews}
            />
          </div>
          <div className="hidden lg:block space-y-8">
            <DesktopSecondarySections
              isEditing={isEditing}
              editedSubject={editedSubject}
              selectedSubject={selectedSubject}
              handleNestedSubjectChange={handleNestedSubjectChange}
            />
          </div>
        </div>
      </div>
    ) : (
      <p className="text-muted-foreground text-sm">
        {t('noSubjectsFound', 'No subjects found for this selection.')}
      </p>
    )}
  </>
);

const MobileSubjectSections = ({
  isEditing,
  editedSubject,
  selectedSubject,
  handleNestedSubjectChange,
  isOwner,
  tutor,
  reviews
}) => (
  <div className="block lg:hidden space-y-8">
    <SubjectPricingInfo
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
    />
    <TutorVideoManager
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
      isOwner={isOwner}
    />
    <TutorCourseInfo
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
    />
    {selectedSubject.groups?.length > 0 && (
      <TutorGroupsCard
        subject={isEditing ? editedSubject : selectedSubject}
        onFieldChange={handleNestedSubjectChange}
        isEditing={isEditing}
      />
    )}
    {!isEditing && (
      <TutorReviews
        tutorId={tutor._id}
        reviews={reviews || []}
      />
    )}
  </div>
);

const DesktopPrimarySections = ({
  isEditing,
  editedSubject,
  selectedSubject,
  handleNestedSubjectChange,
  isOwner,
  tutor,
  reviews
}) => (
  <div className="hidden lg:block space-y-8">
    <SubjectPricingInfo
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
    />
    <TutorVideoManager
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
      isOwner={isOwner}
    />
    {!isEditing && (
      <TutorReviews
        tutorId={tutor._id}
        reviews={reviews || []}
      />
    )}
  </div>
);

const DesktopSecondarySections = ({
  isEditing,
  editedSubject,
  selectedSubject,
  handleNestedSubjectChange
}) => (
  <>
    <TutorCourseInfo
      subject={isEditing ? editedSubject : selectedSubject}
      onFieldChange={handleNestedSubjectChange}
      isEditing={isEditing}
    />
    {selectedSubject.groups?.length > 0 && (
      <TutorGroupsCard
        subject={isEditing ? editedSubject : selectedSubject}
        onFieldChange={handleNestedSubjectChange}
        isEditing={isEditing}
      />
    )}
  </>
);

export default TutorProfilePage;