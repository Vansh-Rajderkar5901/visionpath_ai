'use client';

import React from 'react';

/**
 * Keyboard-only "Skip to content" link that appears on focus. This lets
 * keyboard and screen-reader users bypass navigation and jump straight to
 * the main content, which greatly improves navigation speed for users who
 * cannot rely on the pointer.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-primary-600 focus:text-white focus:font-semibold focus:shadow-xl focus:focus-ring"
    >
      Skip to main content
    </a>
  );
}

