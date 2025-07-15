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
import { CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const TutorCourseInfoDisplay = ({
  courseInfo = {},
  courseContent: rawContent,
  duration: rawDuration,
  lecturesPerWeek: rawLectures
}) => {
  const { t } = useTranslation();

  const courseContent =
    rawContent || courseInfo?.courseContent || [];
  const duration =
    rawDuration ?? courseInfo?.duration;
  const lecturesPerWeek =
    rawLectures ?? courseInfo?.lecturesPerWeek;

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

          {courseContent?.length > 0 ? (
            <ul className="list-none space-y-2 text-sm">
              {courseContent.map((item, index) => (
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
                  {duration
                    ? t('durationMinutes', { duration })
                    : t('noDurationProvided')}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground">
                  {t('lecturesPerWeek')}
                </span>
                <p className="font-medium">
                  {lecturesPerWeek
                    ? t('lecturesCount', { count: lecturesPerWeek })
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

export default TutorCourseInfoDisplay;
