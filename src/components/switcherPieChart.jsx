import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import StudentsPieChart from './pieChart';
import { useTranslation } from 'react-i18next';

const StudentsPieChartSwitcher = ({ data }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('subject');

  const views = [
    { key: 'subject', label: t('Subject') },
    { key: 'grade', label: t('Grade') },
    { key: 'sector', label: t('Sector') },
  ];

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap justify-center gap-2">
        {views.map(({ key, label }) => (
          <Button
            key={key}
            variant={view === key ? 'default' : 'outline'}
            onClick={() => setView(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="w-full max-w-xl mx-auto">
        <StudentsPieChart data={data[view]} title={views.find(v => v.key === view)?.label} />
      </div>
    </div>
  );
};

export default StudentsPieChartSwitcher;
