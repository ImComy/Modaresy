import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus, BookOpen, GraduationCap, Type, FileText, UserCheck } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import CustomAccordion from '@/components/ui/accordion';
import {SearchableSelectContent} from '@/components/ui/searchSelect';

const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'English', 'History', 'Computer'];
const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const TYPE_OPTIONS = ['Private', 'Group', 'Online', 'General - scientific'];

const SubjectsSection = ({ subjects = [], onChange }) => {
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

const renderSelect = (label, icon, options, value, onChange) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon} {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SearchableSelectContent
          searchPlaceholder={`Search ${label}...`}
          items={options.map(opt => ({
            value: opt,
            label: opt,
          }))}
        />
      </Select>
    </div>
  );
};

  const accordionItems = subjects.map((subject, idx) => ({
    title: (
      <div className="flex justify-between items-center w-full">
        <span>
          {subject.subject || 'Untitled Subject'} – Grade {subject.grade || '?'} – Type {subject.type || '?'}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSubject(idx);
          }}
        >
          <X className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    ),
    content: (
      <div className="grid gap-6 md:grid-cols-2 p-4 border rounded-lg bg-muted/30">
        <div className="space-y-4 col-span-2">
          {renderSelect(
            'Subject',
            <BookOpen size={16} />,
            SUBJECT_OPTIONS,
            subject.subject,
            (val) => handleFieldChange(idx, 'subject', val)
          )}
          {renderSelect(
            'Grade',
            <GraduationCap size={16} />,
            GRADE_OPTIONS,
            subject.grade,
            (val) => handleFieldChange(idx, 'grade', val)
          )}
          {renderSelect(
            'Type',
            <Type size={16} />,
            TYPE_OPTIONS,
            subject.type,
            (val) => handleFieldChange(idx, 'type', val)
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText size={16} /> Bio
            </Label>
            <Textarea
              value={subject.bio}
              onChange={(e) => handleFieldChange(idx, 'bio', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <UserCheck size={16} /> Years Experience
          </Label>
          <Input
            type="number"
            value={subject.yearsExp}
            onChange={(e) => handleFieldChange(idx, 'yearsExp', e.target.value)}
          />
        </div>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subjects You Teach</h2>
        <Button variant="outline" onClick={handleAddSubject}>
          <Plus className="w-4 h-4 mr-1" /> Add Subject
        </Button>
      </div>
      <CustomAccordion items={accordionItems} />
    </div>
  );
};

export default SubjectsSection;