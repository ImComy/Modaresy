import React from 'react';
import TutorProfileHeaderDisplay from './original/TutorProfileHeader';
import TutorProfileHeaderEdit from './editing/TutorProfileHeader';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const TutorProfileHeader = ({ tutor, setTutor, isEditing, markDirty }) => {
  const { id } = useParams();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;
  const isOwner = isLoggedIn && userId === parseInt(id);

  const handleChange = (field, value) => {
    setTutor(prev => ({
      ...prev,
      [field]: value,
    }));
    if (markDirty) markDirty();
  };

  return isEditing ? (
    <TutorProfileHeaderEdit tutor={tutor} onChange={handleChange} />
  ) : (
    <TutorProfileHeaderDisplay tutor={tutor} isOwner={isOwner} />
  );
};

export default TutorProfileHeader;
