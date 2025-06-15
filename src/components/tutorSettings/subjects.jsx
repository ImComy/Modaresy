import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus, BookOpen, GraduationCap, Type, FileText, Clock, Calendar, BadgeDollarSign, UserCheck, Percent, StickyNote } from 'lucide-react';
import CustomAccordion from '@/components/ui/accordion';

const SubjectsSection = ({ subjects = [], onChange }) => {
  const handleFieldChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleNestedChange = (index, section, field, value) => {
    const updated = [...subjects];
    if (!updated[index][section]) updated[index][section] = {};
    updated[index][section][field] = value;
    onChange(updated);
  };

  const handleAddSubject = () => {
    const newSubject = {
      subject: '',
      grade: '',
      type: '',
      bio: '',
      duration: '',
      lecturesPerWeek: '',
      yearsExp: '',
      price: '',
      private: { price: '', note: '' },
      offer: { percentage: '', from: '', to: '', description: '' },
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
        <span>{subject.subject || 'Untitled Subject'} – Grade {subject.grade || '?'} - Type {subject.type || '?'}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation(); // prevents accordion toggle
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
          <Label className="flex items-center gap-2">
            <BookOpen size={16} /> Subject
          </Label>
          <Input
            value={subject.subject}
            onChange={(e) => handleFieldChange(idx, 'subject', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <GraduationCap size={16} /> Grade
          </Label>
          <Input
            value={subject.grade}
            onChange={(e) => handleFieldChange(idx, 'grade', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <Type size={16} /> Type
          </Label>
          <Input
            value={subject.type}
            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <FileText size={16} /> Bio
          </Label>
          <Textarea
            value={subject.bio}
            onChange={(e) => handleFieldChange(idx, 'bio', e.target.value)}
          />
        </div>

        {/* Experience & Pricing */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock size={16} /> Duration (min)
          </Label>
          <Input
            type="number"
            value={subject.duration}
            onChange={(e) => handleFieldChange(idx, 'duration', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <Calendar size={16} /> Lectures/Week
          </Label>
          <Input
            type="number"
            value={subject.lecturesPerWeek}
            onChange={(e) => handleFieldChange(idx, 'lecturesPerWeek', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <UserCheck size={16} /> Years Experience
          </Label>
          <Input
            type="number"
            value={subject.yearsExp}
            onChange={(e) => handleFieldChange(idx, 'yearsExp', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <BadgeDollarSign size={16} /> Price (per group session)
          </Label>
          <Input
            type="number"
            value={subject.price}
            onChange={(e) => handleFieldChange(idx, 'price', e.target.value)}
          />
        </div>

        {/* Private Session */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <BadgeDollarSign size={16} /> Private Price
          </Label>
          <Input
            type="number"
            value={subject.private?.price || ''}
            onChange={(e) => handleNestedChange(idx, 'private', 'price', e.target.value)}
          />
          <Label className="flex items-center gap-2">
            <StickyNote size={16} /> Private Note
          </Label>
          <Textarea
            value={subject.private?.note || ''}
            onChange={(e) => handleNestedChange(idx, 'private', 'note', e.target.value)}
          />
        </div>

        {/* Offer Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Percent size={16} /> Offer %
          </Label>
          <Input
            type="number"
            value={subject.offer?.percentage || ''}
            onChange={(e) => handleNestedChange(idx, 'offer', 'percentage', e.target.value)}
          />
          <Label>From</Label>
          <Input
            type="date"
            value={subject.offer?.from || ''}
            onChange={(e) => handleNestedChange(idx, 'offer', 'from', e.target.value)}
          />
          <Label>To</Label>
          <Input
            type="date"
            value={subject.offer?.to || ''}
            onChange={(e) => handleNestedChange(idx, 'offer', 'to', e.target.value)}
          />
          <Label>Description</Label>
          <Textarea
            value={subject.offer?.description || ''}
            onChange={(e) => handleNestedChange(idx, 'offer', 'description', e.target.value)}
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
