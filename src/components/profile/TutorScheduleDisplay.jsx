import React from 'react';
import TutorGroupsCardEdit from './editing/TutorScheduleDisplay';
import TutorGroupsCardDisplay from './original/TutorScheduleDisplay';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const TutorGroupsCard = ({
  tutor,
  subject,
  isEditing = false,
  onSubjectChange,
}) => {
  const { id } = useParams();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;
  const isOwner = isLoggedIn && userId === parseInt(id);

  return isEditing ? (
    <TutorGroupsCardEdit
      tutor={tutor}
      subject={subject}
      onSubjectChange={onSubjectChange}
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