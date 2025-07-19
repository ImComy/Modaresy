import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TutorProfileHeaderDisplay from './original/TutorProfileHeader';
import TutorProfileHeaderEdit from './editing/TutorProfileHeader';
import { handleFieldChange } from '@/handlers/tutorEdit/common';

// Main TutorProfileHeader component to toggle between display and edit modes
const TutorProfileHeader = ({ tutor, setTutor, isEditing, markDirty }) => {
  const { id } = useParams();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;
  const isOwner = isLoggedIn && userId === parseInt(id);

  return isEditing ? (
    <TutorProfileHeaderEdit
      tutor={tutor}
      onChange={(field, value) => handleFieldChange(field, value, setTutor, markDirty)}
    />
  ) : (
    <TutorProfileHeaderDisplay tutor={tutor} isOwner={isOwner} />
  );
};

export default TutorProfileHeader;