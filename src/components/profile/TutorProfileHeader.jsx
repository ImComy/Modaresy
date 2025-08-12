import React from 'react';
import TutorProfileHeaderDisplay from './original/TutorProfileHeader';
import TutorProfileHeaderEdit from './editing/TutorProfileHeader';

const TutorProfileHeader = ({ tutor, onFieldChange, isEditing, isOwner }) => {
  // Simple null check to prevent errors
  if (!tutor) return null;

  return isEditing ? (
    <TutorProfileHeaderEdit
      tutor={tutor}
      onChange={onFieldChange}
    />
  ) : (
    <TutorProfileHeaderDisplay 
      tutor={tutor} 
      isOwner={isOwner} 
    />
  );
};

export default TutorProfileHeader;