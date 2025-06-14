import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { mockTutors } from '@/data/enhanced';
import { mockSchedules } from '@/data/mockSchedules';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorGroupsCard from '@/components/profile/TutorScheduleDisplay';
import TutorReviews from '@/components/profile/TutorReviews';
import { grades, sectors } from '@/data/formData';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorAchievements from '@/components/profile/badges';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = getTutorData(id);
      if (data) {
        setTutor(data);
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

  const gradeOptions = grades.map(g => ({ value: g.value, label: t(g.labelKey) }));
  const sectorOptions = sectors.map(s => ({ value: s.value, label: t(s.labelKey) }));
  const selectedSubject = tutor.subjects[selectedSubjectIndex];

  const subjectOptions = tutor.subjects.map((subj, idx) => ({
    label: `${t(subj.subject)} - ${subj.grade} (${t(subj.type)})`,
    value: idx.toString()
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <TutorProfileHeader tutor={tutor} selectedSubject={selectedSubject} />

      <div className="space-y-3 mb-6">
        <p className="text-base font-medium">{t('selectSubjectToView') || 'Select a subject to view'}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {tutor.subjects.map((subj, idx) => {
            const isActive = selectedSubjectIndex === idx;
            return (
              <Button
                key={idx}
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setSelectedSubjectIndex(idx)}
                className={`whitespace-nowrap text-sm sm:text-base px-4 py-2 rounded-full flex-shrink-0 transition-all ${
                  isActive ? 'ring-2 ring-primary bg-primary text-white' : ''
                }`}
              >
                {t(subj.subject)} - {subj.grade} ({t(subj.type)})
              </Button>
            );
          })}
        </div>
      </div>
      <TutorAchievements tutor={tutor} />

      {/* Desktop layout */}
      <div className="hidden lg:grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <SubjectPricingInfo
            price={selectedSubject?.price}
            privatePricing={selectedSubject?.private}
            subjectBio={selectedSubject?.bio}
            subjectRating={selectedSubject?.rating}
            offer={selectedSubject?.offer}
          />

          <TutorVideoManager
            introVideoUrl={selectedSubject?.introVideoUrl}
            otherVideos={selectedSubject?.otherVideos}
            isOwner={false}
          />
          <TutorReviews
            tutorId={id}
            comments={selectedSubject?.comments}
          />
        </div>
        <div className="space-y-8">
          <TutorCourseInfo
            courseContent={selectedSubject?.courseContent}
            duration={selectedSubject?.duration}
            lecturesPerWeek={selectedSubject?.lecturesPerWeek}
            isEditing={false}
          />
          {selectedSubject?.Groups && (
            <TutorGroupsCard subject={selectedSubject} />
          )}
        </div>
      </div>

      {/* ✅ Mobile layout (custom order) */}
      <div className="block lg:hidden space-y-8">
        <SubjectPricingInfo
          price={selectedSubject?.price}
          privatePricing={selectedSubject?.private}
          subjectBio={selectedSubject?.bio}
          subjectRating={selectedSubject?.rating}
          offer={selectedSubject?.offer}
        />

        <TutorCourseInfo
          courseContent={selectedSubject?.courseContent}
          duration={selectedSubject?.duration}
          lecturesPerWeek={selectedSubject?.lecturesPerWeek}
          isEditing={false}
        />
        {selectedSubject?.Groups && (
          <TutorGroupsCard subject={selectedSubject} />
        )}

        <TutorVideoManager
          introVideoUrl={selectedSubject?.introVideoUrl}
          otherVideos={selectedSubject?.otherVideos}
          isOwner={false}
        />

        <TutorReviews
          tutorId={id}
          comments={selectedSubject?.comments}
        />
      </div>

    </motion.div>
  );
};

export default TutorProfilePage;