import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { mockTutors } from '@/data/mockTutors';
import { mockSchedules } from '@/data/mockSchedules';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorScheduleDisplay from '@/components/profile/TutorScheduleDisplay';
import TutorScheduleEditor from '@/components/profile/TutorScheduleEditor';
import TutorReviews from '@/components/profile/TutorReviews';
import TutorSubjectEditor from '@/components/profile/TutorSubjectEditor';
import TutorTargetAudienceEditor from '@/components/profile/TutorTargetAudienceEditor';
import { Edit, Save, XCircle, Loader2 } from 'lucide-react';
import { grades, sectors } from '@/data/formData';
import { useAuth } from '@/context/AuthContext';

// Extracted data fetching logic
const getTutorData = (id) => {
    const numericId = parseInt(id);
    const baseTutor = mockTutors.find(t => t.id === numericId);
    if (!baseTutor) return null;

    // Ensure all expected properties exist, providing defaults
    return {
        id: baseTutor.id,
        name: baseTutor.name || "Unnamed Tutor",
        subject: baseTutor.subject || "Not Specified",
        location: baseTutor.location || "Not Specified",
        rate: baseTutor.rate || 0,
        rating: baseTutor.rating || 0,
        yearsExp: baseTutor.yearsExp || 0,
        img: baseTutor.img || "/placeholder-avatar.jpg",
        bannerimg: baseTutor.bannerimg || "https://placehold.co/600x400",
        bioExcerpt: baseTutor.bioExcerpt || "No bio available.",
        teachingDays: baseTutor.teachingDays || [],
        targetGrades: baseTutor.targetGrades || [],
        targetSectors: baseTutor.targetSectors || [],
        detailedLocation: baseTutor.detailedLocation || null,
        bio: baseTutor.bio || "No detailed biography provided.",
        introVideoUrl: baseTutor.introVideoUrl || null,
        // Ensure otherVideos is an array and items have section property
        otherVideos: (baseTutor.otherVideos || []).map(v => ({ ...v, section: v.section || 'other' })),
        courseContent: baseTutor.courseContent || [],
        duration: baseTutor.duration || 60,
        lecturesPerWeek: baseTutor.lecturesPerWeek || 2,
        comments: baseTutor.comments || [],
        schedule: mockSchedules.find(s => s.tutorId === numericId)?.schedule || [],
        subjects: baseTutor.subjects || (baseTutor.subject ? [baseTutor.subject] : []),
    };
};

// Main Profile Page Component
const TutorProfilePage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;

  const [tutor, setTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwner = isLoggedIn && userId === parseInt(id);

  // Fetch and set tutor data
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = getTutorData(id);
      if (data) {
        setTutor(data);
        setEditData(JSON.parse(JSON.stringify(data))); // Deep copy for editing
      } else {
        navigate('/');
        toast({ title: t('error'), description: t('tutorNotFound'), variant: 'destructive' });
      }
      setIsLoading(false);
    }, 300);

      return () => clearTimeout(timer);
  }, [id, t, navigate, toast]);

  // --- Edit Handlers using useCallback ---
  const handleInputChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMultiSelectChange = useCallback((field, values) => {
      setEditData(prev => ({ ...prev, [field]: values }));
    }, []);

  const handleScheduleChange = useCallback((newSchedule) => {
      setEditData(prev => ({ ...prev, schedule: newSchedule }));
    }, []);

  const handleAddVideo = useCallback((newVideo) => {
      console.log("Adding video with section:", newVideo); // Log the new video data
      setEditData(prev => ({
        ...prev,
        otherVideos: [...(prev.otherVideos || []), { ...newVideo, id: `v${Date.now()}` }]
      }));
  }, []);

  const handleRemoveVideo = useCallback((videoId) => {
      console.log("Removing video:", videoId);
      setEditData(prev => ({
        ...prev,
        otherVideos: (prev.otherVideos || []).filter(v => v.id !== videoId)
      }));
  }, []);

  const handleReviewSubmit = useCallback((reviewData) => {
      const newComment = {
        id: `c${Date.now()}`,
        user: "Current User",
        rating: reviewData.rating,
        text: reviewData.text,
        date: new Date().toISOString().split('T')[0]
      };
      const updatedComments = [...(tutor?.comments || []), newComment];
      setTutor(prev => ({ ...prev, comments: updatedComments }));
      setEditData(prev => ({ ...prev, comments: updatedComments }));
      toast({ title: t('reviewSubmitted'), description: t('reviewSubmitDesc') });
    }, [tutor?.comments, toast, t]);

  // --- Save/Cancel Edit ---
  const handleSaveChanges = () => {
    console.log("Saving data:", editData);
    setTutor(editData);
    setIsEditing(false);
    toast({ title: t('profileUpdated'), description: t('profileUpdateSuccess') });
  };

  const handleCancelEdit = () => {
    setEditData(JSON.parse(JSON.stringify(tutor)));
    setIsEditing(false);
  };

  // --- Render Logic ---
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('loading')}...</span>
    </div>
  );

  if (!tutor) return <div className="text-center py-10">{t('tutorNotFound')}</div>;

  const gradeOptions = grades.map(g => ({ value: g.value, label: t(g.labelKey) }));
  const sectorOptions = sectors.map(s => ({ value: s.value, label: t(s.labelKey) }));
  const displayData = isEditing ? editData : tutor;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Edit Controls */}
      {isOwner && (
        <div className="flex justify-end gap-2 mb-4 sticky top-20 z-10">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}><XCircle size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('cancel')}</Button>
              <Button onClick={handleSaveChanges}><Save size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('saveChanges')}</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}><Edit size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> {t('editProfile')}</Button>
          )}
        </div>
      )}

      {/* Profile Header */}
      <TutorProfileHeader
          tutor={displayData}
          isEditing={isEditing}
          onInputChange={handleInputChange}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Videos & Reviews) */}
        <div className="lg:col-span-2 space-y-8">
            <TutorVideoManager
              introVideoUrl={displayData.introVideoUrl}
              otherVideos={displayData.otherVideos}
              isOwner={isOwner}
              isEditing={isEditing}
              onAddVideo={handleAddVideo}
              onRemoveVideo={handleRemoveVideo}
              onInputChange={handleInputChange}
            />
            <TutorReviews
              tutorId={id}
              comments={displayData.comments}
              onSubmitReview={handleReviewSubmit}
            />
        </div>

        {/* Right Column (Sidebar Info) */}
        <div className="lg:col-span-1 space-y-8">
            <TutorSubjectEditor
              subjects={displayData.subjects}
              isEditing={isEditing}
              onSubjectChange={(values) => handleMultiSelectChange('subjects', values)}
            />
            <TutorTargetAudienceEditor
              targetGrades={displayData.targetGrades}
              targetSectors={displayData.targetSectors}
              gradeOptions={gradeOptions}
              sectorOptions={sectorOptions}
              isEditing={isEditing}
              onGradeChange={(values) => handleMultiSelectChange('targetGrades', values)}
              onSectorChange={(values) => handleMultiSelectChange('targetSectors', values)}
            />
            <TutorCourseInfo
              courseContent={displayData.courseContent}
              duration={displayData.duration}
              lecturesPerWeek={displayData.lecturesPerWeek}
              isEditing={isEditing}
              onInputChange={handleInputChange}
            />
            {isEditing ? (
              <TutorScheduleEditor
                  initialSchedule={displayData.schedule}
                  onScheduleChange={handleScheduleChange}
              />
            ) : (
              <TutorScheduleDisplay schedule={displayData.schedule} />
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default TutorProfilePage;
