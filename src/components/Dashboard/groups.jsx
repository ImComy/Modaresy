import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Table2, Book } from 'lucide-react';

const GroupsAndTablesSection = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg p-6">
        <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
          <Table2 className="h-6 w-6" />
          {t('groupsAndTables')}
        </h3>
        <p className="text-muted-foreground text-sm">{t('manageGroupsAndSchedules')}</p>
        <div className="mt-6 text-center text-muted-foreground">
          <Book className="mx-auto mb-4 h-16 w-16 opacity-30 text-primary" />
          <p className="text-lg font-semibold mb-1">{t('comingSoon')}</p>
          <p className="text-sm">{t('groupsAndTablesDesc')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupsAndTablesSection;