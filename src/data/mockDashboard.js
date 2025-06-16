export const dashboardData = {
  profileVisits: 1234,
  studentsContacted: 85,
  activeStudents: 25,
  pendingMessages: 3,
  monthlyEarnings: 4500,
};

export const chartdata = [
  { month: 'Jan', visits: 10, signups: 5 },
  { month: 'Feb', visits: 20, signups: 15 },
  { month: 'Mar', visits: 30, signups: 25 },
  { month: 'Apr', visits: 25, signups: 20 },
  { month: 'May', visits: 40, signups: 35 },
];

export const ActionTypes = Object.freeze({
  CONTACTED: 'has contacted you',
  VIEWED_PROFILE: 'viewed your profile',
  RATED: 'rated your session',
  LEFT_REVIEW: 'left a review',
});

export const mockLogs = [
  { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
  { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
  { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
  { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
  { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
  { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
  { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
  { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
  { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
  { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
  { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
  { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
  { name: 'Ahmed Amr', phone: '+20 0123456789', action: ActionTypes.CONTACTED, time: '6:00 AM', date: '2023-10-01' },
  { name: 'Sara Tarek', phone: '+20 0123456789', action: ActionTypes.VIEWED_PROFILE, time: '7:30 AM', date: '2024-10-01' },
  { name: 'Hana Fathy', phone: '+20 0123456789', action: ActionTypes.RATED, time: '11:05 AM', date: '2023-10-01' },
  { name: 'Rania Magdy', phone: '+20 0123456789', action: ActionTypes.LEFT_REVIEW, time: '5:45 PM', date: '2023-10-01' },
];

export const actionShortLabels = (t) => ({
  "has contacted you": t("logs.contactedShort"),
  "viewed your profile": t("logs.viewedShort"),
  "rated your session": t("logs.ratedShort"),
  "left a review": t("logs.reviewedShort"),
});