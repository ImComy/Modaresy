// TutorProfileHeader.jsx
import React from 'react';
import TutorProfileHeaderDisplay from './original/TutorProfileHeader';
import TutorProfileHeaderEdit from './editing/TutorProfileHeader';

const TutorProfileHeader = ({ 
  tutor, 
  onChange, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject, 
  isEditing,
  isOwner
}) => {
  if (!tutor) return null;

  return isEditing ? (
    <TutorProfileHeaderEdit
      tutor={tutor}
      onChange={onChange}
      onAddSubject={onAddSubject}        
      onUpdateSubject={onUpdateSubject}    
      onDeleteSubject={onDeleteSubject}    
    />
  ) : (
    <TutorProfileHeaderDisplay 
      tutor={tutor} 
      isOwner={isOwner} 
    />
  );
};

export default TutorProfileHeader;