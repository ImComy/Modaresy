import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CalendarDays,
  AlertCircle,
  MessageCircle,
  Eye,
  Star,
  ClipboardCheck,
  X,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

const initialLogs = [
  { id: 1, type: 'contact', label: 'A student reached out to you', date: '2025-06-22T09:30:00Z', details: 'You have a new message from a student.', read: false },
  { id: 2, type: 'view', label: 'Someone viewed your profile', date: '2025-06-21T15:45:00Z', details: 'Your profile was viewed recently.', read: false },
  { id: 3, type: 'review', label: 'You received a new review', date: '2025-06-20T18:00:00Z', details: 'A student left a 5-star review.', read: false },
  { id: 4, type: 'rating', label: 'Your session was rated', date: '2025-06-19T20:15:00Z', details: 'Great feedback on your last session.', read: true },
  { id: 5, type: 'booking', label: 'A student booked a lesson', date: '2025-06-18T11:10:00Z', details: 'A new session has been scheduled.', read: true },
];

const iconMap = {
  contact: <MessageCircle className="text-primary w-5 h-5" />,
  view: <Eye className="text-primary w-5 h-5" />,
  review: <ClipboardCheck className="text-primary w-5 h-5" />,
  rating: <Star className="text-primary w-5 h-5" />,
  booking: <CalendarDays className="text-primary w-5 h-5" />,
};

const formatRelativeTime = (isoDate) => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const ActivityLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleSelectLog = (log) => {
    setSelectedLog(log);
    setLogs((prev) =>
      prev.map((item) => (item.id === log.id ? { ...item, read: true } : item))
    );
  };

  return (
    <>
      <div className="w-full bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl shadow-lg flex flex-col">
        <div className="p-6 border-b border-border/50">
          <h3 className="flex items-center gap-2 text-primary text-lg font-semibold">
            <Bell className="h-5 w-5" />
            {t('notifications') || 'Notifications'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('recentInteractions') || 'Recent student interactions and updates'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[450px] px-4 py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-muted/20 rounded-lg border-2 border-dashed border-border/50 m-6">
          {logs.length > 0 ? (
            <ul className="space-y-4 pr-1">
              {logs.map((log) => (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={log.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition cursor-pointer ${
                    log.read ? 'bg-muted/20' : 'bg-primary/5'
                  } hover:bg-muted/40`}
                  onClick={() => handleSelectLog(log)}
                >
                  <div className="mt-1">
                    {log.read ? (
                      <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Circle className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex gap-2 items-start">
                      {iconMap[log.type]}
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.label}</p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatRelativeTime(log.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle size={48} className="mb-4 text-primary" />
              <p>{t('noNotifications') || 'No notifications available.'}</p>
            </div>
          )}
        </div>
      </div>

        <AnimatePresence>
        {selectedLog && (
            <Dialog
            open={true}
            onClose={() => setSelectedLog(null)}
            className="fixed inset-0 z-50 flex items-center justify-center"
            >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

            {/* Modal Panel with motion */}
            <Dialog.Panel as={motion.div}
                initial={{ opacity: 0, y: 90 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.9 }}
                className="bg-background p-6 w-full max-w-md mx-auto rounded-xl shadow-xl z-50 relative"
            >
                <button
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                <X className="w-5 h-5" />
                </button>
                <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                    {iconMap[selectedLog.type]}
                    <h4 className="text-lg font-semibold">{selectedLog.label}</h4>
                </div>
                <p className="text-muted-foreground text-sm">
                    {formatRelativeTime(selectedLog.date)}
                </p>
                <div className="pt-4 text-sm text-foreground leading-relaxed">
                    {selectedLog.details}
                </div>
                </div>
            </Dialog.Panel>
            </Dialog>
        )}
        </AnimatePresence>
    </>
  );
};

export default ActivityLogs;
