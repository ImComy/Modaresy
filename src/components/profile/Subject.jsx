import React from 'react';
import SubjectPricingInfoDisplay from './original/Subject';
import SubjectPricingInfoEdit from './editing/Subject';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const SubjectPricingInfo = ({ tutor, setTutor, isEditing, markDirty }) => {
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
    <SubjectPricingInfoEdit tutor={tutor} onChange={handleChange} />
  ) : (
    <SubjectPricingInfoDisplay tutor={tutor} isOwner={isOwner} />
  );
};

export default SubjectPricingInfo;
