import React from 'react';
import SubjectPricingInfoDisplay from './original/Subject';
import SubjectPricingInfoEdit from './editing/Subject';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const SubjectPricingInfo = ({
  tutor,
  subject,
  isEditing,
  onFieldChange,
}) => {
  const { id } = useParams();
  const { authState } = useAuth();
  const { isLoggedIn, userId } = authState;
  const isOwner = isLoggedIn && userId === parseInt(id);

  const handleChange = (field, value) => {
    onFieldChange(field, value);
  };

  return isEditing ? (
    <SubjectPricingInfoEdit
      subject={subject}
      onChange={handleChange}
    />
  ) : (
    <SubjectPricingInfoDisplay
      subject={subject}
      isOwner={isOwner}
      tutor={tutor}
    />
  );
};

export default SubjectPricingInfo;