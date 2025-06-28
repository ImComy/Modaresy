import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const passwordRequests = [
  {
    id: 'pr1',
    userId: 'u1',
    email: 'sara.ali@example.com',
    date: '2025-04-15',
    message: 'I forgot my password and can no longer log in.',
  },
  {
    id: 'pr2',
    userId: '1',
    email: 'info@modaresy.com',
    date: '2025-04-14',
    message: 'Requesting manual reset due to account lockout.',
  },
];

const PasswordRequests = () => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const handleApprove = (id) => {
    console.log('Approve password request:', id);
  };

  const handleReject = (id) => {
    console.log('Reject password request:', id);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="p-6 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
        {t('passwordRequestsTitle', 'Password Change Requests')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              <th className="p-3">{t('email', 'Email')}</th>
              <th className="p-3">{t('date', 'Date')}</th>
              <th className="p-3">{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {passwordRequests.map((request) => (
              <React.Fragment key={request.id}>
                <tr className="border-b border-border">
                  <td className="p-3">{request.email}</td>
                  <td className="p-3">{request.date}</td>
                  <td className="p-3 flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(request.id)}>
                      {t('approve', 'Approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                    >
                      {t('reject', 'Reject')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpand(request.id)}
                    >
                      {expandedId === request.id ? t('hide', 'Hide') : t('viewReason', 'View Reason')}
                    </Button>
                  </td>
                </tr>
                {expandedId === request.id && request.message && (
                  <tr className="bg-[hsl(var(--muted)/0.2)] border-b border-border">
                    <td colSpan={3} className="p-4 whitespace-pre-wrap text-muted-foreground">
                      <strong>{t('reason', 'User Message')}:</strong> {request.message}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PasswordRequests;
