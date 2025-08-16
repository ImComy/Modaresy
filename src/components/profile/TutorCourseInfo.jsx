import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Plus, Trash } from 'lucide-react';

const TutorCourseInfo = ({ 
  subject, 
  isEditing = false, 
  onFieldChange 
}) => {
  const { t } = useTranslation();
  
  // Extract course info from subject
  const content = subject?.content || [];
  const session_duration = subject?.session_duration || 0;
  const lectures_per_week = subject?.lectures_per_week || 0;

  // Handlers for edit mode
  const handleContentChange = (newContent) => {
    onFieldChange('content', newContent);
  };

  const handleDurationChange = (value) => {
    onFieldChange('session_duration', parseInt(value) || 0);
  };

  const handleLecturesChange = (value) => {
    onFieldChange('lectures_per_week', parseInt(value) || 0);
  };

  const handleAddTopic = () => {
    handleContentChange([...content, '']);
  };

  const handleChangeTopic = (index, value) => {
    const updated = [...content];
    updated[index] = value;
    handleContentChange(updated);
  };

  const handleRemoveTopic = (index) => {
    const updated = [...content];
    updated.splice(index, 1);
    handleContentChange(updated);
  };

  // Prevent form submission on Enter key press
  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
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
                {content.map((topic, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                  >
                    <Input
                      value={topic}
                      onChange={(e) => handleChangeTopic(index, e.target.value)}
                      onKeyDown={preventEnterSubmit}
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
                    value={session_duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    onKeyDown={preventEnterSubmit}
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
                    value={lectures_per_week}
                    onChange={(e) => handleLecturesChange(e.target.value)}
                    onKeyDown={preventEnterSubmit}
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
  }

  // Display mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('courseContentTitle')}</CardTitle>
          <CardDescription>{t('courseContentDesc')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <h4 className="font-medium text-foreground">{t('topicsCovered')}</h4>

          {content?.length > 0 ? (
            <ul className="list-none space-y-2 text-sm">
              {content.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle
                    size={16}
                    className="text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('noTopicsListed')}
            </p>
          )}

          <Separator className="my-4" />

          <div>
            <h4 className="font-medium text-foreground mb-2">
              {t('sessionFormat')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">
                  {t('sessionDuration')}
                </span>
                <p className="font-medium">
                  {session_duration
                    ? t('durationMinutes', { duration: session_duration })
                    : t('noDurationProvided')}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">
                  {t('lecturesPerWeek')}
                </span>
                <p className="font-medium">
                  {lectures_per_week
                    ? t('lecturesCount', { count: lectures_per_week })
                    : t('noLecturesProvided')}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {t('sessionFlexibility')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TutorCourseInfo;