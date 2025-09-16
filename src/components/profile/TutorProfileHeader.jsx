import React from 'react';
import TutorProfileHeaderDisplay from './original/TutorProfileHeader';
import TutorProfileHeaderEdit from './editing/TutorProfileHeader';
import { Edit } from 'lucide-react';

const TutorProfileHeader = ({ 
  tutor, 
  onChange, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject, 
  isEditing,
  isOwner,
  isSubjectMutating,
  pendingFilesRef,
  editedData
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
      editedData={editedData}
    />
  ) : (
    <TutorProfileHeaderDisplay 
      tutor={tutor} 
      isOwner={isOwner} 
    />
  );
};

export default TutorProfileHeader;