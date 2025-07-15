import React from 'react';
import TutorCourseInfoDisplay from './original/TutorCourseInfo';
import TutorCourseInfoEdit from './editing/TutorCourseInfo';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'react-router-dom';

const TutorCourseInfo = ({
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
    <TutorCourseInfoEdit
      courseContent={subject.courseContent}
      duration={subject.duration}
      lecturesPerWeek={subject.lecturesPerWeek}
      onInputChange={handleChange}
    />
  ) : (
    <TutorCourseInfoDisplay
      courseContent={subject.courseContent}
      duration={subject.duration}
      lecturesPerWeek={subject.lecturesPerWeek}
    />
  );
};

export default TutorCourseInfo;
