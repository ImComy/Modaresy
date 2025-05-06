
    import React from 'react';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Eye, Users, MessageSquare, DollarSign, BarChartHorizontalBig, TrendingUp } from 'lucide-react';

    // Mock data for dashboard - replace with actual data fetching
    const dashboardData = {
      profileVisits: 1234,
      studentsContacted: 85,
      activeStudents: 25,
      pendingMessages: 3,
      monthlyEarnings: 4500, // Example in EGP
    };

    // Placeholder for chart data
    const chartData = [
      { month: 'Jan', visits: 150, contacts: 10 },
      { month: 'Feb', visits: 210, contacts: 15 },
      { month: 'Mar', visits: 180, contacts: 12 },
      { month: 'Apr', visits: 250, contacts: 20 },
      { month: 'May', visits: 230, contacts: 18 },
    ];


    const TeacherDashboardPage = () => {
      const { t } = useTranslation();

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

          {/* Graph Placeholder */}
          <div className="pt-8">
             <Card className="glass-effect">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-primary" />
                   {t('activityOverview')}
                 </CardTitle>
                 <CardDescription>{t('activityDesc')}</CardDescription>
               </CardHeader>
               <CardContent className="h-[350px] flex items-center justify-center bg-muted/30 rounded-md border-2 border-dashed border-border/50">
                 <div className="text-center text-muted-foreground p-6">
                   <BarChartHorizontalBig size={56} className="mx-auto mb-4 opacity-30 text-primary" />
                   <p className="text-lg font-semibold mb-1">{t('graphPlaceholderTitle')}</p>
                   <p className="text-sm">{t('graphPlaceholderDesc')}</p>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Removed Upcoming Sessions Section */}

        </motion.div>
      );
    };

    export default TeacherDashboardPage;
  