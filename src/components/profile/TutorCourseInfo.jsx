
    import React from 'react';
    import { useTranslation } from 'react-i18next';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { CheckCircle } from 'lucide-react';
    import { Separator } from '@/components/ui/separator';

    const TutorCourseInfo = ({ courseContent = [], duration, lecturesPerWeek, isEditing, onInputChange }) => {
        const { t } = useTranslation();

        const courseContentString = Array.isArray(courseContent) ? courseContent.join(', ') : '';
        const handleContentChange = (e) => {
            const contentArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
            onInputChange('courseContent', contentArray);
        };


        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('courseContentTitle')}</CardTitle>
                  <CardDescription>{t('courseContentDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-medium text-foreground">{t('topicsCovered')}</h4>
                  {isEditing ? (
                     <Textarea
                        value={courseContentString}
                        onChange={handleContentChange}
                        placeholder={t('courseContentPlaceholder')}
                        rows={4}
                        className="text-sm border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                     />
                  ) : courseContent.length > 0 ? (
                    <ul className="list-none space-y-2 text-sm">
                      {courseContent.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-sm text-muted-foreground">{t('noTopicsListed')}</p>
                  )}
                  <Separator className="my-4" />
                   <div>
                     <h4 className="font-medium text-foreground mb-2">{t('sessionFormat')}</h4>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                           <span className="text-muted-foreground">{t('sessionDuration')}</span>
                           {isEditing ? (
                              <Input
                                 type="number"
                                 value={duration || ''}
                                 onChange={(e) => onInputChange('duration', parseInt(e.target.value) || 0)}
                                 placeholder={t('minutes')}
                                 className="h-8 text-xs border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                              />
                           ) : (
                              <p className="font-medium">{t('durationMinutes', { duration: duration || t('N/A') })}</p>
                           )}
                        </div>
                         <div className="space-y-1">
                           <span className="text-muted-foreground">{t('lecturesPerWeek')}</span>
                           {isEditing ? (
                              <Input
                                 type="number"
                                 value={lecturesPerWeek || ''}
                                 onChange={(e) => onInputChange('lecturesPerWeek', parseInt(e.target.value) || 0)}
                                 placeholder={t('count')}
                                 className="h-8 text-xs border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                              />
                           ) : (
                              <p className="font-medium">{t('lecturesCount', { count: lecturesPerWeek || t('N/A') })}</p> // Needs translation key 'lecturesCount'
                           )}
                        </div>
                     </div>
                     {!isEditing && (
                        <p className="text-xs text-muted-foreground mt-2">{t('sessionFlexibility')}</p>
                     )}
                   </div>
                </CardContent>
              </Card>
            </motion.div>
        );
    };

    export default TutorCourseInfo;
  