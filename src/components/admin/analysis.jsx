import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Validation schema for filters
const filterSchema = z.object({
  timeRange: z.enum(['7days', '30days', '90days', 'custom']),
  userType: z.enum(['all', 'tutor', 'student']).optional(),
});

const AnalysisPanel = () => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState({
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: t('userGrowth', 'User Growth'),
          data: [100, 150, 200, 250, 300, 350],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    },
    sessionCount: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: t('sessions', 'Sessions'),
          data: [50, 80, 120, 100, 150, 200],
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    },
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: t('revenue', 'Revenue (USD)'),
          data: [1000, 1500, 2000, 1800, 2500, 3000],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
  });

  // Mock summary data
  const summaryData = {
    totalUsers: 350,
    activeTutors: 50,
    totalSessions: 200,
    totalRevenue: 3000,
  };

  // Form setup
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      timeRange: '30days',
      userType: 'all',
    },
  });

  // Handle filter changes
  const handleFilterChange = useCallback((data) => {
    // TODO: Fetch new data based on filters (e.g., API call)
    console.log('Filters applied:', data);
    // Update chart data based on filters (mock example)
    setChartData((prev) => ({
      ...prev,
      userGrowth: {
        ...prev.userGrowth,
        datasets: [{ ...prev.userGrowth.datasets[0], data: [100, 150, 200, 250, 300, 350].slice(0, data.timeRange === '7days' ? 2 : data.timeRange === '30days' ? 4 : 6) }],
      },
    }));
  }, []);

  // Export data as CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', summaryData.totalUsers],
      ['Active Tutors', summaryData.activeTutors],
      ['Total Sessions', summaryData.totalSessions],
      ['Total Revenue (USD)', summaryData.totalRevenue],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }, [summaryData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: t('chartTitle', 'Analytics Overview') },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('analysisPanel', 'Analysis Panel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFilterChange)} className="space-y-4 mb-6">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="timeRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('timeRange', 'Time Range')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectTimeRange', 'Select Time Range')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7days">{t('7days', 'Last 7 Days')}</SelectItem>
                          <SelectItem value="30days">{t('30days', 'Last 30 Days')}</SelectItem>
                          <SelectItem value="90days">{t('90days', 'Last 90 Days')}</SelectItem>
                          <SelectItem value="custom">{t('custom', 'Custom')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userType', 'User Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectUserType', 'Select User Type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">{t('all', 'All')}</SelectItem>
                          <SelectItem value="tutor">{t('tutor', 'Tutor')}</SelectItem>
                          <SelectItem value="student">{t('student', 'Student')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="self-end">{t('applyFilters', 'Apply Filters')}</Button>
              </div>
            </form>
          </Form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('totalUsers', 'Total Users')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summaryData.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('activeTutors', 'Active Tutors')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summaryData.activeTutors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('totalSessions', 'Total Sessions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summaryData.totalSessions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('totalRevenue', 'Total Revenue (USD)')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${summaryData.totalRevenue}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('userGrowth', 'User Growth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={chartData.userGrowth} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: t('userGrowth', 'User Growth') } } }} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('sessions', 'Sessions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={chartData.sessionCount} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: t('sessions', 'Sessions') } } }} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('revenue', 'Revenue (USD)')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={chartData.revenue} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: t('revenue', 'Revenue (USD)') } } }} />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h szép idézetek-4 mr-2" /> {t('exportCSV', 'Export as CSV')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnalysisPanel;