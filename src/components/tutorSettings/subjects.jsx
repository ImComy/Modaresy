import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus, BookOpen, GraduationCap, Type, FileText, UserCheck } from 'lucide-react';
import CustomAccordion from '@/components/ui/accordion';

const SubjectsSection = ({ subjects = [], onChange, errors = {} }) => {
  const handleFieldChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleAddSubject = () => {
    const newSubject = {
      subject: '',
      grade: '',
      type: '',
      bio: '',
      yearsExp: '',
    };
    onChange([...subjects, newSubject]);
  };

  const handleDeleteSubject = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    onChange(updated);
  };

  const accordionItems = subjects.map((subject, idx) => ({
    title: (
      <div className="flex justify-between items-center w-full">
        <span>
          {subject.subject || 'Untitled Subject'} – Grade {subject.grade || '?'} - Type {subject.type || '?'}
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
        {/* Subject Info */}
        <div className="space-y-3 col-span-2">
          <Label className={`flex items-center gap-2 ${errors[idx]?.subject ? 'text-red-600' : ''}`}>
            <BookOpen size={16} /> Subject {idx === 0 && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={subject.subject}
            onChange={(e) => handleFieldChange(idx, 'subject', e.target.value)}
            className={errors[idx]?.subject ? 'border-red-500' : ''}
          />
          <Label className={`flex items-center gap-2 ${errors[idx]?.grade ? 'text-red-600' : ''}`}>
            <GraduationCap size={16} /> Grade {idx === 0 && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={subject.grade}
            onChange={(e) => handleFieldChange(idx, 'grade', e.target.value)}
            className={errors[idx]?.grade ? 'border-red-500' : ''}
          />
          <Label className={`flex items-center gap-2 ${errors[idx]?.type ? 'text-red-600' : ''}`}>
            <Type size={16} /> Type {idx === 0 && <span className="text-red-600">*</span>}
          </Label>
          <Input
            value={subject.type}
            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
            className={errors[idx]?.type ? 'border-red-500' : ''}
          />
          <Label className={`flex items-center gap-2 ${errors[idx]?.bio ? 'text-red-600' : ''}`}>
            <FileText size={16} /> Bio {idx === 0 && <span className="text-red-600">*</span>}
          </Label>
          <Textarea
            value={subject.bio}
            onChange={(e) => handleFieldChange(idx, 'bio', e.target.value)}
            className={errors[idx]?.bio ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <Label className={`flex items-center gap-2 ${errors[idx]?.yearsExp ? 'text-red-600' : ''}`}>
            <UserCheck size={16} /> Years Experience {idx === 0 && <span className="text-red-600">*</span>}
          </Label>
          <Input
            type="number"
            value={subject.yearsExp}
            onChange={(e) => handleFieldChange(idx, 'yearsExp', e.target.value)}
            className={errors[idx]?.yearsExp ? 'border-red-500' : ''}
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
      {subjects.length === 0 && (
        <p className="text-red-600">At least one subject with all fields filled is required.</p>
      )}
      <CustomAccordion items={accordionItems} />
    </div>
  );
};

export default SubjectsSection;