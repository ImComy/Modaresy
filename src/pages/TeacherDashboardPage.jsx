import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Users, MessageSquare, DollarSign, BarChartHorizontalBig, TrendingUp } from 'lucide-react';
import mockVisits from '../data/mockVisits';
import BasicLineChart from '../components/graph';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// Mock data for dashboard - replace with actual data fetching
const dashboardData = {
  profileVisits: 1234,
  studentsContacted: 85,
  activeStudents: 25,
  pendingMessages: 3,
  monthlyEarnings: 4500, // Example in EGP
};

const chartdata = mockVisits;
console.log(chartdata);

const TeacherDashboardPage = () => {
  const { t } = useTranslation();
  
  const ActionTypes = Object.freeze({
    CONTACTED: 'has contacted you',
    VIEWED_PROFILE: 'viewed your profile',
    RATED: 'rated your session',
    LEFT_REVIEW: 'left a review',
  });
  
  const mockLogs = [
    { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
    { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
    { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
    { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
    { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
  ]; 

  const actionShortLabels = {
    "has contacted you": t("logs.contactedShort"),
    "viewed your profile": t("logs.viewedShort"),
    "rated your session": t("logs.ratedShort"), 
    "left a review": t("logs.reviewedShort"),
  };

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
      <section className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{t('teacherDashboard')}</h1>
        <p className="text-lg text-muted-foreground">{t('dashboardOverview')}</p>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          {
            title: t('profileVisits'),
            value: dashboardData.profileVisits.toLocaleString(),
            icon: <Eye className="h-5 w-5 text-primary" />,
            description: t('visitsFromLastMonth', { percent: 15 }),
          },
          {
            title: t('studentsContacted'),
            value: dashboardData.studentsContacted.toLocaleString(),
            icon: <MessageSquare className="h-5 w-5 text-primary" />,
            description: t('viaTutorConnect'),
          },
          {
            title: t('activeStudents'),
            value: dashboardData.activeStudents,
            icon: <Users className="h-5 w-5 text-primary" />,
            description: t('newThisWeek', { count: 2 }),
          },
          {
            title: t('pendingMessages'),
            value: dashboardData.pendingMessages,
            icon: <MessageSquare className="h-5 w-5 text-primary" />,
            description: t('respondSoon'),
          },
          {
            title: t('monthlyEarnings'),
            value: `EGP ${dashboardData.monthlyEarnings.toLocaleString()}`,
            icon: <DollarSign className="h-5 w-5 text-primary" />,
            description: t('basedOnScheduled'),
          },
        ].map((card, index) => (
          <motion.div key={index} whileHover={{ y: -5 }}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-foreground">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-primary">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graph and Additional Card */}
      <div className="pt-8 flex flex-col md:flex-row gap-6">
        {/* Overview Card */}
        <div className="flex-1">
          <Card className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-6 w-6" />
                {t('activityOverview')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t('activityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="h-[452px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
              {hasData ? (
                <div className="w-full" style={{ direction: 'ltr' }}>
                  <BasicLineChart
                    uData={uData}
                    secondaryData={secondaryData}
                    xLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <p className="text-lg font-semibold mb-1">{t('graphPlaceholderTitle')}</p>
                  <p className="text-sm">{t('graphPlaceholderDesc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs Card */}
        <div className="w-full md:w-2/5">
          <Card className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg flex flex-col">
            <CardHeader className="flex flex-col md:flex-row pb-6 justify-between md:items-start ">
              <div className='flex flex-col gap-2'>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Clock className="h-6 w-6 pt-1" />
                  {t('AcitivityLogs')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">{t('recentInteractions')}</CardDescription>
              </div>
              <div className="flex gap-2 mt-2 pt-2">
                {/* Custom Select for Action Types */}
                <Select onValueChange={(value) => setSelectedAction(value)} >
                  <SelectTrigger className="w-full md:w-auto border border-border/40 rounded-md px-3 py-2 text-sm bg-muted/20 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-muted/30 shadow-sm">
                    <SelectValue placeholder={t('allActions')} />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">{t("allActions")}</SelectItem>
                  {Object.entries(ActionTypes).map(([key, action], index) => (
                    <SelectItem key={index} value={action}>
                      {actionShortLabels[action] || action} {/* Use short label or fallback to full action */}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>

                {/* Custom Date Input */}
                <input
                  type="date"
                  className="border border-border/40 rounded-md px-3 py-2 text-sm bg-muted/20 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-colors hover:bg-muted/30 shadow-sm"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent className=" flex-1 overflow-y-auto px-4 pb-4 py-4 max-h-[450px] min-h-[450px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
              {mockLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                  <div className="text-center text-muted-foreground">{t('noLogsAvailable')}</div>
                </div>
              ) : (
                <ul className="space-y-4 pr-1">
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
                                <p className="text-sm font-medium  text-muted-foreground">{translatedAction}</p>
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
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );};
export default TeacherDashboardPage;
