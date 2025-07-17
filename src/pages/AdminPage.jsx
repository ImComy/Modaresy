import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Flag, Key, Bell, MessageSquare, BarChart2 } from 'lucide-react';
import NavigationCard from '@/components/admin/nav';
import AccountManagement from '@/components/admin/AccountManagement';
import ReportedContent from '@/components/admin/ReportedContent';
import PasswordRequests from '@/components/admin/PasswordRequests';
import Notifications from '@/components/admin/Notifications';
import ContactMessages from '@/components/admin/ContactMessages';
import AnalysisPanel from '@/components/admin/analysis';

const AdminPage = () => {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState('accounts');

  const navItems = [
    {
      id: 'accounts',
      labelKey: 'accounts',
      defaultLabel: 'Accounts',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'reported',
      labelKey: 'reported',
      defaultLabel: 'Reported Content',
      icon: <Flag className="w-5 h-5" />,
    },
    {
      id: 'passwords',
      labelKey: 'passwords',
      defaultLabel: 'Password Requests',
      icon: <Key className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      labelKey: 'notifications',
      defaultLabel: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: 'contact',
      labelKey: 'contact',
      defaultLabel: 'Contact Messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'analysis',
      labelKey: 'analysis',
      defaultLabel: 'Analysis',
      icon: <BarChart2 className="w-5 h-5" />,
    },
  ];

  const handleSubmit = () => {
    console.log('Form submitted');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] px-4 sm:px-8 py-6">
      <div className=" mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[hsl(var(--primary))]">
          {t('adminDashboardTitle', 'Modaresy Admin Dashboard')}
        </h1>
        <div className="sticky top-20 z-30">
          <div className="max-w-xl mx-auto px-4"></div>
          <NavigationCard
            navItems={navItems}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            handleSubmit={handleSubmit}
          />
        </div>

        <div className="rounded-xl p-4 sm:p-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm mt-4 sm:mt-6">
          {selectedSection === 'accounts' && <AccountManagement />}
          {selectedSection === 'reported' && <ReportedContent />}
          {selectedSection === 'passwords' && <PasswordRequests />}
          {selectedSection === 'notifications' && <Notifications />}
          {selectedSection === 'contact' && <ContactMessages />}
          {selectedSection === 'analysis' && <AnalysisPanel />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
