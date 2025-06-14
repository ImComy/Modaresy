import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MultiSelect from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap } from 'lucide-react';

const TutorTargetAudienceEditor = ({
    targetGrades = [],
    targetSectors = [],
    gradeOptions = [], 
    sectorOptions = [],
}) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    {t('targetAudience')}
                </CardTitle>
                <CardDescription>{t('targetAudienceDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Target Grades */}
                <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                        <GraduationCap size={16} className="text-muted-foreground" />
                        {t('targetGrades')}
                    </h4>{ targetGrades.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {targetGrades.map((gradeValue, index) => {
                                const gradeLabel = gradeOptions.find(opt => opt.value === gradeValue)?.label || gradeValue;
                                return <Badge key={index} variant="outline">{gradeLabel}</Badge>;
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('noTargetGrades')}</p>
                    )}
                </div>

                {/* Target Sectors */}
                <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                        <Users size={16} className="text-muted-foreground" />
                        {t('targetSectors')}
                    </h4>{ targetSectors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {targetSectors.map((sectorValue, index) => {
                                    const sectorLabel = sectorOptions.find(opt => opt.value === sectorValue)?.label || sectorValue;
                                return <Badge key={index} variant="outline">{sectorLabel}</Badge>;
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('noTargetSectors')}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TutorTargetAudienceEditor;
