
    import React from 'react';
    import { useTranslation } from 'react-i18next';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { CalendarDays, Clock } from 'lucide-react';
    import { Badge } from '@/components/ui/badge';
    import { cn } from '@/lib/utils';

    const formatTime = (timeString) => {
      if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return ''; // Add validation
      const [hour, minute] = timeString.split(':');
      const hourNum = parseInt(hour);
      if (isNaN(hourNum) || isNaN(parseInt(minute))) return ''; // More validation

      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
      return `${formattedHour}:${minute} ${ampm}`;
    };

    const TutorScheduleDisplay = ({ schedule = [] }) => { // Removed isEditing prop
        const { t } = useTranslation();
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const scheduleByDay = daysOfWeek.reduce((acc, day) => {
            acc[day] = schedule.filter(slot => slot.day === day);
            // Sort slots by start time for consistent display
            acc[day].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
            return acc;
        }, {});


        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                   <div>
                     <CardTitle>{t('availabilitySchedule')}</CardTitle>
                     <CardDescription>{t('scheduleDesc')}</CardDescription>
                   </div>
                   {/* Removed Edit Button */}
                </CardHeader>
                <CardContent className="space-y-4">
                  {daysOfWeek.map(day => (
                    <div key={day}>
                      <h4 className="font-medium text-sm mb-1.5">{t(day.toLowerCase())}</h4>
                      {scheduleByDay[day].length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {scheduleByDay[day].map((slot, index) => (
                            <Badge key={index} variant="outline" className="schedule-badge">
                              <Clock size={12} className="mr-1 rtl:ml-1" />
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{t('noAvailability')}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
        );
    };

    export default TutorScheduleDisplay;
  