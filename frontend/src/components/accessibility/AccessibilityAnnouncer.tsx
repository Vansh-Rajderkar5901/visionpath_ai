'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useVoice } from '@/contexts/VoiceContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { getRouteAnnouncement } from './routeAnnouncements';
import { buildAnnouncement, isAnnounceable } from '@/lib/announceUtils';

/**
 * Global screen-reader + speech announcer.
 *
 * Responsibilities:
 *  1. Announces the page title + purpose whenever the route changes.
 *  2. Listens to global `focusin` and `mouseenter` (delegated) and speaks a
 *     description of the focused/hovered interactive element.
 *  3. Renders hidden `aria-live` regions so standard screen readers (NVDA,
 *     JAWS, Narrator, VoiceOver) also receive the announcements.
 *  4. Announces menu open/close and other important state changes by
 *     observing `aria-expanded` / `aria-hidden` mutations.
 *
 * All listeners are delegated at the document level so no individual
 * component needs to change, and repeated announcements are suppressed.
 */
export function AccessibilityAnnouncer() {
  const { announce, speakDescriptive, speech, setSpeech } = useVoice();
  const { preferences } = useAccessibility();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasAnnouncedInitRef = useRef(false);
  const lastFocusedRef = useRef<Element | null>(null);
  const lastHoveredRef = useRef<Element | null>(null);
  const lastAnnouncedDescRef = useRef('');

  // Toggle speech on/off based on the user's textToSpeech preference.
  // We keep the panel's manual "enabled" toggle as the master switch, but if
  // the user has never explicitly toggled it off, honor their preference.
  useEffect(() => {
    // Only auto-enable when the user hasn't explicitly disabled speech.
    // We won't override an explicit manual change; we only set initial state.
    if (!hasAnnouncedInitRef.current) {
      setSpeech({ enabled: preferences.textToSpeech !== false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Announce page load / navigation.
  // Use a ref to avoid re-announcing on the same route multiple times.
  const lastPathKeyRef = useRef<string>('');
  useEffect(() => {
    const key = pathname + '?' + searchParams.toString();
    if (lastPathKeyRef.current === key && hasAnnouncedInitRef.current) {
      return;
    }
    lastPathKeyRef.current = key;

    const info = getRouteAnnouncement(pathname);
    const navigationAnnouncement = hasAnnouncedInitRef.current
      ? `Navigated to ${info.title}. ${info.purpose}`
      : `${info.title} ${info.purpose}`;

    // Introduce the app on the very first load.
    const intro = hasAnnouncedInitRef.current
      ? ''
      : 'Welcome to VisionPath AI. ';

    // A short delay lets the page render before we speak.
    const timer = window.setTimeout(() => {
      speakDescriptive(`${intro}${navigationAnnouncement}`, { force: true });
      hasAnnouncedInitRef.current = true;
    }, 350);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams, speakDescriptive]);

  // Global focus + hover announcement delegation.
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (!target || !('documentElement' in target.ownerDocument ? target.ownerDocument.documentElement : document.documentElement)) return;
      if (target === lastFocusedRef.current) return;
      lastFocusedRef.current = target;

      if (isAnnounceable(target)) {
        const desc = buildAnnouncement(target);
        if (desc && desc !== lastAnnouncedDescRef.current) {
          lastAnnouncedDescRef.current = desc;
          announce(desc);
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target === lastHoveredRef.current) return;
      lastHoveredRef.current = target;

      if (isAnnounceable(target)) {
        const desc = buildAnnouncement(target);
        if (desc && desc !== lastAnnouncedDescRef.current) {
          lastAnnouncedDescRef.current = desc;
          announce(desc);
        }
      }
    };

    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [announce]);

  // Announce open/close of menus/dialogs + typing into inputs.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const interactive = target.closest('button, a, [role="button"], [role="menuitem"], [role="tab"], select, input, textarea');
      if (!interactive) return;

      // Dropdown / select changes
      if (interactive.tagName.toLowerCase() === 'select') {
        const sel = interactive as HTMLSelectElement;
        const label = sel.getAttribute('aria-label') || sel.textContent?.trim() || 'selection';
        announce(`${label}: ${sel.value} selected.`, { force: true });
        return;
      }

      // Buttons with aria-expanded -> announce open/close
      const expanded = interactive.getAttribute('aria-expanded');
      if (expanded === 'true' || expanded === 'false') {
        const name = interactive.getAttribute('aria-label') || interactive.textContent?.trim() || 'Menu';
        announce(
          expanded === 'true' ? `${name} expanded.` : `${name} collapsed.`,
          { force: true }
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
        const name = target.getAttribute('aria-label') || target.getAttribute('placeholder') || 'Field';
        // Debounce value announcement to avoid spamming.
        if (e.key === 'Enter') {
          announce(`${name}: ${(target as HTMLInputElement).value}`);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keyup', handleKeyUp, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [announce]);

  // Provide a live region for screen readers.
  const livePoliteRef = useRef<HTMLDivElement>(null);
  const liveAssertiveRef = useRef<HTMLDivElement>(null);

  // Keep the polite live region in sync with speech announcements.
  useEffect(() => {
    if (!speech.lastSpoken) return;
    if (livePoliteRef.current) {
      livePoliteRef.current.textContent = speech.lastSpoken;
    }
  }, [speech.lastSpoken]);

  return (
    <>
      {/* Hidden live regions for standard screen readers */}
      <div
        id="visionpath-live-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        ref={livePoliteRef}
        className="sr-only"
      />
      <div
        id="visionpath-live-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={liveAssertiveRef}
        className="sr-only"
      />
    </>
  );
}
