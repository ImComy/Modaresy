import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, User } from 'lucide-react';

import AnalysisSection from '@/components/Dashboard/analysis';
import AccountSection from '@/components/Dashboard/account';
import SaveButton from '@/components/ui/save';

const TeacherDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeSection, setActiveSection] = useState('analysis');
  const [unsavedSections, setUnsavedSections] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const lastSectionRef = useRef('analysis');

  const markDirty = (sectionId) => {
    setUnsavedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const handleSave = async (sectionId) => {
    setIsSaving(true);
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentSection = lastSectionRef.current;
      if (unsavedSections[currentSection]) {
        console.log(`Auto-saving before unload: ${currentSection}`);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedSections]);

  const sections = [
    {
      id: 'analysis',
      label: t('analysis'),
      icon: <TrendingUp className="h-6 w-6" />,
      description: t('analysisDesc', 'View and analyze your teaching performance and student progress.'),
    },
    {
      id: 'account',
      label: t('accountNav'),
      icon: <User className="h-6 w-6" />,
      description: t('accountDesc', 'Manage your personal information and account settings.'),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          {t('teacherDashboard')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('dashboardOverview')}</p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-muted/5 to-muted/10 rounded-xl shadow-lg gap-5">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={() => handleTabChange(section.id)}
            className={`flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground shadow-inner'
                : 'bg-background text-foreground hover:bg-muted/80'
            } sm:flex-1 border border-border/30`}
          >
            <div className="flex items-center gap-3">
              {section.icon}
              <span>{section.label}</span>
            </div>
            <p className={`hidden md:block text-sm text-muted-foreground text-center ${
              activeSection === section.id ? 'text-primary-foreground/80' : ''
            }`}>
              {section.description}
            </p>
          </motion.button>
        ))}
      </div>

      {activeSection === 'analysis' && <AnalysisSection />}
      {activeSection === 'account' && (
        <>
          <AccountSection
            form={form}
            setForm={(newForm) => {
              setForm(newForm);
              markDirty('account');
            }}
          />
          <SaveButton
            isLoading={isSaving}
            onClick={() => handleSave('account')}
          />
        </>
      )}
    </div>
  );
};

export default TeacherDashboardPage;