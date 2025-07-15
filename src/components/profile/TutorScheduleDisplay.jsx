import React from 'react';
import TutorGroupsCardDisplay from './original/TutorScheduleDisplay';
import TutorGroupsCardEdit from './editing/TutorScheduleDisplay';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const TutorGroupsCard = ({
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

  const handleSubjectChange = (updatedSubject) => {
    if (!setTutor || typeof subjectIndex !== 'number') return;

    setTutor((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex] = updatedSubject;
      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });

    if (markDirty) markDirty();
  };

  const handleTutorChange = (updatedTutor) => {
    if (!setTutor) return;
    setTutor((prev) => ({
      ...prev,
      ...updatedTutor,
    }));
    if (markDirty) markDirty();
  };

  return isEditing ? (
    <TutorGroupsCardEdit
      tutor={tutor}
      subject={subject}
      onSubjectChange={handleSubjectChange}
      onTutorChange={handleTutorChange}
    />
  ) : (
    <TutorGroupsCardDisplay
      tutor={tutor}
      subject={subject}
      isOwner={isOwner}
    />
  );
};

export default TutorGroupsCard;
