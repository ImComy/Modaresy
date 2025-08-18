import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import SubjectPricingInfo from '@/components/profile/Subject';
import TutorVideoManager from '@/components/profile/TutorVideoManager';
import TutorCourseInfo from '@/components/profile/TutorCourseInfo';
import TutorScheduleManager from '@/components/profile/TutorScheduleManager';
import TutorReviews from '@/components/profile/TutorReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SubjectSelector = ({
  tutor,
  subjects = [],
  isEditing = false,
  isOwner,
  onUpdateSubject,
  onTutorChange,
}) => {
  const { t } = useTranslation();
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);

  const handleNestedChange = (path, value) => {
    const selectedSubject = subjects[selectedSubjectIndex];
    if (!selectedSubject) return;

    const updatedSubjectData = { ...selectedSubject, [path]: value };
    onUpdateSubject(selectedSubjectIndex, updatedSubjectData);
  };
  
  // Ensure selectedSubjectIndex is valid whenever subjects change
  React.useEffect(() => {
    if (subjects.length === 0) {
      if (selectedSubjectIndex !== -1) setSelectedSubjectIndex(-1);
      return;
    }
    if (selectedSubjectIndex < 0 || selectedSubjectIndex >= subjects.length) {
      setSelectedSubjectIndex(0);
    }
  }, [subjects, selectedSubjectIndex]);

  const selectedSubject = selectedSubjectIndex >= 0 && subjects[selectedSubjectIndex] 
    ? subjects[selectedSubjectIndex] 
    : null;

  if (subjects.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 dark:bg-muted/10 border border-border px-6 py-12 text-center space-y-4 shadow-sm mt-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          {t('noSubjectsHeader', { defaultValue: 'No Subjects Added' })}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {t('noSubjectsDescription', { defaultValue: "This tutor hasn't added any subjects yet." })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{t('subjects')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Horizontal scroll container for subject buttons */}
          <div className="flex overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
            <div className="flex flex-nowrap gap-2">
              {subjects.map((subject, index) => {
                const isActive = selectedSubjectIndex === index;
                const subjectName = subject.name || subject.subject_id?.name || t('unknownSubject');
                const educationSystem = subject.education_system || subject.subject_id?.education_system;
                const grade = subject.grade || subject.subject_id?.grade;
                const sector = subject.sector || subject.subject_id?.sector;
                const language = subject.language || subject.subject_id?.language;

                return (
                  <button
                    key={subject._id || subject.tempId}
                    type="button"
                    onClick={() => setSelectedSubjectIndex(index)}
                    className={`
                      px-3 py-2 rounded-lg border transition-all duration-200
                      flex flex-col items-start min-w-[140px] max-w-[160px] flex-shrink-0
                      ${isActive 
                        ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                        : 'border-border hover:bg-muted/40'}
                    `}
                  >
                    <h3 className="font-medium text-sm truncate w-full text-left">{subjectName}</h3>
                    
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0.5 truncate max-w-[70px]"
                        title={educationSystem}
                      >
                        {educationSystem}
                      </Badge>
                      
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0.5 truncate max-w-[50px]"
                        title={grade}
                      >
                        {grade}
                      </Badge>
                      
                      {sector && (
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0.5 truncate max-w-[60px]"
                          title={sector}
                        >
                          {sector}
                        </Badge>
                      )}
                      
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0.5 truncate max-w-[60px]"
                        title={language}
                      >
                        {language}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSubject && (
        <div className="space-y-8">
          {/* Desktop Layout (lg screens and above) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary column */}
              <div className="lg:col-span-2 space-y-8">
                <SubjectPricingInfo
                  subject={selectedSubject}
                  tutor={tutor}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
                
                <TutorVideoManager
                  videos={selectedSubject?.youtube || []}
                  isEditing={isEditing}
                  isOwner={isOwner}
                  onVideosChange={(newVideos) => handleNestedChange('youtube', newVideos)}
                />

                {!isEditing && (
                  <TutorReviews
                    tutorId={tutor._id}
                    reviews={tutor.reviews || []}
                  />
                )}
              </div>

              {/* Secondary column */}
              <div className="space-y-8">
                <TutorCourseInfo
                  subject={selectedSubject}
                  tutor={tutor}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
                
                <TutorScheduleManager
                  tutor={tutor}
                  subject={selectedSubject}
                  isEditing={isEditing}
                  onFieldChange={handleNestedChange}
                  onTutorChange={onTutorChange}
                />
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout (lg screens and below) */}
          <div className="lg:hidden space-y-8">
            <SubjectPricingInfo
              subject={selectedSubject}
              onFieldChange={handleNestedChange}
              isEditing={isEditing}
            />
            
            <TutorVideoManager
              videos={selectedSubject?.youtube || []}
              isEditing={isEditing}
              isOwner={isOwner}
              onVideosChange={(newVideos) => handleNestedChange('youtube', newVideos)}
            />
            
            <TutorCourseInfo
              subject={selectedSubject}
              tutor={tutor}
              isEditing={isEditing}
              onFieldChange={handleNestedChange}
              onTutorChange={onTutorChange}
            />
            
            <TutorScheduleManager
              tutor={tutor}
              subject={selectedSubject}
              isEditing={isEditing}
              onFieldChange={handleNestedChange}
              onTutorChange={onTutorChange}
            />
            
            {!isEditing && (
              <TutorReviews
                tutorId={tutor._id}
                reviews={tutor.reviews || []}
              />
            )}
          </div>
        </div> 
      )}
    </div>
  );
};

export default SubjectSelector;