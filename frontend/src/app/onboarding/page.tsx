'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Monitor, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { AccessibilityMode } from '@/types';
import toast from 'react-hot-toast';

const modes: {
  id: AccessibilityMode;
  title: string;
  description: string;
  icon: typeof Eye;
  color: string;
  features: string[];
}[] = [
  {
    id: 'visually-impaired',
    title: 'Visually Impaired',
    description: 'Full screen reader optimization, voice navigation, text-to-speech, and voice commands. Everything designed for non-visual interaction.',
    icon: EyeOff,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Screen Reader Optimization',
      'Voice Navigation',
      'Text To Speech',
      'Voice Commands',
      'Large Buttons & Touch Targets',
      'High Contrast Mode',
      'Keyboard Navigation',
      'Audio Feedback',
    ],
  },
  {
    id: 'low-vision',
    title: 'Low Vision',
    description: 'Large fonts, dark mode, magnifier ready interface, high contrast elements, and intelligent voice assistant for enhanced visibility.',
    icon: Eye,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Large Fonts',
      'Dark Mode',
      'Magnifier Ready',
      'High Contrast',
      'Voice Assistant',
      'Customizable Zoom',
    ],
  },
  {
    id: 'standard',
    title: 'Standard Experience',
    description: 'Modern dashboard with full navigation, maps, and premium UI. All accessibility features available on demand.',
    icon: Monitor,
    color: 'from-primary-500 to-accent-500',
    features: [
      'Modern Dashboard',
      'Full Navigation',
      'Interactive Maps',
      'Profile Management',
      'On-Demand Accessibility',
    ],
  },
];

export default function OnboardingPage() {
  const { setAccessibilityMode, isLoading } = useAuth();
  const { updateMode } = useAccessibility();
  const [selectedMode, setSelectedMode] = useState<AccessibilityMode | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleSelect = async () => {
    if (!selectedMode) return;
    try {
      await setAccessibilityMode(selectedMode);
      await updateMode(selectedMode);
      toast.success('Your preferences have been saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-card">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            How would you like{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VisionPath AI
            </span>{' '}
            to assist you?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose how you&apos;d like to experience VisionPath. You can change this anytime in your settings.
          </p>
        </motion.div>

        {/* Mode Selection */}
        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {modes.map((mode, index) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    setStep('confirm');
                  }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
                    selectedMode === mode.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                      : 'border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card'
                  }`}
                  aria-label={`Select ${mode.title} mode`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} p-4 flex-shrink-0 shadow-lg`}>
                      <mode.icon className="w-full h-full text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold">{mode.title}</h3>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{mode.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {mode.features.slice(0, 4).map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-border text-xs font-medium text-gray-600 dark:text-gray-400"
                          >
                            <Check className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                        {mode.features.length > 4 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-border text-xs font-medium text-gray-500">
                            +{mode.features.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-lg mx-auto"
            >
              {selectedMode && (
                <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-xl">
                  {(() => {
                    const mode = modes.find((m) => m.id === selectedMode)!;
                    return (
                      <>
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mode.color} p-5 mx-auto mb-6 shadow-lg`}>
                          <mode.icon className="w-full h-full text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">{mode.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                          This will personalize your entire interface
                        </p>

                        <div className="space-y-3 mb-8">
                          {mode.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleSelect}
                          disabled={isLoading}
                          className="btn-primary w-full flex items-center justify-center text-lg py-4"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Get Started with {mode.title}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setStep('select')}
                          className="w-full text-center mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Go back and choose differently
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

