import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BarChartHorizontalBig, TrendingUp } from 'lucide-react';
import { chartdata, ActionTypes, mockLogs, actionShortLabels } from '@/data/mockDashboard';
import BasicLineChart from '@/components/graph';
import StudentsPieChartSwitcher from '@/components/switcherPieChart';
import HalfRatingGauge from '@/components/circleGague';
import ActivityLogs from '@/components/dashboard/logs';
import SettingsCompletionCard from '@/components/Dashboard/CompletionCard'

const AnalysisSection = () => {
  const { t } = useTranslation();
  const uData = [11, 12, 13, 24, 5, 6, 17];
  const secondaryData = [20, 33, 41, 50, 63, 71, 89];
  const hasData = uData.length > 0 && secondaryData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <SettingsCompletionCard completionPercentage={40}/>
      {/* Graphs and Logs */}
      <div className="pt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
            <div className="p-6 border-b border-border/50">
              <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
                <TrendingUp className="h-6 w-6" />
                {t('activityOverview')}
              </h3>
              <p className="text-muted-foreground text-sm">{t('activityDesc')}</p>
            </div>
            <div className="h-[452px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
              {hasData ? (
                <div className="w-full" style={{ direction: 'ltr' }}>
                  <BasicLineChart
                    uData={chartdata.map(d => d.signups)}
                    secondaryData={chartdata.map(d => d.visits)}
                    xLabels={chartdata.map(d => d.month)}
                    primaryLabel="Signups"
                    secondaryLabel="Page Views"
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="text-lg font-semibold mb-1">{t('graphPlaceholderTitle')}</p>
                  <p className="text-sm">{t('graphPlaceholderDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/5">
          <ActivityLogs />
        </div>
      </div>
      <div className="flex gap-10 flex-col lg:flex-row w-full">
        <div className="w-full bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-border/50">
            <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
              <TrendingUp className="h-6 w-6" />
              {t('activityOverview')}
            </h3>
            <p className="text-muted-foreground text-sm">{t('activityDesc')}</p>
          </div>
          <div className="h-[78%] pt-10 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
            {hasData ? (
              <div className="w-full" style={{ direction: 'ltr' }}>
                <BasicLineChart
                  uData={[8, 18, 28]}
                  xLabels={['Week 1', 'Week 2', 'Week 3']}
                  primaryLabel="Students"
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-6">
                <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                <p className="text-lg font-semibold mb-1">{t('graphPlaceholderTitle')}</p>
                <p className="text-sm">{t('graphPlaceholderDesc')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-10 flex-col md:flex-row w-full">
          <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg w-full">
            <div className="p-6 border-b border-border/50">
              <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
                <TrendingUp className="h-6 w-6" />
                {t('activityOverview')}
              </h3>
              <p className="text-muted-foreground text-sm">{t('activityDesc')}</p>
            </div>
            <div className="pt-10 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
              {hasData ? (
                <div className="w-full" style={{ direction: 'ltr' }}>
                  <StudentsPieChartSwitcher
                    data={{
                      subject: { Math: 20, Science: 15, English: 10, History: 8 },
                      grade: { '9': 6, '10': 12, '11': 14, '12': 15 },
                      sector: { Private: 25, Public: 20, Homeschool: 5 },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="text-lg font-semibold mb-1">{t('graphPlaceholderTitle')}</p>
                  <p className="text-sm">{t('graphPlaceholderDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisSection;