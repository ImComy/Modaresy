import React from 'react';
import TutorVideoManagerDisplay from './original/TutorVideoManagerDisplay';
import TutorVideoManagerEdit from './editing/TutorVideoManagerEdit';

const TutorVideoManager = ({
  videos = [],
  isEditing,
  isOwner,
  onVideosChange,
}) => {
  const handleVideosChange = (newVideos) => {
    if (onVideosChange) {
      onVideosChange(newVideos);
    }
  };

  return isEditing ? (
    <TutorVideoManagerEdit
      videos={videos}
      onChange={handleVideosChange}
    />
  ) : (
    <TutorVideoManagerDisplay
      videos={videos}
      isOwner={isOwner}
    />
  );
};

export default TutorVideoManager;