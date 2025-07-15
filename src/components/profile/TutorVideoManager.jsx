import React from 'react';
import TutorVideoManagerDisplay from './original/TutorVideoManager';
import TutorVideoManagerEdit from './editing/TutorVideoManager';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const TutorVideoManager = ({
  tutor,
  subject,
  subjectIndex,
  setTutor,
  isEditing,
  markDirty,
}) => {
  const { id } = useParams();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;
  const isOwner = isLoggedIn && userId === parseInt(id);

  const handleChange = (data) => {
    if (!setTutor || typeof subjectIndex !== 'number') return;

    setTutor((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex] = {
        ...updatedSubjects[subjectIndex],
        introVideoUrl: data.introVideoUrl,
        otherVideos: data.otherVideos,
      };
      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });

    if (markDirty) markDirty();
  };

  return isEditing ? (
    <TutorVideoManagerEdit
      introVideoUrl={subject?.introVideoUrl}
      otherVideos={subject?.otherVideos || []}
      onChange={handleChange}
    />
  ) : (
    <TutorVideoManagerDisplay
      introVideoUrl={subject?.introVideoUrl}
      otherVideos={subject?.otherVideos || []}
      isOwner={isOwner}
    />
  );
};

export default TutorVideoManager;
