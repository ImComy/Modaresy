import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Table2, Tag, FileText, Settings } from 'lucide-react';

import AnalysisSection from '@/components/Dashboard/analysis';
import GroupsAndTablesSection from '@/components/Dashboard/groups';
import PricesAndOffersSection from '@/components/Dashboard/prices';
import ContentManagementSection from '@/components/Dashboard/content';
import SaveButton from '@/components/ui/save';

const TeacherDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeSection, setActiveSection] = useState('analysis');
  const [unsavedSections, setUnsavedSections] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const lastSectionRef = useRef('analysis');

  const handleSettingsClick = () => {
    window.location.href = 'http://localhost:5173/settings/teacher';
  };

  const markDirty = (sectionId) => {
    setUnsavedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const handleSave = async (sectionId) => {
    setIsSaving(true);
    // future: send data to backend here
    await new Promise((r) => setTimeout(r, 1200));
    setUnsavedSections((prev) => ({ ...prev, [sectionId]: false }));
    setIsSaving(false);
  };

  const handleTabChange = async (newSection) => {
    const currentSection = lastSectionRef.current;

    if (unsavedSections[currentSection]) {
      await handleSave(currentSection);
    }

    lastSectionRef.current = newSection;
    setActiveSection(newSection);
  };

  // Auto-save on browser/tab close
useEffect(() => {
  const handleBeforeUnload = () => {
    const currentSection = lastSectionRef.current;
    if (unsavedSections[currentSection]) {
      // mock "save" sync — in real app this could trigger localStorage or API
      console.log(`Auto-saving before unload: ${currentSection}`);
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [unsavedSections]);


  const sections = [
    { id: 'analysis', label: t('analysis'), icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'groupsAndTables', label: t('groupsAndTables'), icon: <Table2 className="h-5 w-5" /> },
    { id: 'pricesAndOffers', label: t('pricesAndOffers'), icon: <Tag className="h-5 w-5" /> },
    { id: 'contentManagement', label: t('contentManagement'), icon: <FileText className="h-5 w-5" /> },
    { id: 'settings', label: t('settingsNav'), icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {t('teacherDashboard')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('dashboardOverview')}</p>
      </section>

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 p-3 bg-muted/20 rounded-lg shadow-lg"
      >
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} 
            onClick={
              section.id === 'settings'
                ? handleSettingsClick
                : () => handleTabChange(section.id)
            }
            className={`shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl p-6 text-left ${
              activeSection === section.id && section.id !== 'settings'
                ? 'ring-2 ring-primary'
                : ''
            }`}
          >
            <div className="flex items-center justify-between pb-2 gap-2">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-base font-semibold text-foreground text-[15px]">
                  {section.label}
                </h3>
              </div>
            </div>

            <p
              className={`text-sm text-muted-foreground ${
                i18n.language === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              {t(`${section.id}Desc`)}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      {activeSection === 'analysis' && <AnalysisSection />}
      {activeSection === 'groupsAndTables' && (
        <>
          <GroupsAndTablesSection markDirty={() => markDirty('groupsAndTables')} />
          <SaveButton
            isLoading={isSaving}
            onClick={() => handleSave('groupsAndTables')}
          />
        </>
      )}
      {activeSection === 'pricesAndOffers' && (
        <>
          <PricesAndOffersSection markDirty={() => markDirty('pricesAndOffers')} />
          <SaveButton
            isLoading={isSaving}
            onClick={() => handleSave('pricesAndOffers')}
          />
        </>
      )}
      {activeSection === 'contentManagement' && (
        <>
          <ContentManagementSection markDirty={() => markDirty('contentManagement')} />
          <SaveButton
            isLoading={isSaving}
            onClick={() => handleSave('contentManagement')}
          />
        </>
      )}
    </div>
  );
};

export default TeacherDashboardPage;
