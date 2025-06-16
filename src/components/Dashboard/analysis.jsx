import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BarChartHorizontalBig, TrendingUp } from 'lucide-react';
import { chartdata, ActionTypes, mockLogs, actionShortLabels } from '@/data/mockDashboard';
import BasicLineChart from '@/components/graph';
import StudentsPieChartSwitcher from '@/components/switcherPieChart';
import HalfRatingGauge from '@/components/circleGague';

const AnalysisSection = () => {
  const { t } = useTranslation();
  const uData = [11, 12, 13, 24, 5, 6, 17];
  const secondaryData = [20, 33, 41, 50, 63, 71, 89];
  const hasData = uData.length > 0 && secondaryData.length > 0;
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesAction = selectedAction === 'all' || log.action === selectedAction;
      const matchesDate = !selectedDate || log.date === selectedDate;
      return matchesAction && matchesDate;
    });
  }, [mockLogs, selectedAction, selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Graphs and Logs */}
      <div className="pt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
            <div className="p-6">
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
          <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg flex flex-col">
            <div className="p-6 flex flex-col md:flex-row justify-between md:items-start">
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
                  <Clock className="h-6 w-6 pt-1" />
                  {t('AcitivityLogs')}
                </h3>
                <p className="text-muted-foreground text-sm">{t('recentInteractions')}</p>
              </div>
              <div className="flex gap-2 mt-2 pt-2">
                <select
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full md:w-auto border border-border/40 rounded-md px-3 py-2 text-sm bg-muted/20 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-muted/30 shadow-sm"
                >
                  <option value="all">{t('allActions')}</option>
                  {Object.entries(ActionTypes).map(([key, action], index) => (
                    <option key={index} value={action}>
                      {actionShortLabels(t)[action] || action}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="border border-border/40 rounded-md px-3 py-2 text-sm bg-muted/20 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-muted/30 shadow-sm"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 py-4 max-h-[450px] min-h-[450px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <div className="text-center text-muted-foreground">{t('noLogsAvailable')}</div>
                </div>
              ) : (
                <ul className="space-y-4 pr-1">
                  {filteredLogs.map((log, index) => {
                    const actionKeyMap = {
                      'has contacted you': 'logs.contacted',
                      'viewed your profile': 'logs.viewedProfile',
                      'rated your session': 'logs.rated',
                      'left a review': 'logs.leftReview',
                    };
                    const translatedAction = t(actionKeyMap[log.action] || log.action);

                    return (
                      <li key={index} className="flex items-start gap-4 bg-muted/30 p-4 rounded-xl">
                        <div className="h-3 w-3 rounded-full bg-primary mt-1 shrink-0" />
                        <div className="flex flex-row justify-between items-start w-full">
                          <div>
                            <p className="text-sm font-medium text-foreground">{log.name}</p>
                            <p className="text-sm font-medium text-muted-foreground">{translatedAction}</p>
                          </div>
                          <div>
                            {log.phone && (
                              <p className="text-xs text-muted-foreground">{log.phone}</p>
                            )}
                            {log.date && (
                              <p className="text-xs text-muted-foreground">{log.date}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-10 flex-col md:flex-row w-full">
        <div className="w-full bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
          <div className="p-6">
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
        <div className="w-full bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
          <div className="p-6">
            <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
              <TrendingUp className="h-6 w-6" />
              {t('activityOverview')}
            </h3>
            <p className="text-muted-foreground text-sm">{t('activityDesc')}</p>
          </div>
          <div className="h-[452px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
            {hasData ? (
              <div className="w-full" style={{ direction: 'ltr' }}>
                <HalfRatingGauge rating={4.7} />
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
      <div className="flex gap-10 flex-col md:flex-row w-full">
        <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg w-full">
          <div className="p-6">
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
        <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg w-full">
          <div className="p-6">
            <h3 className="text-primary text-lg font-semibold">{t('studentStatistics')}</h3>
            <p className="text-muted-foreground text-sm">{t('studentStatsDesc')}</p>
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
    </motion.div>
  );
};

export default AnalysisSection;