// TutorProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { mockTutors } from '@/data/enhanced';
import { mockSchedules } from '@/data/mockSchedules';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorGroupsCard from '@/components/profile/TutorScheduleDisplay';
import TutorReviews from '@/components/profile/TutorReviews';
import { grades, sectors } from '@/data/formData';
import { useAuth } from '@/context/AuthContext';
import EditToggleButton from '@/components/ui/EditToggleButton';
import useEditMode from '@/hooks/useEditMode';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorAchievements from '@/components/profile/badges';
import SubjectSelector from '../components/profile/subjectSelector';

const getTutorData = (id) => {
  const numericId = parseInt(id);
  const baseTutor = mockTutors.find(t => t.id === numericId);
  if (!baseTutor) return null;
  return {
    ...baseTutor,
    subjects: baseTutor.subjects || [],
    schedule: mockSchedules.find(s => s.tutorId === numericId)?.schedule || [],
  };
};

const TutorProfilePage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [originalTutor, setOriginalTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const isOwner= authState.isLoggedIn && authState.userId === parseInt(id);

  const {
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    hasChanges,
    markDirty
  } = useEditMode({
    onSaveCallback: () => {
      setOriginalTutor(structuredClone(tutor));
      console.log('Changes saved');
    },
    onCancelCallback: () => {
      setTutor(structuredClone(originalTutor));
      console.log('Changes discarded');
    }
  });

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
        let index = 0;
        if (filterSubject && filterGrade && Array.isArray(data.subjects)) {
          const idx = data.subjects.findIndex(
            s => s.subject === filterSubject && s.grade === filterGrade
          );
          index = idx >= 0 ? idx : 0;
        }
        setSelectedSubjectIndex(index);
      } else {
        navigate('/');
        toast({ title: t('error'), description: t('tutorNotFound'), variant: 'destructive' });
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id, t, navigate, toast, location.search]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent border-primary"></span>
      <span className="ml-2">{t('loading')}...</span>
    </div>
  );

  if (!tutor) return <div className="text-center py-10">{t('tutorNotFound')}</div>;

  const selectedSubject = tutor.subjects[selectedSubjectIndex];

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
      )};

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
          <h2 className="text-xl font-semibold text-foreground">
            {t('noSubjectsHeader', 'No Subjects Added')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {t(
              'noSubjectsDescription',
              'This tutor hasn’t added any subjects yet. Please check back later or explore other tutors.'
            )}
          </p>
        </div>
      ) : (
        <>
          <SubjectSelector
            tutor={tutor}
            selectedSubjectIndex={selectedSubjectIndex}
            setSelectedSubjectIndex={setSelectedSubjectIndex}
          />

          {isEditing ? (
            <div className="block lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <SubjectPricingInfo
                  subject={selectedSubject}
                  subjectIndex={selectedSubjectIndex}
                  tutor={tutor}
                  setTutor={setTutor}
                  markDirty={markDirty}
                  isEditing={true}
                />
                <TutorVideoManager
                  subject={selectedSubject}
                  subjectIndex={selectedSubjectIndex}
                  tutor={tutor}
                  setTutor={setTutor}
                  markDirty={markDirty}
                  isEditing={true}
                />
                <TutorReviews
                  tutorId={id}
                  comments={selectedSubject?.comments}
                  isEditing={true}
                  subjectIndex={selectedSubjectIndex}
                  tutor={tutor}
                  setTutor={setTutor}
                  markDirty={markDirty}
                />
              </div>
              <div className="space-y-8">
                <TutorCourseInfo
                  subject={selectedSubject}
                  subjectIndex={selectedSubjectIndex}
                  tutor={tutor}
                  setTutor={setTutor}
                  markDirty={markDirty}
                  isEditing={true}
                />
                {selectedSubject?.Groups && (
                  <TutorGroupsCard
                    subject={selectedSubject}
                    tutor={tutor}
                    subjectIndex={selectedSubjectIndex}
                    setTutor={setTutor}
                    markDirty={markDirty}
                    isEditing={true}
                  />
                )}
              </div>
            </div>
          ) : (
            tutor.subjects.map((subject, idx) => (
              <div key={idx} className="space-y-8 border-t pt-8 mt-8">
                <h3 className="text-xl font-semibold">
                  {subject.subject} – {subject.grade}
                </h3>
                <div className="block lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <SubjectPricingInfo
                      subject={selectedSubject}
                      subjectIndex={selectedSubjectIndex}
                      tutor={tutor}
                      setTutor={setTutor}
                      markDirty={markDirty}
                      isEditing={false}
                    />

                    <TutorVideoManager {...subject} isOwner={false} />
                    <TutorReviews tutorId={id} comments={subject?.comments} />
                  </div>
                  <div className="space-y-8">
                    <TutorCourseInfo {...subject} isEditing={false} />
                    {subject?.Groups && (
                      <TutorGroupsCard subject={subject} tutor={tutor} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </motion.div>
  );
};

export default TutorProfilePage;
