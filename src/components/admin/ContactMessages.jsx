import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialMessages = [
  {
    id: 'cm1',
    name: 'Ali Ahmed',
    email: 'ali.ahmed@example.com',
    title: 'Tutor Registration Question',
    message: 'I have a question about tutor registration.',
    date: '2025-04-15',
  },
  {
    id: 'cm2',
    name: 'Fatima Mohamed',
    email: 'fatima.mohamed@example.com',
    title: 'Password Reset Help',
    message: 'How can I reset my password?',
    date: '2025-04-14',
  },
];

const ContactMessages = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(initialMessages);
  const [expandedMessageIds, setExpandedMessageIds] = useState([]);

  const handleMarkAsRead = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    console.log('Message deleted (marked as read):', id);
  };

  const toggleExpand = (id) => {
    setExpandedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Card className="p-6 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
        {t('contactMessagesTitle')}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              <th className="p-3">{t('name')}</th>
              <th className="p-3">{t('email')}</th>
              <th className="p-3">{t('titlec')}</th>
              <th className="p-3">{t('date')}</th>
              <th className="p-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center italic text-muted-foreground">
                  {t('noMessages')}
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <tr className="border-b border-border">
                    <td className="p-3">{msg.name}</td>
                    <td className="p-3">{msg.email}</td>
                    <td className="p-3">{msg.title}</td>
                    <td className="p-3">{msg.date}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpand(msg.id)}
                        >
                          {expandedMessageIds.includes(msg.id)
                            ? t('hide')
                            : t('viewMessage')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleMarkAsRead(msg.id)}
                        >
                          {t('del')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedMessageIds.includes(msg.id) && (
                    <tr className="bg-[hsl(var(--muted)/0.2)] border-b border-border">
                      <td colSpan={5} className="p-4 whitespace-pre-wrap">
                        <p className="font-semibold mb-2">{msg.title}</p>
                        <p>{msg.message}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ContactMessages;
