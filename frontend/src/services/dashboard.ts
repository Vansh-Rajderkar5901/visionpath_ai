import { DashboardStats, UpcomingClass, RecentLocation } from '@/types';

// Mock data for development
const mockStats: DashboardStats = {
  totalNavigations: 47,
  savedLocations: 12,
  upcomingClasses: 3,
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
};
