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

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  const { t } = useTranslation();
  const {
    tutor,
    isLoading,
    selectedSubjectIndex,
    setSelectedSubjectIndex,
    isOwner,
    setTutor,
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    markDirty,
    hasChanges,
  } = useTutorProfile(propTutorId, externalEditing);

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

  const selectedSubject = selectedSubjectIndex >= 0 && selectedSubjectIndex < tutor.subjects.length 
    ? tutor.subjects[selectedSubjectIndex] 
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    try {
      await saveChanges();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

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
          />
        )}

        <TutorProfileHeader
          tutor={tutor}
          setTutor={setTutor}
          markDirty={markDirty}
          isEditing={isEditing}
          isOwner={isOwner}
        />

        {(!Array.isArray(tutor.subjects) || tutor.subjects.length === 0) ? (
          <div className="rounded-xl bg-muted/40 dark:bg-muted/10 border border-border px-6 py-12 text-center space-y-4 shadow-sm">
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
        ) : (
          <>
            <SubjectSelector
              tutor={tutor}
              selectedSubjectIndex={selectedSubjectIndex}
              setSelectedSubjectIndex={setSelectedSubjectIndex}
            />

            {selectedSubject ? (
              <div className="space-y-8 border-t pt-8 mt-8">
                <h3 className="text-xl font-semibold">
                  {selectedSubject.subject} – {selectedSubject.grade}
                </h3>
                <div className="block lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="block lg:hidden space-y-8">
                      <SubjectPricingInfo
                        subject={selectedSubject}
                        subjectIndex={selectedSubjectIndex}
                        tutor={tutor}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                      />
                      <TutorVideoManager
                        subject={selectedSubject}
                        subjectIndex={selectedSubjectIndex}
                        tutor={tutor}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                        isOwner={isOwner}
                      />
                      <TutorCourseInfo
                        subject={selectedSubject}
                        subjectIndex={selectedSubjectIndex}
                        tutor={tutor}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                      />
                      {selectedSubject?.Groups && (
                        <TutorGroupsCard
                          subject={selectedSubject}
                          tutor={tutor}
                          subjectIndex={selectedSubjectIndex}
                          setTutor={setTutor}
                          markDirty={markDirty}
                          isEditing={isEditing}
                        />
                      )}
                      {!isEditing && (
                        <TutorReviews
                          tutorId={tutor.id}
                          comments={selectedSubject?.comments}
                        />
                      )}
                    </div>
                    <div className="hidden lg:block space-y-8">
                      <SubjectPricingInfo
                        subject={selectedSubject}
                        subjectIndex={selectedSubjectIndex}
                        tutor={tutor}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                      />
                      <TutorVideoManager
                        subject={selectedSubject}
                        subjectIndex={selectedSubjectIndex}
                        tutor={tutor}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                        isOwner={isOwner}
                      />
                      {!isEditing && (
                        <TutorReviews
                          tutorId={tutor.id}
                          comments={selectedSubject?.comments}
                        />
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block space-y-8">
                    <TutorCourseInfo
                      subject={selectedSubject}
                      subjectIndex={selectedSubjectIndex}
                      tutor={tutor}
                      setTutor={setTutor}
                      markDirty={markDirty}
                      isEditing={isEditing}
                    />
                    {selectedSubject?.Groups && (
                      <TutorGroupsCard
                        subject={selectedSubject}
                        tutor={tutor}
                        subjectIndex={selectedSubjectIndex}
                        setTutor={setTutor}
                        markDirty={markDirty}
                        isEditing={isEditing}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('noSubjectsFound', 'No subjects found for this selection.')}
              </p>
            )}
          </>
        )}
        {isEditing && (
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={!hasChanges}
            >
              {t('saveChanges', 'Save Changes')}
            </Button>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default TutorProfilePage;