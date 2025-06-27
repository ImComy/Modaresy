import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Table2, Clock3, Trash2, Plus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import MultiSelect from '@/components/ui/multi-select';
import CustomAccordion from '@/components/ui/accordion';

const SUBJECTS = ['Math', 'Science', 'English'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SlotItem = ({ slot, index, onChange, onDelete, isFreeTime }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-card shadow-md rounded-xl p-4 space-y-4 border border-border">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>{t('Days')}</Label>
          <MultiSelect
            options={DAYS.map((d) => ({
              label: t(`days.${d}`),
              value: d,
            }))}
            selected={slot.days}
            onChange={(val) => onChange(index, 'days', val)}
            placeholder={t('Select days')}
          />
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-1">
            <Label>{t('Start')}</Label>
            <Input
              type="time"
              value={slot.start}
              onChange={(e) => onChange(index, 'start', e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label>{t('End')}</Label>
            <Input
              type="time"
              value={slot.end}
              onChange={(e) => onChange(index, 'end', e.target.value)}
            />
          </div>
        </div>
      </div>

      {!isFreeTime && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`full-${index}`}
              checked={slot.isFull}
              onCheckedChange={(val) => onChange(index, 'isFull', val)}
            />
            <Label htmlFor={`full-${index}`} className="text-sm text-muted-foreground">
              {t('Group is full')}
            </Label>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="ml-auto hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      )}
      {isFreeTime && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="ml-auto hover:bg-destructive/10"
        >
          <Trash2 className="w-5 h-5 text-destructive" />
        </Button>
      )}
    </div>
  );
};

const TimeSlotCard = ({ title, icon, slots, setSlots, isFreeTime }) => {
  const { t } = useTranslation();

  const handleChange = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const addSlot = () => {
    const newSlot = isFreeTime
      ? { days: [], start: '', end: '' }
      : { days: [], start: '', end: '', isFull: false };
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-muted/10 border border-border shadow-md">
      <CardHeader className="-mb-2">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.map((slot, index) => (
          <SlotItem
            key={index}
            index={index}
            slot={slot}
            onChange={handleChange}
            onDelete={removeSlot}
            isFreeTime={isFreeTime}
          />
        ))}

        <Button
          onClick={addSlot}
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary hover:text-white transition"
        >
          <Plus className="w-4 h-4 mr-2" /> {t('Add Time Slot')}
        </Button>
      </CardContent>
    </Card>
  );
};

const GroupsAndTablesSection = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [appointments, setAppointments] = useState({
    Math: [{ days: [], start: '', end: '', isFull: false }],
    Science: [{ days: [], start: '', end: '', isFull: false }],
    English: [{ days: [], start: '', end: '', isFull: false }],
  });
  const [freeTimes, setFreeTimes] = useState([{ days: [], start: '', end: '' }]);

  const accordionItems = SUBJECTS.map((subject) => ({
    title: t(`subjects.${subject}`),
    content: (
      <TimeSlotCard
        title={t('Lesson Appointments')}
        icon={<Table2 className="w-6 h-6" />}
        slots={appointments[subject]}
        setSlots={(newSlots) =>
          setAppointments({ ...appointments, [subject]: newSlots })
        }
      />
    ),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <CustomAccordion items={accordionItems} />
      </div>
      <TimeSlotCard
        title={t('Free Time')}
        icon={<Clock3 className="w-6 h-6" />}
        slots={freeTimes}
        setSlots={setFreeTimes}
        isFreeTime
      />
    </motion.div>
  );
};

export default GroupsAndTablesSection;