import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Users, MessageSquare, DollarSign, BarChartHorizontalBig, TrendingUp } from 'lucide-react';
import mockVisits from '../data/mockVisits';
import BasicLineChart from '../components/graph';

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
    { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2023-10-01' },
    { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
    { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
  ]; 
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
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('teacherDashboard')}</h1>
        <p className="text-muted-foreground">{t('dashboardOverview')}</p>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <motion.div whileHover={{ y: -5 }}>
          <Card className="shadow hover:shadow-lg transition-shadow glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('profileVisits')}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.profileVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('visitsFromLastMonth', { percent: 15 })}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }}>
          <Card className="shadow hover:shadow-lg transition-shadow glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('studentsContacted')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.studentsContacted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('viaTutorConnect')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }}>
          <Card className="shadow hover:shadow-lg transition-shadow glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activeStudents')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activeStudents}</div>
              <p className="text-xs text-muted-foreground">{t('newThisWeek', { count: 2 })}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }}>
          <Card className="shadow hover:shadow-lg transition-shadow glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('pendingMessages')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.pendingMessages}</div>
              <p className="text-xs text-muted-foreground">{t('respondSoon')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }}>
          <Card className="shadow hover:shadow-lg transition-shadow glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('monthlyEarnings')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">EGP {dashboardData.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t('basedOnScheduled')}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graph and Additional Card */}
      <div className="pt-8 flex flex-col md:flex-row gap-4">
        {/* Overview Card */}
        <div className="flex-1">
          <Card className="glass-effect h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('activityOverview')}
              </CardTitle>
              <CardDescription>{t('activityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="h-[450px] flex items-center justify-center bg-muted/30 rounded-md border-2 border-dashed border-border/50">
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
          <Card className="glass-effect h-full flex flex-col border border-border/40 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-5 pt-1 text-primary" />
                {t('AcitivityLogs')}
              </CardTitle>
              <CardDescription>{t('recentInteractions')}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-4 pb-4 py-4  max-h-[450px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-muted/30 rounded-md border-2 border-dashed border-border/50">
              {mockLogs.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full'>
                <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                <div className="text-center text-muted-foreground">{t('noLogsAvailable')}</div>
                </div>
              ) : (
                <ul className="space-y-3 pr-1">
                {mockLogs.map((log, index) => (
                  <li
                  key={index}
                  className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-border/30"
                  >
                  <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />

                  <div className="flex-1 text-sm">
                              <span className="font-semibold text-foreground">{log.name}</span>{' '}
                              <span className="text-muted-foreground">{log.action}</span>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="block">{log.time}</span>
                                <span className="block">{log.date}</span>
                                <span className="block text-primary font-medium">{log.phone}</span>
                              </div>
                            </div>
                  </li>
                ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );};
export default TeacherDashboardPage;
