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
  formData = { subject_profiles: [] }, 
  handleSubjectChange, 
  addSubject, 
  removeSubject, 
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
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Update available grades when education system changes
  useEffect(() => {
    if (newSubject.education_system && constants?.EducationStructure) {
      const grades = constants.EducationStructure[newSubject.education_system]?.grades || [];
      setAvailableGrades(grades);
      setNewSubject(prev => ({ 
        ...prev, 
        grade: '', 
        sector: '',
        language: '',
        name: ''
      }));
    }
  }, [newSubject.education_system, constants]);

  // Update available sectors when grade changes
  useEffect(() => {
    if (newSubject.grade && newSubject.education_system && constants?.EducationStructure) {
      const sectors = constants.EducationStructure[newSubject.education_system]?.sectors[newSubject.grade] || [];
      setAvailableSectors(sectors);
      setNewSubject(prev => ({ 
        ...prev, 
        sector: '',
        language: '',
        name: ''
      }));
    }
  }, [newSubject.grade, newSubject.education_system, constants]);

  // Update available languages when education system changes
  useEffect(() => {
    if (newSubject.education_system && constants?.EducationStructure) {
      const languages = constants.EducationStructure[newSubject.education_system]?.languages || ['Arabic'];
      setAvailableLanguages(languages);
      setNewSubject(prev => ({ 
        ...prev, 
        language: languages.includes(prev.language) ? prev.language : '',
        name: ''
      }));
    }
  }, [newSubject.education_system, constants]);

  // Update available subjects when all other fields are selected
  useEffect(() => {
    if (newSubject.education_system && 
        newSubject.grade && 
        newSubject.sector && 
        newSubject.language &&
        constants?.SubjectsBySystem) {
      
      const systemSubjects = constants.SubjectsBySystem[newSubject.education_system];
      let subjects = [];
      
      try {
        if (newSubject.grade === 'Secondary 1') {
          subjects = systemSubjects?.['Secondary 1'] || [];
        } else {
          const gradeSubjects = systemSubjects?.[newSubject.grade];
          if (gradeSubjects && typeof gradeSubjects === 'object') {
            subjects = gradeSubjects[newSubject.sector] || [];
          } else {
            subjects = [];
          }
        }
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
    if (!newSubject.name || !newSubject.education_system) return;

    const subjectToAdd = {
        subject_id: {
        ...newSubject,
        _id: Math.random().toString(36).substring(2, 9) 
        },
        private_pricing: {
        price: 0,
        currency: '',
        period: 'session'
        }
    };

    try {
        await addSubject(subjectToAdd);
        setNewSubject({
        education_system: '',
        grade: '',
        sector: '',
        language: '',
        name: '',
        years_experience: 1
        });
    } catch (error) {
        console.error('Failed to add subject:', error);
    }
    };

  const handleEditSubject = (index) => {
    const subject = formData.subject_profiles[index];
    setNewSubject({
      education_system: subject.subject_id.education_system,
      grade: subject.subject_id.grade,
      sector: subject.subject_id.sector,
      language: subject.subject_id.language,
      name: subject.subject_id.name,
      years_experience: subject.subject_id.years_experience || 1
    });
    setEditingIndex(index);
  };

  const handleUpdateSubject = async () => {
    if (!newSubject.name || !newSubject.education_system) return;

    const updatedSubject = {
        subject_id: {
        ...newSubject,
        _id: formData.subject_profiles[editingIndex].subject_id._id
        },
        private_pricing: formData.subject_profiles[editingIndex].private_pricing
    };

    try {
        await handleSubjectChange(
        editingIndex,
        'subject_id',
        updatedSubject.subject_id
        );
        setEditingIndex(null);
        setNewSubject({
        education_system: '',
        grade: '',
        sector: '',
        language: '',
        name: '',
        years_experience: 1
        });
    } catch (error) {
        console.error('Failed to update subject:', error);
    }
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
        <Select
          value={newSubject.education_system}
          onValueChange={(val) => setNewSubject(prev => ({ ...prev, education_system: val }))}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('educationSystem')} />
          </SelectTrigger>
          <SelectContent>
            {constants?.Education_Systems?.map((system) => (
              <SelectItem key={system} value={system} className="text-xs">
                {system}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={newSubject.grade}
          onValueChange={(val) => setNewSubject(prev => ({ ...prev, grade: val }))}
          disabled={!newSubject.education_system}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('grade')} />
          </SelectTrigger>
          <SelectContent>
            {availableGrades.map((grade) => (
              <SelectItem key={grade} value={grade} className="text-xs">
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={newSubject.sector}
          onValueChange={(val) => setNewSubject(prev => ({ ...prev, sector: val }))}
          disabled={!newSubject.grade}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('sector')} />
          </SelectTrigger>
          <SelectContent>
            {availableSectors.map((sector) => (
              <SelectItem key={sector} value={sector} className="text-xs">
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={newSubject.language}
          onValueChange={(val) => setNewSubject(prev => ({ ...prev, language: val }))}
          disabled={!newSubject.education_system}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('language')} />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang} value={lang} className="text-xs">
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={newSubject.name}
          onValueChange={(val) => setNewSubject(prev => ({ ...prev, name: val }))}
          disabled={!newSubject.sector || availableSubjects.length === 0}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={
              availableSubjects.length === 0 && newSubject.sector 
                ? t('noSubjectsAvailable') 
                : t('subject')
            } />
          </SelectTrigger>
          <SelectContent>
            {availableSubjects.map((subject) => (
              <SelectItem key={subject} value={subject} className="text-xs">
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Label className="text-xs">{t('yearsExperience')}:</Label>
          <Input
            type="number"
            min="1"
            max="50"
            value={newSubject.years_experience}
            onChange={(e) => setNewSubject(prev => ({ 
              ...prev, 
              years_experience: parseInt(e.target.value) || 1 
            }))}
            className="h-8 w-16 text-xs"
          />
        </div>

        {editingIndex !== null ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleUpdateSubject}
              disabled={!newSubject.name}
            >
              <Check size={14} className="mr-1" />
              {t('updateSubject')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs"
              onClick={() => {
                setEditingIndex(null);
                setNewSubject({
                  education_system: '',
                  grade: '',
                  sector: '',
                  language: '',
                  name: '',
                  years_experience: 1
                });
              }}
            >
              {t('cancel')}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full h-8 text-xs"
            onClick={handleAddSubject}
            disabled={!newSubject.name}
          >
            <Plus size={14} className="mr-1" />
            {t('addSubject')}
          </Button>
        )}
      </div>

      {formData.subject_profiles?.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-col gap-3">
            {formData.subject_profiles.map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-primary/20 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap size={18} className="text-primary shrink-0" />
                  <span className="text-base font-semibold">
                    {subject.subject_id?.name || t('unnamedSubject')}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditSubject(index)}
                    >
                      <Edit size={14} className="text-primary" />
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={async () => {
                        try {
                        await removeSubject(index);
                        } catch (error) {
                        console.error('Failed to remove subject:', error);
                        }
                    }}
                    >
                    <Trash size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span>{t('System')}:</span>
                      <span className="font-medium">{subject.subject_id?.education_system}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{t('Grade')}:</span>
                      <span className="font-medium">{subject.subject_id?.grade}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span>{t('Sector')}:</span>
                      <span className="font-medium">{subject.subject_id?.sector}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{t('Language')}:</span>
                      <span className="font-medium">{subject.subject_id?.language}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span>{t('yearsExperience')}: </span>
                  <span className="font-medium">{subject.subject_id?.years_experience || 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubjectCard;