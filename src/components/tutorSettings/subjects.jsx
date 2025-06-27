import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus, BookOpen, GraduationCap, Type, FileText, UserCheck, Trash2 } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SUBJECT_OPTIONS = [
  { value: 'Mathematics', label: 'mathematics', defaultLabel: 'Mathematics' },
  { value: 'Science', label: 'science', defaultLabel: 'Science' },
  { value: 'English', label: 'english', defaultLabel: 'English' },
  { value: 'History', label: 'history', defaultLabel: 'History' },
  { value: 'Computer', label: 'computer', defaultLabel: 'Computer' },
];

const GRADE_OPTIONS = [
  { value: '1', label: 'grade1', defaultLabel: '1' },
  { value: '2', label: 'grade2', defaultLabel: '2' },
  { value: '3', label: 'grade3', defaultLabel: '3' },
  { value: '4', label: 'grade4', defaultLabel: '4' },
  { value: '5', label: 'grade5', defaultLabel: '5' },
  { value: '6', label: 'grade6', defaultLabel: '6' },
  { value: '7', label: 'grade7', defaultLabel: '7' },
  { value: '8', label: 'grade8', defaultLabel: '8' },
  { value: '9', label: 'grade9', defaultLabel: '9' },
  { value: '10', label: 'grade10', defaultLabel: '10' },
  { value: '11', label: 'grade11', defaultLabel: '11' },
  { value: '12', label: 'grade12', defaultLabel: '12' },
];

const TYPE_OPTIONS = [
  { value: 'Private', label: 'private', defaultLabel: 'Private' },
  { value: 'Group', label: 'group', defaultLabel: 'Group' },
  { value: 'Online', label: 'online', defaultLabel: 'Online' },
  { value: 'General - scientific', label: 'generalScientific', defaultLabel: 'General - scientific' },
];

const SubjectsSection = ({ subjects = [], onChange }) => {
  const { t } = useTranslation();

  const handleFieldChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddSubject = () => {
    onChange([
      ...subjects,
      {
        subject: '',
        grade: '',
        type: '',
        bio: '',
        yearsExp: '',
      },
    ]);
  };

  const handleDeleteSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index));
  };

  const renderSelect = (labelKey, icon, options, value, onChange, placeholderKey) => {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          {icon} {t(labelKey, labelKey)}
        </Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg transition-all duration-300">
            <SelectValue placeholder={t(placeholderKey, `Select ${labelKey}`)} />
          </SelectTrigger>
          <SearchableSelectContent
            searchPlaceholder={t(`${labelKey}SearchPlaceholder`, `Search ${labelKey}...`)}
            items={options.map((opt) => ({
              value: opt.value,
              label: t(opt.label, opt.defaultLabel),
            }))}
          />
        </Select>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-start items-start flex-col gap-2 md:gap-0 md:flex-row md:justify-between md:items-center">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          {t('subjectsYouTeach', 'Subjects You Teach')}
        </h2>
          <Button
            variant="outline"
            onClick={handleAddSubject}
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            {t('addSubject', 'Add Subject')}
          </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative bg-background/90 backdrop-blur-lg border border-border/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Card className="border-0 bg-transparent">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-xl">
                  <CardTitle className="flex justify-between items-center text-lg font-semibold text-foreground">
                    <span>
                      {subject.subject
                        ? t(subject.subject.toLowerCase(), subject.subject)
                        : t('untitledSubject', 'Untitled Subject')}
                      {' – '}
                      {t('grade', 'Grade')} {subject.grade || '?'}
                      {subject.type && (
                        <>
                          {' – '}
                          {t(subject.type.toLowerCase().replace(/\s+/g, ''), subject.type)}
                        </>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubject(index)}
                      className="hover:bg-destructive/20 rounded-full"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderSelect(
                      'subject',
                      <BookOpen size={16} className="text-primary" />,
                      SUBJECT_OPTIONS,
                      subject.subject,
                      (val) => handleFieldChange(index, 'subject', val),
                      'selectSubjectPlaceholder'
                    )}
                    {renderSelect(
                      'grade',
                      <GraduationCap size={16} className="text-primary" />,
                      GRADE_OPTIONS,
                      subject.grade,
                      (val) => handleFieldChange(index, 'grade', val),
                      'selectGradePlaceholder'
                    )}
                    {renderSelect(
                      'type',
                      <Type size={16} className="text-primary" />,
                      TYPE_OPTIONS,
                      subject.type,
                      (val) => handleFieldChange(index, 'type', val),
                      'selectTypePlaceholder'
                    )}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <FileText size={16} className="text-primary" />
                        {t('bio', 'Bio')}
                      </Label>
                      <Textarea
                        placeholder={t('bioPlaceholder', 'Describe your teaching approach...')}
                        value={subject.bio}
                        onChange={(e) => handleFieldChange(index, 'bio', e.target.value)}
                        className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <UserCheck size={16} className="text-primary" />
                        {t('yearsExperience', 'Years of Experience')}
                      </Label>
                      <Input
                        type="number"
                        placeholder={t('yearsExperiencePlaceholder', 'e.g. 5')}
                        value={subject.yearsExp}
                        onChange={(e) => handleFieldChange(index, 'yearsExp', e.target.value)}
                        className="bg-input border border-border/50 focus:ring-2 focus:ring-primary rounded-lg transition-all duration-300"
                      />
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={subject.yearsExp || 0}
                        onChange={(e) => handleFieldChange(index, 'yearsExp', e.target.value)}
                        className="w-full h-2 bg-muted rounded-lg cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SubjectsSection;