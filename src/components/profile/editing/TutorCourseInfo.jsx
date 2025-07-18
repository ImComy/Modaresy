import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TutorCourseInfoEdit = ({ courseContent = [], duration = '', lecturesPerWeek = '', onInputChange }) => {
  const { t } = useTranslation();
  const [topics, setTopics] = useState(courseContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync topics with courseContent prop when it changes (subject switch)
  useEffect(() => {
    if (JSON.stringify(topics) !== JSON.stringify(courseContent)) {
      if (hasUnsavedChanges) {
        console.warn('Subject switched with unsaved changes. Preserving current topics.');
      } else {
        console.log('Syncing topics with new courseContent:', courseContent);
        setTopics(courseContent);
      }
    }
  }, [courseContent]);

  // Update topics and notify parent
  const updateTopics = (newTopics) => {
    setTopics(newTopics);
    setHasUnsavedChanges(true);
    onInputChange('courseContent', newTopics);
  };

  const handleAddTopic = () => {
    updateTopics([...topics, '']);
  };

  const handleChangeTopic = (index, value) => {
    const updated = [...topics];
    updated[index] = value;
    updateTopics(updated);
  };

  const handleRemoveTopic = (index) => {
    const updated = [...topics];
    updated.splice(index, 1);
    updateTopics(updated);
  };

  // Reset unsaved changes flag when saving (optional, if parent handles save)
  const handleSave = () => {
    setHasUnsavedChanges(false);
    console.log('Changes saved:', { courseContent: topics, duration, lecturesPerWeek });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {t('courseContentTitle', 'Course Content')}
          </CardTitle>
          <CardDescription className="text-sm">
            {t('courseContentDesc', 'Define what topics and structure the course includes.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Topics List */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t('topicsCovered', 'Topics Covered')}
            </h4>
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                >
                  <Input
                    value={topic}
                    onChange={(e) => handleChangeTopic(index, e.target.value)}
                    placeholder={t('topicPlaceholder', 'Enter topic...')}
                    className="text-sm h-9 w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTopic(index)}
                    className="text-red-500 hover:bg-red-100 w-10 h-9 sm:w-auto"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-2 text-xs h-9 w-full sm:w-auto"
                onClick={handleAddTopic}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('addTopic', 'Add Topic')}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Session Details */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t('sessionFormat', 'Session Format')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  {t('sessionDuration', 'Session Duration')}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => onInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder={t('minutes', 'Minutes')}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  {t('lecturesPerWeek', 'Lectures per Week')}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={lecturesPerWeek}
                  onChange={(e) => onInputChange('lecturesPerWeek', parseInt(e.target.value) || 0)}
                  placeholder={t('count', 'Count')}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('sessionFlexibility', 'Session durations and frequency can be adjusted as needed.')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorCourseInfoEdit;