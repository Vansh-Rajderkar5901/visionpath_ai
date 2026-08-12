// ============================================
// User & Authentication Types
// ============================================

export type AccessibilityMode = 'visually-impaired' | 'low-vision' | 'standard';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  accessibilityMode: AccessibilityMode;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large' | 'x-large';
  voiceSpeed: number;
  language: string;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  voiceNavigation: boolean;
  textToSpeech: boolean;
  voiceCommands: boolean;
  largeTouchTargets: boolean;
  audioFeedback: boolean;
  magnifierReady: boolean;
  continuousListening: boolean;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  classReminders: boolean;
  eventAlerts: boolean;
  emergencyAlerts: boolean;
  navigationReminders: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================
// Navigation Types
// ============================================

export interface Building {
  id: string;
  name: string;
  code: string;
  floors: Floor[];
  latitude: number;
  longitude: number;
  image?: string;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  mapUrl?: string;
  rooms: string[];
  facilities: Facility[];
}

export interface Facility {
  id: string;
  name: string;
  type: 'washroom' | 'elevator' | 'stairs' | 'entrance' | 'exit' | 'water' | 'security' | 'medical' | 'cafeteria' | 'facility' | 'atm';
  coordinates: Coordinates;
}

export interface Coordinates {
  x: number;
  y: number;
  floor: number;
}

export interface NavigationDestination {
  id: string;
  name: string;
  building: string;
  floor: string;
  coordinates: Coordinates;
  type: 'room' | 'facility' | 'office' | 'lab' | 'library' | 'entrance';
}

export interface NavigationRoute {
  start: Coordinates;
  end: Coordinates;
  waypoints: Coordinates[];
  distance: number;
  estimatedTime: number;
  instructions: NavigationInstruction[];
}

export interface NavigationInstruction {
  text: string;
  distance: number;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrived';
  landmark?: string;
}

// ============================================
// OCR Types
// ============================================

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
  blocks?: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  boundingBox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// Emergency Types
// ============================================

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'sos' | 'medical' | 'security' | 'fire';
  location: GeoLocation;
  status: 'active' | 'resolved';
  timestamp: string;
  message?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  building?: string;
  floor?: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: 'class' | 'event' | 'emergency' | 'navigation' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ============================================
// Voice Assistant Types
// ============================================

export type VoiceCommandIntent =
  | 'navigate'
  | 'read'
  | 'call'
  | 'open'
  | 'search'
  | 'emergency'
  | 'help'
  | 'cancel';

export interface VoiceCommand {
  text: string;
  intent: VoiceCommandIntent;
  confidence: number;
  entities: Record<string, string>;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  continuousMode: boolean;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalNavigations: number;
  savedLocations: number;
  upcomingClasses: number;
  unreadNotifications: number;
}

export interface UpcomingClass {
  id: string;
  courseName: string;
  instructor: string;
  room: string;
  building: string;
  startTime: string;
  endTime: string;
  day: string;
}

export interface RecentLocation {
  id: string;
  name: string;
  building: string;
  floor: string;
  lastVisited: string;
  frequency: number;
}

// ============================================
// API Response Types
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Map Types
// ============================================

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  type: 'building' | 'entrance' | 'facility' | 'destination' | 'user';
  icon?: string;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}
