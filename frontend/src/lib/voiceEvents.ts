/**
 * Typed window events used by the voice assistant to drive the rest of the app.
 *
 * The assistant lives in a provider above every page, so it cannot call into a
 * page directly. It dispatches these events instead, and pages subscribe with
 * `onVoiceEvent`. Keeping the names and payloads in one module is what stops a
 * dispatcher and a listener from silently disagreeing — the previous version
 * emitted a `navigate` event that nothing listened for.
 */

import type { NavigationDestination, NavigationRoute } from '@/types';

export const VOICE_EVENTS = {
  navigate: 'visionpath:navigate',
  readAloud: 'visionpath:read-aloud',
  search: 'visionpath:search',
  emergencySOS: 'visionpath:emergency-sos',
} as const;

export interface VoiceNavigateDetail {
  nodeId: string;
  name: string;
  /** Present when the assistant already knew where the user was standing. */
  route: NavigationRoute | null;
}

export interface VoiceSearchDetail {
  query: string;
  matches: NavigationDestination[];
}

interface VoiceEventMap {
  [VOICE_EVENTS.navigate]: VoiceNavigateDetail;
  [VOICE_EVENTS.readAloud]: undefined;
  [VOICE_EVENTS.search]: VoiceSearchDetail;
  [VOICE_EVENTS.emergencySOS]: undefined;
}

export function emitVoiceEvent<K extends keyof VoiceEventMap>(
  name: K,
  detail?: VoiceEventMap[K]
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribe to a voice event. Returns an unsubscribe function for cleanup. */
export function onVoiceEvent<K extends keyof VoiceEventMap>(
  name: K,
  handler: (detail: VoiceEventMap[K]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    handler((event as CustomEvent<VoiceEventMap[K]>).detail);
  };

  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
