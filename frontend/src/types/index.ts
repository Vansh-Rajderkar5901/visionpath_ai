// Shared types. These mirror the JSON the FastAPI backend returns — the API
// serialises in camelCase specifically so these interfaces map one-to-one.

// ============================================
// User & Authentication
// ============================================

export type AccessibilityMode = 'visually-impaired' | 'low-vision' | 'standard';

export type UserRole = 'user' | 'admin';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phoneNumber?: string | null;
  photoURL?: string;
  role: UserRole;
  accessibilityMode: AccessibilityMode;
  accountStatus: AccountStatus;
  preferences: UserPreferences;
  createdAt: string | null;
  updatedAt: string | null;
  lastLogin?: string | null;
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
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Speech (text-to-speech) runtime settings used by the accessibility speech
 * engine. These stay on the device — they are quick controls in the
 * accessibility panel, not part of the saved profile.
 */
export interface SpeechSettings {
  /** Master on/off switch for all speech announcements. */
  enabled: boolean;
  /** When true, no speech is produced. */
  muted: boolean;
  /** Volume from 0 to 1. */
  volume: number;
  /** Index into the browser's available voices list. */
  selectedVoiceIndex: number;
  /** The last text that was spoken (for "repeat last announcement"). */
  lastSpoken: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// ============================================
// Navigation
// ============================================

export type FacilityType =
  | 'washroom'
  | 'elevator'
  | 'stairs'
  | 'entrance'
  | 'exit'
  | 'water'
  | 'security'
  | 'medical'
  | 'cafeteria'
  | 'facility'
  | 'atm';

export type DestinationType = FacilityType | 'room' | 'office' | 'lab' | 'library';

export interface Building {
  /** The building code, e.g. "CSE" — stable and human readable. */
  id: string;
  buildingId: number;
  name: string;
  code: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  totalFloors: number;
  floors: Floor[];
}

export interface Floor {
  id: string;
  floorId: number;
  name: string;
  level: number;
  mapUrl?: string | null;
  rooms: string[];
  facilities: Facility[];
}

export interface Coordinates {
  x: number;
  y: number;
  floor: number;
}

export interface Facility {
  id: string;
  name: string;
  nodeId: string | null;
  type: FacilityType;
  coordinates: Coordinates;
}

export interface NavigationDestination {
  id: string;
  name: string;
  nodeId: string | null;
  building: string;
  buildingCode: string;
  floor: string;
  floorLevel: number;
  type: DestinationType;
  coordinates: Coordinates;
}

/** A routable point in the campus graph. */
export interface GraphNode {
  nodeId: string;
  name: string;
  type: string;
  floorId: number | null;
  locationId: number | null;
  locationName: string | null;
}

export interface NavigationInstruction {
  text: string;
  distance: number;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrived';
  landmark?: string;
}

export interface RouteEndpoint {
  nodeId: string;
  name: string;
}

/** The response from POST /api/navigation/route. */
export interface NavigationRoute {
  path: string[];
  pathLabels: string[];
  /** Total walking distance in metres. */
  distance: number;
  /** Estimated walking time in seconds. */
  estimatedTime: number;
  instructions: NavigationInstruction[];
  spokenInstructions: string[];
  start: RouteEndpoint;
  end: RouteEndpoint;
}

export interface NavigationHistoryEntry {
  id: string;
  sourceNodeId: string | null;
  destinationNodeId: string | null;
  navigationDate: string | null;
  travelTime: number;
  distance: number;
  status: string;
}

// ============================================
// OCR
// ============================================

export interface OCRResult {
  text: string;
  /** Mean recognition confidence, 0..1. */
  confidence: number;
  language: string;
  characterCount: number;
}

export interface OCRStatus {
  available: boolean;
  message: string;
}

// ============================================
// Emergency
// ============================================

export type AlertType = 'sos' | 'medical' | 'security' | 'fire';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy?: number | null;
  building?: string | null;
  floor?: string | null;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName?: string | null;
  type: AlertType;
  location: GeoLocation;
  status: 'active' | 'resolved';
  message?: string | null;
  timestamp: string | null;
  resolvedAt?: string | null;
}

export interface SOSResponse {
  alert: EmergencyAlert;
  notifiedContacts: EmergencyContact[];
  message: string;
}

// ============================================
// Voice Assistant
// ============================================

export type VoiceCommandIntent =
  | 'navigate'
  | 'read'
  | 'call'
  | 'open'
  | 'search'
  | 'emergency'
  | 'help'
  | 'cancel'
  | 'unknown';

export interface VoiceAction {
  type: 'navigate' | 'open' | 'read-aloud' | 'call' | 'emergency-sos' | 'cancel';
  nodeId?: string;
  name?: string;
  url?: string;
  contact?: string;
}

/** The response from POST /api/voice/command. */
export interface VoiceCommandResult {
  transcript: string;
  intent: VoiceCommandIntent;
  entities: Record<string, string>;
  action: VoiceAction | null;
  route: NavigationRoute | null;
  matches: NavigationDestination[];
  response: string;
}

export interface VoiceExample {
  command: string;
  description: string;
  intent: string;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  continuousMode: boolean;
}

// ============================================
// Notifications
// ============================================

export type NotificationType = 'class' | 'event' | 'emergency' | 'navigation' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string | null;
}

export interface NotificationList {
  items: AppNotification[];
  unreadCount: number;
}

// ============================================
// Dashboard
// ============================================

export interface DashboardStats {
  totalNavigations: number;
  savedLocations: number;
  upcomingClasses: number;
  unreadNotifications: number;
  emergencyContacts: number;
  navigationsThisWeek: number;
}

export interface UpcomingClass {
  id: string;
  courseName: string;
  instructor: string | null;
  room: string;
  building: string;
  nodeId: string | null;
  day: string;
  startTime: string | null;
  endTime: string | null;
}

export interface RecentLocation {
  id: string;
  nodeId: string;
  name: string;
  building: string;
  floor: string;
  lastVisited: string | null;
  frequency: number;
}

// ============================================
// Admin
// ============================================

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  navigationsThisWeek: number;
  buildingsMapped: number;
  activeAlerts: number;
  graphNodes: number;
  mappedLocations: number;
}

export interface ActivityEvent {
  type: 'user' | 'alert' | 'navigation';
  action: string;
  timestamp: string | null;
}

// ============================================
// Map
// ============================================

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  type: 'building' | 'entrance' | 'facility' | 'destination' | 'user';
  icon?: string;
}
