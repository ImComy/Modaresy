import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, User } from 'lucide-react';

import AnalysisSection from '@/components/Dashboard/analysis';
import AccountSection from '@/components/Dashboard/account';
import { tutorService } from '@/api/tutor';
import { useToast } from '@/components/ui/use-toast';

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
  const setFormStable = useCallback((newForm) => {
    setForm(newForm);
    markDirty('account');
  }, []);
  const lastSectionRef = useRef('analysis');

  const markDirty = (sectionId) => {
    setUnsavedSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const { toast } = useToast();

  const handleSave = async (sectionId) => {
    setIsSaving(true);
    try {
      if (sectionId === 'account') {
        await tutorService.updateProfile(form);
        toast({ title: t('toastTitleSaved', 'Saved'), description: t('toastDescSaved', 'Changes saved.') });
      } else {
        await new Promise((r) => setTimeout(r, 1200));
      }

      setUnsavedSections((prev) => ({ ...prev, [sectionId]: false }));
    } catch (err) {
      console.error('Failed to save section', sectionId, err);
      toast({ title: t('error'), description: err?.message || t('failedToSaveProfile', 'Failed to save changes'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = async (newSection) => {
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
      id: 'account',
      label: t('accountNav'),
      icon: <User className="h-6 w-6" />,
      description: t('accountDesc', 'Manage your personal information and account settings.'),
    },
    {
      id: 'analysis',
      label: t('analysis'),
      icon: <TrendingUp className="h-6 w-6" />,
      description: t('analysisDesc', 'View and analyze your teaching performance and student progress.'),
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

      <div className="flex flex-col sm:flex-row gap-5 p-4 bg-gradient-to-r from-muted/5 to-muted/10 rounded-xl shadow-lg">
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
        <AccountSection
          form={form}
          setForm={setFormStable}
          // pass the save action down so the AccountSection can render the Save button in its header
          onSave={() => handleSave('account')}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default TeacherDashboardPage;
