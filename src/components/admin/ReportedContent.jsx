import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTutors } from '@/data/enhanced';

const reportedComments = [
  { id: 'rc1', tutorId: 1, commentId: 1, user: 'Student A', text: 'Inappropriate comment', reason: 'Offensive', date: '2025-04-16' },
];

const reportedTutors = [
  { id: 'rt1', tutorId: 1, reason: 'Unprofessional behavior', date: '2025-04-15' },
];

const ReportedContent = () => {
  const handleDeleteComment = (commentId) => {
    console.log('Delete comment:', commentId);
  };

  const handleBanTutor = (tutorId) => {
    console.log('Ban tutor:', tutorId);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reported Content</h2>
      <h3 className="text-lg font-medium mb-2">Reported Comments</h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Tutor</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Reported By</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportedComments.map(comment => (
              <tr key={comment.id} className="border-b">
                <td className="p-3">{mockTutors.find(t => t.id === comment.tutorId)?.name}</td>
                <td className="p-3">{comment.text}</td>
                <td className="p-3">{comment.user}</td>
                <td className="p-3">{comment.reason}</td>
                <td className="p-3">{comment.date}</td>
                <td className="p-3">
                  <Button variant="destructive" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="text-lg font-medium mb-2">Reported Tutors</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Tutor</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportedTutors.map(report => (
              <tr key={report.id} className="border-b">
                <td className="p-3">{mockTutors.find(t => t.id === report.tutorId)?.name}</td>
                <td className="p-3">{report.reason}</td>
                <td className="p-3">{report.date}</td>
                <td className="p-3">
                  <Button variant="destructive" onClick={() => handleBanTutor(report.tutorId)}>Ban</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ReportedContent;