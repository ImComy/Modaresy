import React from 'react';
import TutorScheduleDisplay from './original/TutorScheduleDisplay';
import TutorScheduleEdit from './editing/TutorScheduleEdit';

const TutorScheduleManager = ({
  tutor,
  subject,
  isEditing,
  onFieldChange, // This is for the subject
  onTutorChange, // This is for the tutor
}) => {
  
  // onFieldChange is expected to be onUpdateSubject(index, data) from the page
  // onTutorChange is expected to be updateField(field, value) from the page

  const handleSubjectFieldChange = (fieldName, value) => {
    onFieldChange(fieldName, value);
  };

  const handleTutorFieldChange = (fieldName, value) => {
    onTutorChange(fieldName, value);
  };

  return isEditing ? (
    <TutorScheduleEdit
      tutor={tutor}
      subject={subject}
      isEditing={isEditing}
      onSubjectChange={handleSubjectFieldChange}
      onTutorChange={handleTutorFieldChange}
    />
  ) : (
    <TutorScheduleDisplay
      tutor={tutor}
      subject={subject}
    />
  );
};

export default TutorScheduleManager;
