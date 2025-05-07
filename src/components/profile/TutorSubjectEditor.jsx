import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/multi-select'; // Use MultiSelect
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { subjects as allSubjectsList } from '@/data/formData'; // Import all subjects

// Prepare options for MultiSelect
const subjectOptions = allSubjectsList.map(s => ({ value: s.value, label: s.label }));

const TutorSubjectEditor = ({ subjects = [], isEditing, onSubjectChange }) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    {t('subjectsTaught')}
                </CardTitle>
                <CardDescription>{t('subjectsTaughtDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <MultiSelect
                        options={subjectOptions}
                        selected={subjects} // Pass array directly
                        onChange={onSubjectChange} // Pass handler directly
                        placeholder={t('selectSubjectsPlaceholder')}
                        searchPlaceholder={t('searchSubjectsPlaceholder')}
                        emptyPlaceholder={t('noSubjectsFoundPlaceholder')}
                        className="text-sm"
                        triggerClassName="border-dashed focus-visible:ring-1 focus-visible:ring-offset-1"
                    />
                ) : subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {subjects.map((subjectValue, index) => {
                            const subjectLabel = subjectOptions.find(opt => opt.value === subjectValue)?.label || subjectValue;
                            return <Badge key={index} variant="outline">{subjectLabel}</Badge>;
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{t('noSubjectsListed')}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default TutorSubjectEditor;
