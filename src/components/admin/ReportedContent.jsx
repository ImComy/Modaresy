import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTutors } from '@/data/enhanced';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const reportedComments = [
  {
    id: 'rc1',
    tutorId: 1,
    commentId: 1,
    user: { id: 'stu001', name: 'Student A', email: 'studentA@example.com' },
    commentAuthor: { id: 'tut001', name: 'Ahmed Samir', email: 'ahmed@example.com' },
    text: 'Inappropriate comment',
    reason: 'Offensive',
    date: '2025-04-16',
  },
];

const reportedTutors = [
  {
    id: 'rt1',
    tutorId: 1,
    user: { id: 'par002', name: 'Parent B', email: 'parentB@example.com' },
    reason: 'Unprofessional behavior during group class',
    date: '2025-04-15',
  },
];

const ReportedContent = () => {
  const { t } = useTranslation();
  const [expandedComment, setExpandedComment] = useState(null);
  const [expandedTutor, setExpandedTutor] = useState(null);

  const handleDeleteComment = (commentId) => {
    console.log('Delete comment:', commentId);
  };

  const handleBanTutor = (tutorId) => {
    console.log('Ban tutor:', tutorId);
  };

  return (
    <Card className="p-6 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] space-y-6">
      {/* Reported Comments */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
          {t('reportedContent.reportedComments')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                <th className="p-3">{t('reportedContent.tutor')}</th>
                <th className="p-3">{t('reportedContent.reportedBy')}</th>
                <th className="p-3">{t('reportedContent.date')}</th>
                <th className="p-3">{t('reportedContent.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reportedComments.map((comment) => {
                const tutor = mockTutors.find((t) => t.id === comment.tutorId);
                const isExpanded = expandedComment === comment.id;
                return (
                  <React.Fragment key={comment.id}>
                    <tr className="border-b border-border">
                      <td className="p-3">
                        {tutor ? (
                          <Link
                            to={`/tutor/${tutor.id}`}
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                          >
                            {tutor.name}
                          </Link>
                        ) : (
                          t('reportedContent.unknown')
                        )}
                      </td>
                      <td className="p-3">{comment.user.name}</td>
                      <td className="p-3">{comment.date}</td>
                      <td className="p-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpandedComment((prev) => (prev === comment.id ? null : comment.id))
                          }
                        >
                          {isExpanded
                            ? t('reportedContent.hideDetails')
                            : t('reportedContent.showDetails')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          {t('reportedContent.delete')}
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[hsl(var(--muted)/0.2)] text-muted-foreground">
                        <td colSpan={4} className="p-4 whitespace-pre-wrap space-y-2">
                          <div>
                            <strong>{t('reportedContent.comment')}:</strong> {comment.text}
                          </div>
                          <div>
                            <strong>{t('reportedContent.reason')}:</strong> {comment.reason}
                          </div>
                          <div className="mt-2">
                            <strong>{t('reportedContent.reportedBy')}:</strong><br />
                            ID: {comment.user.id}<br />
                            {t('reportedContent.name')}: {comment.user.name}<br />
                            {t('reportedContent.email')}: {comment.user.email}
                          </div>
                          <div className="mt-2">
                            <strong>{t('reportedContent.commentAuthor')}:</strong><br />
                            ID: {comment.commentAuthor.id}<br />
                            {t('reportedContent.name')}: {comment.commentAuthor.name}<br />
                            {t('reportedContent.email')}: {comment.commentAuthor.email}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reported Tutors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
          {t('reportedContent.reportedTutors')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                <th className="p-3">{t('reportedContent.tutor')}</th>
                <th className="p-3">{t('reportedContent.reportedBy')}</th>
                <th className="p-3">{t('reportedContent.date')}</th>
                <th className="p-3">{t('reportedContent.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reportedTutors.map((report) => {
                const tutor = mockTutors.find((t) => t.id === report.tutorId);
                const isExpanded = expandedTutor === report.id;
                return (
                  <React.Fragment key={report.id}>
                    <tr className="border-b border-border">
                      <td className="p-3">
                        {tutor ? (
                          <Link
                            to={`/tutor/${tutor.id}`}
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                          >
                            {tutor.name}
                          </Link>
                        ) : (
                          t('reportedContent.unknown')
                        )}
                      </td>
                      <td className="p-3">{report.user.name}</td>
                      <td className="p-3">{report.date}</td>
                      <td className="p-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpandedTutor((prev) => (prev === report.id ? null : report.id))
                          }
                        >
                          {isExpanded
                            ? t('reportedContent.hideReason')
                            : t('reportedContent.showReason')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBanTutor(report.tutorId)}
                        >
                          {t('reportedContent.ban')}
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[hsl(var(--muted)/0.2)] text-muted-foreground">
                        <td colSpan={4} className="p-4 whitespace-pre-wrap space-y-2">
                          <div>
                            <strong>{t('reportedContent.reason')}:</strong> {report.reason}
                          </div>
                          <div className="mt-2">
                            <strong>{t('reportedContent.reportedBy')}:</strong><br />
                            ID: {report.user.id}<br />
                            {t('reportedContent.name')}: {report.user.name}<br />
                            {t('reportedContent.email')}: {report.user.email}
                          </div>
                          {tutor && (
                            <div className="mt-2">
                              <strong>{t('reportedContent.reportedTutor')}:</strong><br />
                              ID: {tutor.id}<br />
                              {t('reportedContent.name')}: {tutor.name}<br />
                              {t('reportedContent.email')}: {tutor.email}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default ReportedContent;
