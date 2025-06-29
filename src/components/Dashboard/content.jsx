import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SearchableSelectContent } from '@/components/ui/searchSelect';

const SUBJECTS = [
  { value: 'Math', label: 'math', defaultLabel: 'Math' },
  { value: 'Science', label: 'science', defaultLabel: 'Science' },
  { value: 'English', label: 'english', defaultLabel: 'English' },
  { value: 'SAT', label: 'sat', defaultLabel: 'SAT' },
  { value: 'Thanaweya Amma', label: 'thanaweyaAmma', defaultLabel: 'Thanaweya Amma' },
];

const ContentManagementSection = () => {
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');

  const [content, setContent] = useState({
    sessionDuration: '',
    lecturesPerWeek: '',
    note: '',
  });

  const handleAddTopic = () => {
    const trimmed = newTopic.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = {
      subject,
      topics,
      ...content,
    };
    console.log('Saved content:', payload);
    // Hook to API goes here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="border border-border/60 bg-background/50 shadow-xl backdrop-blur-lg rounded-2xl p-6">
        <CardHeader className="pb-4 -mt-6">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <FileText className="w-10 h-10" />
            {t('courseContentAndFormat', 'Course Content & Format')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Subject Dropdown */}
          <div className="space-y-1">
            <Label className="text-base">{t('subject', 'Subject')}</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="rounded-lg" error={!subject}>
                <SelectValue placeholder={t('chooseSubjectPlaceholder', 'Choose Subject')} />
              </SelectTrigger>
              <SearchableSelectContent
                searchPlaceholder={t('searchSubjectPlaceholder', 'Search subject...')}
                items={SUBJECTS.map((subj) => ({
                  value: subj.value,
                  label: t(subj.label, subj.defaultLabel),
                }))}
              />
            </Select>
          </div>

          {/* Topic stack */}
          <div className="space-y-2">
            <Label className="text-base">{t('topicsCovered', 'Topics Covered')}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t('addTopicPlaceholder', 'Add a topic (e.g. Trigonometry)')}
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              />
              <Button
                variant="outline"
                onClick={handleAddTopic}
                className="px-4 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('add', 'Add')}
              </Button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {topics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm shadow-sm border border-border"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveTopic(index)}
                      className="text-destructive hover:opacity-70"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration & Frequency */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <Label className="text-base">{t('sessionDuration', 'Session Duration')}</Label>
              <Input
                placeholder={t('sessionDurationPlaceholder', 'e.g. 60 min / session')}
                value={content.sessionDuration}
                onChange={(e) => handleChange('sessionDuration', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-base">{t('lecturesPerWeek', 'Lectures Per Week')}</Label>
              <Input
                placeholder={t('lecturesPerWeekPlaceholder', 'e.g. 2 times')}
                value={content.lecturesPerWeek}
                onChange={(e) => handleChange('lecturesPerWeek', e.target.value)}
              />
            </div>
          </div>

          {/* Optional note */}
          <div className="space-y-1 pt-2">
            <Label className="text-base">{t('additionalNotes', 'Additional Notes')}</Label>
            <Input
              placeholder={t('additionalNotesPlaceholder', 'e.g. Flexible scheduling available upon request')}
              value={content.note}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentManagementSection;