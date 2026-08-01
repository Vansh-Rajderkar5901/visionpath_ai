import { DashboardStats, UpcomingClass, RecentLocation, Notification } from '@/types';

// Mock data for development
const mockStats: DashboardStats = {
  totalNavigations: 47,
  savedLocations: 12,
  upcomingClasses: 3,
  unreadNotifications: 5,
};

const mockUpcomingClasses: UpcomingClass[] = [
  {
    id: 'class-1',
    courseName: 'Computer Science 101',
    instructor: 'Dr. Sarah Johnson',
    room: 'Lab 204',
    building: 'Engineering Block',
    startTime: '2024-11-20T09:00:00',
    endTime: '2024-11-20T10:30:00',
    day: 'Monday',
  },
  {
    id: 'class-2',
    courseName: 'Mathematics - Linear Algebra',
    instructor: 'Prof. Michael Chen',
    room: 'Lecture Hall 3',
    building: 'Academic Building',
    startTime: '2024-11-21T11:00:00',
    endTime: '2024-11-21T12:30:00',
    day: 'Tuesday',
  },
  {
    id: 'class-3',
    courseName: 'Physics Lab',
    instructor: 'Dr. Emily Williams',
    room: 'Science Lab 101',
    building: 'Science Block',
    startTime: '2024-11-22T14:00:00',
    endTime: '2024-11-22T16:00:00',
    day: 'Wednesday',
  },
];

const mockRecentLocations: RecentLocation[] = [
  {
    id: 'loc-1',
    name: 'Lab 204',
    building: 'Engineering Block',
    floor: '2nd Floor',
    lastVisited: '2024-11-19T10:30:00',
    frequency: 15,
  },
  {
    id: 'loc-2',
    name: 'Library',
    building: 'Academic Building',
    floor: 'Ground Floor',
    lastVisited: '2024-11-18T15:00:00',
    frequency: 23,
  },
  {
    id: 'loc-3',
    name: 'Cafeteria',
    building: 'Student Center',
    floor: '1st Floor',
    lastVisited: '2024-11-19T12:00:00',
    frequency: 30,
  },
  {
    id: 'loc-4',
    name: 'Principals Office',
    building: 'Admin Block',
    floor: '1st Floor',
    lastVisited: '2024-11-17T09:00:00',
    frequency: 5,
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'class',
    title: 'Upcoming Class',
    message: 'Computer Science 101 starts in 30 minutes in Lab 204',
    read: false,
    createdAt: '2024-11-20T08:30:00',
    actionUrl: '/dashboard/map?destination=Lab204',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'event',
    title: 'Tech Workshop',
    message: 'AI & Accessibility Workshop tomorrow at 2 PM in Auditorium',
    read: false,
    createdAt: '2024-11-19T16:00:00',
    actionUrl: '/dashboard/events',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'navigation',
    title: 'Navigation Reminder',
    message: 'Your saved route to Library is frequently used at this time',
    read: true,
    createdAt: '2024-11-19T14:00:00',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your accessibility preferences have been saved successfully',
    read: true,
    createdAt: '2024-11-18T10:00:00',
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'emergency',
    title: 'Emergency Drill',
    message: 'Scheduled emergency evacuation drill at 3 PM today',
    read: false,
    createdAt: '2024-11-20T07:00:00',
  },
];

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockStats;
  },

  async getUpcomingClasses(): Promise<UpcomingClass[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUpcomingClasses;
  },

  async getRecentLocations(): Promise<RecentLocation[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockRecentLocations;
  },

  async getNotifications(): Promise<Notification[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockNotifications;
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockNotifications.forEach((n) => (n.read = true));
  },
};

