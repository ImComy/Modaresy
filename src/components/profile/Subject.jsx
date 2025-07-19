import React from 'react';
import SubjectPricingInfoDisplay from './original/Subject';
import SubjectPricingInfoEdit from './editing/Subject';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const SubjectPricingInfo = ({
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

  const handleChange = (field, value) => {
    if (!setTutor || typeof subjectIndex !== 'number') return;

    setTutor(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex] = {
        ...updatedSubjects[subjectIndex],
        [field]: value,
      };
      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });

    if (markDirty) markDirty();
  };

  return isEditing ? (
    <SubjectPricingInfoEdit
      {...subject}
      subject={subject}
      onChange={handleChange}
    />
  ) : (
    <SubjectPricingInfoDisplay
      {...subject}
      isOwner={isOwner}
    />
  );
};

export default SubjectPricingInfo;