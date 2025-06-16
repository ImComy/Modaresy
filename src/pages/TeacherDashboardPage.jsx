import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Table2, Tag, FileText, Settings } from 'lucide-react';
import AnalysisSection from '@/components/Dashboard/analysis';
import GroupsAndTablesSection from '@/components/Dashboard/groups';
import PricesAndOffersSection from '@/components/Dashboard/prices';
import ContentManagementSection from '@/components/Dashboard/content';

const TeacherDashboardPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('analysis');

  const handleSettingsClick = () => {
    window.location.href = 'http://localhost:5173/settings/teacher';
  };

  const sections = [
    { id: 'analysis', label: t('analysis'), icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'groupsAndTables', label: t('groupsAndTables'), icon: <Table2 className="h-5 w-5" /> },
    { id: 'pricesAndOffers', label: t('pricesAndOffers'), icon: <Tag className="h-5 w-5" /> },
    { id: 'contentManagement', label: t('contentManagement'), icon: <FileText className="h-5 w-5" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{t('teacherDashboard')}</h1>
        <p className="text-lg text-muted-foreground">{t('dashboardOverview')}</p>
      </section>

      {/* Navigation Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 p-10 bg-muted/20 rounded-lg shadow-lg">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={section.id === 'settings' ? handleSettingsClick : () => setActiveSection(section.id)}
            className={`shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl p-6 text-left ${
              activeSection === section.id && section.id !== 'settings' ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-base font-semibold text-foreground">{section.label}</h3>
              {section.icon}
            </div>
            <p className="text-sm text-muted-foreground">
              {t(`${section.id}Desc`)}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      {activeSection === 'analysis' && <AnalysisSection />}
      {activeSection === 'groupsAndTables' && <GroupsAndTablesSection />}
      {activeSection === 'pricesAndOffers' && <PricesAndOffersSection />}
      {activeSection === 'contentManagement' && <ContentManagementSection />}
    </div>
  );
};

export default TeacherDashboardPage;