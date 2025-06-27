import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, MessageCircle, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const NotificationDropdown = () => {
  const { t } = useTranslation();

  const notifications = [
    {
      id: 1,
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      title: t('notification.newMessageTitle', { name: 'Ahmed' }),
      description: t('notification.newMessageBody'),
      time: t('notification.time.2min'),
    },
    {
      id: 2,
      icon: <Users className="w-5 h-5 text-green-500" />,
      title: t('notification.groupAddedTitle'),
      description: t('notification.groupAddedBody', { group: 'Math Mentors' }),
      time: t('notification.time.1hour'),
    },
    {
      id: 3,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      title: t('notification.profileApprovedTitle'),
      description: t('notification.profileApprovedBody'),
      time: t('notification.time.yesterday'),
    },
      {
      id: 4,
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      title: t('notification.newMessageTitle', { name: 'Ahmed' }),
      description: t('notification.newMessageBody'),
      time: t('notification.time.2min'),
    },
    {
      id: 5,
      icon: <Users className="w-5 h-5 text-green-500" />,
      title: t('notification.groupAddedTitle'),
      description: t('notification.groupAddedBody', { group: 'Math Mentors' }),
      time: t('notification.time.1hour'),
    },
    {
      id: 6,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      title: t('notification.profileApprovedTitle'),
      description: t('notification.profileApprovedBody'),
      time: t('notification.time.yesterday'),
    },
    {
      id: 7,
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      title: t('notification.newMessageTitle', { name: 'Ahmed' }),
      description: t('notification.newMessageBody'),
      time: t('notification.time.2min'),
    },
    {
      id: 8,
      icon: <Users className="w-5 h-5 text-green-500" />,
      title: t('notification.groupAddedTitle'),
      description: t('notification.groupAddedBody', { group: 'Math Mentors' }),
      time: t('notification.time.1hour'),
    },
    {
      id: 9,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      title: t('notification.profileApprovedTitle'),
      description: t('notification.profileApprovedBody'),
      time: t('notification.time.yesterday'),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-secondary inline-flex"
          >
            <Bell size={20} />
          </Button>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow-md">
              {notifications.length}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="min-w-[22rem] w-[90vw] sm:w-80 p-0 shadow-lg rounded-lg z-[100] max-h-[80vh]">
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold text-foreground">{t('notification.title')}</h4>
        </div>

        {notifications.length > 0 ? (
          <ul className="divide-y overflow-y-auto max-h-[60vh]">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start p-4 gap-4 hover:bg-muted transition"
              >
                <div className="mt-1">{notif.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-sm text-muted-foreground text-center">
            {t('notification.empty')}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
