import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';

const TutorScheduleEditor = ({ initialSchedule = [], onScheduleChange }) => {
    const { t } = useTranslation();
    const [schedule, setSchedule] = useState(initialSchedule);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleTimeChange = (day, index, field, value) => {
        const updatedSchedule = schedule.map(slot => {
            if (slot.day === day && schedule.filter(s => s.day === day).indexOf(slot) === index) {
                return { ...slot, [field]: value };
            }
            return slot;
        });
        setSchedule(updatedSchedule);
        onScheduleChange(updatedSchedule);
    };

    const addSlot = (day) => {
        const newSlot = { day: day, startTime: '09:00', endTime: '10:00' };
        const updatedSchedule = [...schedule, newSlot];
        setSchedule(updatedSchedule);
        onScheduleChange(updatedSchedule);
    };

    const removeSlot = (day, index) => {
        const slotsForDay = schedule.filter(s => s.day === day);
        const slotToRemove = slotsForDay[index];
        const updatedSchedule = schedule.filter(slot => slot !== slotToRemove);
        setSchedule(updatedSchedule);
        onScheduleChange(updatedSchedule);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('editSchedule')}</CardTitle>
                <CardDescription>{t('scheduleEditDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {daysOfWeek.map(day => (
                    <div key={day} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">{t(day.toLowerCase())}</h4>
                            <Button variant="ghost" size="sm" onClick={() => addSlot(day)}>
                                <PlusCircle size={14} className="mr-1 rtl:ml-1" /> {t('addSlot')}
                            </Button>
                        </div>
                        {schedule.filter(slot => slot.day === day).length > 0 ? (
                            schedule.filter(slot => slot.day === day).map((slot, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input
                                        type="time"
                                        value={slot.startTime || ''}
                                        onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)}
                                        className="h-8 text-xs w-24"
                                    />
                                    <span>-</span>
                                    <Input
                                        type="time"
                                        value={slot.endTime || ''}
                                        onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)}
                                        className="h-8 text-xs w-24"
                                    />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSlot(day, index)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground">{t('noSlotsAdded')}</p>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default TutorScheduleEditor;
