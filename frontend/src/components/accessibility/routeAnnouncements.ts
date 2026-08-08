/**
 * Route -> announcement map.
 *
 * Each entry describes a page so the screen-reader announcer can greet the
 * user and explain what the page is for as soon as it loads. Keys are route
 * pathnames (without query strings). The wildcard `*` is used as a fallback.
 */
export interface RouteAnnouncement {
  title: string;
  purpose: string;
}

export const routeAnnouncements: Record<string, RouteAnnouncement> = {
  '/': {
    title: 'Welcome to VisionPath AI.',
    purpose:
      'This is the home page. It introduces the platform for AI powered indoor navigation and accessibility. Use Sign In to log in, or Get Started to create an account.',
  },
  '/login': {
    title: 'You are on the Sign In page.',
    purpose: 'This page allows you to sign in to your VisionPath AI account using your email and password.',
  },
  '/register': {
    title: 'You are on the Create Account page.',
    purpose: 'This page allows you to create a new account. Fill in your name, email, and password to get started.',
  },
  '/forgot-password': {
    title: 'You are on the Forgot Password page.',
    purpose: 'This page allows you to reset your password using your registered email address.',
  },
  '/onboarding': {
    title: 'You are on the Accessibility Setup page.',
    purpose:
      'This page lets you choose how you want to experience VisionPath. Select visually impaired, low vision, or standard mode.',
  },
  '/dashboard': {
    title: 'You are on the Dashboard.',
    purpose:
      'This page shows your accessibility overview, quick actions, upcoming classes, recent locations, and the campus map.',
  },
  '/dashboard/map': {
    title: 'You are on the Map and Navigation page.',
    purpose: 'This page allows you to search for buildings and destinations on an interactive map.',
  },
  '/dashboard/indoor': {
    title: 'You are on the Indoor Navigation page.',
    purpose:
      'This page allows you to select a building, floor, and destination to get indoor navigation directions.',
  },
  '/dashboard/voice': {
    title: 'You are on the Voice Assistant page.',
    purpose: 'This page allows you to control VisionPath using natural voice commands.',
  },
  '/dashboard/ocr': {
    title: 'You are on the OCR Reader page.',
    purpose: 'This page allows you to upload an image or document and read the extracted text aloud.',
  },
  '/dashboard/emergency': {
    title: 'You are on the Emergency SOS page.',
    purpose:
      'This page gives you quick access to emergency services, emergency contacts, and your live location sharing.',
  },
  '/dashboard/profile': {
    title: 'You are on the Profile and Settings page.',
    purpose:
      'This page allows you to manage your account and accessibility preferences, such as theme, font size, and voice settings.',
  },
  '/dashboard/admin': {
    title: 'You are on the Admin Panel.',
    purpose: 'This page allows administrators to manage users, buildings, maps, and platform analytics.',
  },
  '/dashboard/test': {
    title: 'You are on the Navigation Test page.',
    purpose: 'This page demonstrates the indoor navigation algorithm and routing instructions.',
  },
  '*': {
    title: 'Welcome to VisionPath AI.',
    purpose: 'Use the navigation menu to move between pages, or press Tab to explore the available controls.',
  },
};

/** Resolve the announcement for a given pathname, falling back to the wildcard. */
export function getRouteAnnouncement(pathname: string): RouteAnnouncement {
  return routeAnnouncements[pathname] || routeAnnouncements['*'];
}
