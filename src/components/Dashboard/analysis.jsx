import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Star,
  BookOpenCheck,
  BarChartHorizontalBig
} from 'lucide-react';
import BasicLineChart from '@/components/graph';
import StudentsPieChartSwitcher from '@/components/switcherPieChart';
import ActivityLogs from './logs';
import SettingsCompletionCard from './CompletionCard';

const AnalysisSection = () => {
  const { t, i18n } = useTranslation();

  // Debug: Log current language
  console.log('Current language:', i18n.language);

  const chartData = [11, 12, 13, 24, 5, 6, 17];
  const ratingData = [4.1, 4.3, 4.6, 4.5, 4.8, 4.9, 5.0];

  const pieChartData = {
    subject: {
      Math: 20,
      Science: 15,
      English: 10,
      History: 8,
    },
    grade: {
      '9': 6,
      '10': 12,
      '11': 14,
      '12': 15,
    },
    sector: {
      Private: 25,
      Public: 20,
      Homeschool: 5,
    },
  };

  // Debug: Log translated labels for verification
  console.log('Translated subject labels:', {
    Math: t('charts.pie.subject.Math'),
    Science: t('charts.pie.subject.Science'),
    English: t('charts.pie.subject.English'),
    History: t('charts.pie.subject.History'),
  });
  console.log('Translated switcher labels:', {
    subject: t('charts.switchers.subject'),
    grade: t('charts.switchers.grade'),
    sector: t('charts.switchers.sector'),
  });

  const hasData = chartData.length > 0 && ratingData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <SettingsCompletionCard completionPercentage={40} />

      {/* Activity Line Chart */}
      <div className="pt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
            <div className="p-6 border-b border-border/50">
              <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
                <TrendingUp className="h-6 w-6" />
                {t('charts.activity.title')}
              </h3>
              <p className="text-muted-foreground text-sm">{t('charts.activity.description')}</p>
            </div>
            <div className="h-[452px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
              {hasData ? (
                <div className="w-full" style={{ direction: 'ltr' }}>
                  <BasicLineChart
                    uData={chartData}
                    secondaryData={[21, 35, 40, 48, 55, 60, 70]}
                    xLabels={[
                      t('months.jan'),
                      t('months.feb'),
                      t('months.mar'),
                      t('months.apr'),
                      t('months.may'),
                      t('months.jun'),
                      t('months.jul')
                    ]}
                    primaryLabel={t('charts.activity.primary')}
                    secondaryLabel={t('charts.activity.secondary')}
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="text-lg font-semibold mb-1">{t('charts.empty.title')}</p>
                  <p className="text-sm">{t('charts.empty.description')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5">
          <ActivityLogs />
        </div>
      </div>

      {/* Ratings Chart */}
      <div className="flex gap-10 flex-col lg:flex-row w-full">
        <div className="w-full bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
              <Star className="h-6 w-6" />
              {t('charts.rating.title')}
            </h3>
            <p className="text-muted-foreground text-sm">{t('charts.rating.description')}</p>
          </div>
          <div className="h-[78%] pt-10 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
            <div className="w-full" style={{ direction: 'ltr' }}>
              <BasicLineChart
                uData={ratingData}
                xLabels={[
                  t('weeks.1'),
                  t('weeks.2'),
                  t('weeks.3'),
                  t('weeks.4'),
                  t('weeks.5'),
                  t('weeks.6'),
                  t('weeks.7')
                ]}
                primaryLabel={t('charts.rating.primary')}
              />
            </div>
          </div>
        </div>

        {/* Pie Chart by Source */}
        <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg w-full">
          <div className="p-6 border-b border-border/50">
            <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
              <BookOpenCheck className="h-6 w-6" />
              {t('charts.viewSources.title')}
            </h3>
            <p className="text-muted-foreground text-sm">{t('charts.viewSources.description')}</p>
          </div>
          <div className="pt-10 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
            <div className="w-full" style={{ direction: 'ltr' }}>
              <StudentsPieChartSwitcher
                data={pieChartData}
                getLabel={(category, key) => t(`charts.pie.${category}.${key}`, key)} // Fallback to key if translation is missing
                getSwitcherLabel={(category) => t(`charts.switchers.${category}`, category)} // Fallback to category if translation is missing
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisSection;