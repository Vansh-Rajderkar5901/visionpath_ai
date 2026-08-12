'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Shield,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Volume2,
  Type,
  Contrast,
  LogOut,
  ChevronRight,
  Palette,
  Globe,
  Headphones,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { cn } from '@/lib/utils';
import type { AccessibilityMode, UserPreferences } from '@/types';

const modeConfig: Record<AccessibilityMode, { icon: React.ElementType; label: string; description: string }> = {
  'visually-impaired': { icon: EyeOff, label: 'Visually Impaired', description: 'Screen reader, voice navigation, high contrast' },
  'low-vision': { icon: Eye, label: 'Low Vision', description: 'Large fonts, dark mode, magnifier ready' },
  'standard': { icon: Monitor, label: 'Standard', description: 'Full features with on-demand accessibility' },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { mode, preferences, updatePreferences, updateMode, isSaving } = useAccessibility();

  const currentMode = modeConfig[mode];

  // Preference writes hit the API, so a failure has to surface rather than
  // leaving the UI showing a setting that was never saved.
  const savePreference = (patch: Partial<UserPreferences>) => {
    updatePreferences(patch).catch((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not save that setting');
    });
  };

  const saveMode = (nextMode: AccessibilityMode) => {
    updateMode(nextMode)
      .then(() => toast.success('Accessibility mode updated'))
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Could not change the mode');
      });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and accessibility preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>
          <button className="btn-ghost text-sm">Edit</button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
            mode === 'visually-impaired' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' :
            mode === 'low-vision' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' :
            'bg-gray-100 dark:bg-dark-border text-gray-700'
          )}>
            <currentMode.icon className="w-3.5 h-3.5" />
            {currentMode.label}
          </div>
          <span className="text-xs text-gray-400">{user?.role === 'admin' ? 'Admin' : 'User'}</span>
        </div>
      </motion.div>

      {/* Accessibility Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-500" />
          Accessibility Mode
        </h2>
        <div className="grid gap-2">
          {(Object.entries(modeConfig) as [AccessibilityMode, typeof modeConfig['standard']][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => saveMode(key)}
              className={cn(
                'flex items-center gap-4 p-3 rounded-xl transition-all',
                mode === key
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-border border border-transparent'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                key === 'visually-impaired' ? 'bg-purple-100 dark:bg-purple-900/30' :
                key === 'low-vision' ? 'bg-blue-100 dark:bg-blue-900/30' :
                'bg-gray-100 dark:bg-dark-border'
              )}>
                <config.icon className={cn(
                  'w-5 h-5',
                  key === 'visually-impaired' ? 'text-purple-600' :
                  key === 'low-vision' ? 'text-blue-600' :
                  'text-gray-600'
                )} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
              {mode === key && (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
      >
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary-500" />
          Preferences
          {isSaving && (
            <span className="text-xs font-normal text-gray-400 ml-auto" role="status">
              Saving...
            </span>
          )}
        </h2>
        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Theme</span>
            </div>
            <div className="flex items-center gap-1">
              {(['system', 'light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => savePreference({ theme })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    preferences.theme === theme
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'
                  )}
                >
                  {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Font Size</span>
            </div>
            <div className="flex items-center gap-1">
              {(['normal', 'large', 'x-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => savePreference({ fontSize: size })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    preferences.fontSize === size
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'
                  )}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'X-Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Language</span>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => savePreference({ language: e.target.value })}
              className="text-sm bg-transparent border border-gray-200 dark:border-dark-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-3">
            <ToggleItem
              label="High Contrast"
              icon={Contrast}
              checked={preferences.highContrast}
              onChange={(v) => savePreference({ highContrast: v })}
            />
            <ToggleItem
              label="Reduced Motion"
              icon={Monitor}
              checked={preferences.reducedMotion}
              onChange={(v) => savePreference({ reducedMotion: v })}
            />
            <ToggleItem
              label="Voice Navigation"
              icon={Volume2}
              checked={preferences.voiceNavigation}
              onChange={(v) => savePreference({ voiceNavigation: v })}
            />
            <ToggleItem
              label="Large Touch Targets"
              icon={Headphones}
              checked={preferences.largeTouchTargets}
              onChange={(v) => savePreference({ largeTouchTargets: v })}
            />
          </div>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={logout}
          className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-between card-hover"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-red-600 dark:text-red-400">Logout</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </motion.div>
    </div>
  );
}

function ToggleItem({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-sm">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'w-12 h-6 rounded-full transition-colors relative',
          checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-border'
        )}
        aria-label={`Toggle ${label}`}
        role="switch"
        aria-checked={checked}
      >
        <div className={cn(
          'w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}
