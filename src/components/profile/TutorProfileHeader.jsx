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
  isOwner,
  isSubjectMutating,
  pendingFilesRef
}) => {
  if (!tutor) return null;

  return isEditing ? (
    <TutorProfileHeaderEdit
      tutor={tutor}
      onChange={onChange}
      onAddSubject={onAddSubject}        
      onUpdateSubject={onUpdateSubject}    
      onDeleteSubject={onDeleteSubject}
      isSubjectMutating={isSubjectMutating}
      pendingFilesRef={pendingFilesRef}
    />
  ) : (
    <TutorProfileHeaderDisplay 
      tutor={tutor} 
      isOwner={isOwner} 
    />
  );
};

export default TutorProfileHeader;