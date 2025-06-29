import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Notifications = () => {
  const { t } = useTranslation();
  const [recipientType, setRecipientType] = useState('all');
  const [identifierType, setIdentifierType] = useState('email');
  const [specificValue, setSpecificValue] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const payload =
      recipientType === 'specific'
        ? { recipient: 'specific', by: identifierType, value: specificValue }
        : { recipient: recipientType };

    console.log('Send notification:', {
      ...payload,
      title,
      message,
    });

    setTitle('');
    setMessage('');
    setSpecificValue('');
  };

  return (
    <Card className="p-6 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
        {t('sendNotification', 'Send Custom Notifications')}
      </h2>
      <div className="space-y-4">
        <Select value={recipientType} onValueChange={setRecipientType}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectRecipient', 'Select recipient')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allUsers', 'All Users & Tutors')}</SelectItem>
            <SelectItem value="students">{t('students', 'Students')}</SelectItem>
            <SelectItem value="tutors">{t('tutors', 'Tutors')}</SelectItem>
            <SelectItem value="specific">{t('specificUser', 'Specific User')}</SelectItem>
          </SelectContent>
        </Select>

        {recipientType === 'specific' && (
          <div className="space-y-2">
            <Select value={identifierType} onValueChange={setIdentifierType}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectIdentifier', 'Select identifier type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">{t('email', 'Email')}</SelectItem>
                <SelectItem value="id">{t('id', 'User ID')}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={specificValue}
              onChange={(e) => setSpecificValue(e.target.value)}
              placeholder={
                identifierType === 'email'
                  ? t('enterEmail', 'Enter user email')
                  : t('enterId', 'Enter user ID')
              }
            />
          </div>
        )}

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('notificationTitle', 'Notification Title')}
        />

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('notificationMessage', 'Notification Message')}
          rows={4}
        />

        <Button
          onClick={handleSend}
          disabled={
            !title ||
            !message ||
            (recipientType === 'specific' && !specificValue)
          }
        >
          {t('sendNotificationBtn', 'Send Notification')}
        </Button>
      </div>
    </Card>
  );
};

export default Notifications;
