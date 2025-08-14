import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, GraduationCap, Trash, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AddSubjectCard = ({ 
  formData = { subjects: [] }, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject, 
  constants, 
  t 
}) => {
  const [newSubject, setNewSubject] = useState({
    education_system: '',
    grade: '',
    sector: '',
    language: '',
    name: '',
    years_experience: 1
  })

  const [editingIndex, setEditingIndex] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    if (editingIndex === null) {
      setNewSubject({
        education_system: '',
        grade: '',
        sector: '',
        language: '',
        name: '',
        years_experience: 1
      });
    } else {
      const subject = formData.subjects[editingIndex]; // Changed to subjects
      if (subject) {
        setNewSubject({
          education_system: subject.education_system || '',
          grade: subject.grade || '',
          sector: subject.sector || '',
          language: subject.language || '',
          name: subject.name || '',
          years_experience: subject.years_experience || 1
        });
      }
    }
  }, [editingIndex, formData.subjects]);

  // Update available options when dependencies change
  useEffect(() => {
    if (newSubject.education_system && constants?.EducationStructure) {
      const grades = constants.EducationStructure[newSubject.education_system]?.grades || [];
      setAvailableGrades(grades);
      
      const languages = constants.EducationStructure[newSubject.education_system]?.languages || ['Arabic'];
      setAvailableLanguages(languages);
      
      // Only reset if not in edit mode
      if (editingIndex === null) {
        setNewSubject(prev => ({ 
          ...prev, 
          grade: '', 
          sector: '',
          language: languages.includes(prev.language) ? prev.language : '',
          name: ''
        }));
      }
    }
  }, [newSubject.education_system, constants, editingIndex]);

  useEffect(() => {
    if (newSubject.grade && newSubject.education_system && constants?.EducationStructure) {
      const sectors = constants.EducationStructure[newSubject.education_system]?.sectors[newSubject.grade] || [];
      setAvailableSectors(sectors);
      
      // Only reset if not in edit mode
      if (editingIndex === null) {
        setNewSubject(prev => ({ ...prev, sector: '', name: '' }));
      }
    }
  }, [newSubject.grade, newSubject.education_system, constants, editingIndex]);

  useEffect(() => {
    if (newSubject.education_system && newSubject.grade && newSubject.sector && newSubject.language) {
      const systemSubjects = constants?.SubjectsBySystem?.[newSubject.education_system] || {};
      let subjects = [];
      
      try {
        subjects = newSubject.grade === 'Secondary 1' 
          ? systemSubjects['Secondary 1'] || []
          : systemSubjects[newSubject.grade]?.[newSubject.sector] || [];
      } catch (error) {
        console.error('Error fetching subjects:', error);
        subjects = [];
      }
      
      setAvailableSubjects(subjects);
    } else {
      setAvailableSubjects([]);
    }
  }, [newSubject.education_system, newSubject.grade, newSubject.sector, newSubject.language, constants]);

  const handleAddSubject = async () => {
    // Validate all required fields
    if (!newSubject.name || 
        !newSubject.education_system || 
        !newSubject.grade || 
        !newSubject.sector || 
        !newSubject.language) {
      console.error('Missing required fields:', newSubject);
      return;
    }

    try {
      // Create a new subject object with complete data
      const subjectData = {
        ...newSubject,
        name: newSubject.name,
        education_system: newSubject.education_system,
        grade: newSubject.grade,
        sector: newSubject.sector,
        language: newSubject.language,
        years_experience: newSubject.years_experience,
        private_pricing: {
          price: 0,
          currency: 'EGP',
          period: 'session'
        }
      };

      console.log('Adding subject:', subjectData);
      // Call the parent's addSubject function
      await onAddSubject(subjectData);
      
      setNewSubject({
        education_system: '',
        grade: '',
        sector: '',
        language: '',
        name: '',
        years_experience: 1
      });
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleDelete = async (index) => {
    try {
      await onDeleteSubject(index);
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  };

  const handleEditSubject = (index) => {
    setEditingIndex(index);
  };

  const handleUpdateSubject = async () => {
    // Validate all required fields
    if (!newSubject.name || 
        !newSubject.education_system || 
        !newSubject.grade || 
        !newSubject.sector || 
        !newSubject.language || 
        editingIndex === null) {
      console.error('Missing required fields:', newSubject);
      return;
    }

    try {
      await onUpdateSubject(editingIndex, newSubject);
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const renderSubjectDetails = (subject, index) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="rounded-xl p-4 bg-muted/20 border border-muted"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span className="font-medium">
              {subject.name || t('unnamedSubject')} {/* Direct access */}
            </span>
          </div>
          <div className="flex gap-1">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditSubject(index)}
              >
                <Edit size={16} className="text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(index)}
              >
                <Trash size={16} className="text-destructive" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{t('System')}: </span>
            <span>{subject.education_system || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Grade')}: </span>
            <span>{subject.grade || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Sector')}: </span>
            <span>{subject.sector || t('notSpecified')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Language')}: </span>
            <span>{subject.language || t('notSpecified')}</span>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">{t('yearsExperience')}: </span>
          <span>{subject.years_experience || 1}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn(
      "w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 z-30 mt-0 md:-mt-32",
      "max-h-[400px] overflow-y-auto flex-1 min-w-0 md:max-w-xs"
    )}>
      <div className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
        <GraduationCap size={20} />
        {editingIndex !== null ? t('editSubject') : t('addNewSubject')}
      </div>

      <div className="space-y-3">
        {/* Education System Select */}
        <div className="space-y-1">
          <Label className="text-xs">{t('educationSystem')}</Label>
          <Select
            value={newSubject.education_system}
            onValueChange={(val) => setNewSubject(prev => ({ ...prev, education_system: val }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t('selectSystem')} />
            </SelectTrigger>
            <SelectContent>
              {constants?.Education_Systems?.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Select */}
        {newSubject.education_system && (
          <div className="space-y-1">
            <Label className="text-xs">{t('grade')}</Label>
            <Select
              value={newSubject.grade}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, grade: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('selectGrade')} />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sector Select */}
        {newSubject.grade && (
          <div className="space-y-1">
            <Label className="text-xs">{t('sector')}</Label>
            <Select
              value={newSubject.sector}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, sector: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('selectSector')} />
              </SelectTrigger>
              <SelectContent>
                {availableSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Language Select */}
        {newSubject.education_system && (
          <div className="space-y-1">
            <Label className="text-xs">{t('language')}</Label>
            <Select
              value={newSubject.language}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, language: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject Select */}
        {newSubject.sector && (
          <div className="space-y-1">
            <Label className="text-xs">{t('subject')}</Label>
            <Select
              value={newSubject.name}
              onValueChange={(val) => setNewSubject(prev => ({ ...prev, name: val }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={
                  availableSubjects.length === 0 ? t('noSubjectsAvailable') : t('selectSubject')
                }>
                  {newSubject.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Years Experience Input */}
        <div className="space-y-1">
          <Label className="text-xs">{t('yearsExperience')}</Label>
          <Input
            type="number"
            min="1"
            max="50"
            value={newSubject.years_experience}
            onChange={(e) => setNewSubject(prev => ({ 
              ...prev, 
              years_experience: Math.max(1, parseInt(e.target.value) || 1)
            }))}
            className="h-10"
          />
        </div>

        {/* Add/Update Buttons */}
        {editingIndex !== null ? (
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              className="w-full h-10"
              onClick={handleUpdateSubject}
              disabled={!newSubject.name}
            >
              <Check size={16} className="mr-1" />
              {t('updateSubject')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={cancelEdit}
            >
              {t('cancel')}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full h-10 mt-2"
            onClick={handleAddSubject}
            disabled={!newSubject.name}
          >
            <Plus size={16} className="mr-1" />
            {t('addSubject')}
          </Button>
        )}
      </div>

      {/* Current Subjects List */}
      {formData.subjects?.length > 0 && ( // Changed to subjects
        <div className="mt-6">
          <h3 className="font-semibold mb-3">{t('yourSubjects')}</h3>
          <div className="flex flex-col gap-3">
            {formData.subjects.map((subject, index) => ( // Changed to subjects
              renderSubjectDetails(subject, index)
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubjectCard;