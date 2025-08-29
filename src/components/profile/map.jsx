import React from 'react';
import TutorLocationMapDisplay from './original/map';
import TutorLocationMapEdit from './editing/map';

const TutorLocationMap = ({ 
  tutor, 
  onChange, 
  isEditing,
  isOwner,
  className = '' 
}) => {
  if (!tutor) return null;

  return isEditing ? (
    <TutorLocationMapEdit
      tutor={tutor}
      onChange={onChange}
      className={className}
    />
  ) : (
    <TutorLocationMapDisplay 
      tutor={tutor} 
      isOwner={isOwner}
      className={className}
    />
  );
};

export default TutorLocationMap;