import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { mockTutors } from '@/data/enhanced';
import { mockSchedules } from '@/data/mockSchedules';
import { useAuth } from '@/context/AuthContext';

import EditToggleButton from '@/components/ui/EditToggleButton';
import useEditMode from '@/hooks/useEditMode';

import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import TutorAchievements from '@/components/profile/badges';
import SubjectSelector from '@/components/profile/subjectSelector';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorGroupsCard from '@/components/profile/TutorScheduleDisplay';
import TutorReviews from '@/components/profile/TutorReviews';

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

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  const params = useParams();
  const id = propTutorId ?? params.id;
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [originalTutor, setOriginalTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

  const isOwner = authState.isLoggedIn && authState.userId === parseInt(id);

  const {
    isEditing: internalEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    markDirty,
  } = useEditMode({
    onSaveCallback: () => setOriginalTutor(structuredClone(tutor)),
    onCancelCallback: () => setTutor(structuredClone(originalTutor)),
  });

  const isEditing = externalEditing ?? internalEditing;

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
          title: t('error'),
          description: t('tutorNotFound'),
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id, t, navigate, toast, location.search]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {isOwner && (
        <EditToggleButton
          isEditing={isEditing}
          startEditing={startEditing}
          cancelEditing={() => {
            cancelEditing();
            setTutor(originalTutor);
          }}
          onSave={() => {
            saveChanges();
            setOriginalTutor(tutor);
          }}
        />
      )}

      <TutorProfileHeader
        tutor={tutor}
        setTutor={setTutor}
        markDirty={markDirty}
        isEditing={isEditing}
        isOwner={isOwner}
      />

      <TutorAchievements tutor={tutor} />

      {(!Array.isArray(tutor.subjects) || tutor.subjects.length === 0) ? (
        <div className="rounded-xl bg-muted/40 dark:bg-muted/10 border border-border px-6 py-12 text-center space-y-4 shadow-sm">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <h2
            className="text-xl font-semibold text-foreground"
          >
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
                  {/* Mobile layout */}
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
                        tutorId={id}
                        comments={selectedSubject?.comments}
                      />
                    )}
                  </div>
                  {/* Desktop layout */}
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
                        tutorId={id}
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
    </motion.div>
  );
};

export default TutorProfilePage;