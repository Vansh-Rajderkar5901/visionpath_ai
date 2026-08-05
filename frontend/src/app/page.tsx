'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Star,
  Shield,
  Eye,
  Map,
  Mic,
  Camera,
  AlertTriangle,
  Bot,
  Check,
  ExternalLink,
} from 'lucide-react';

// ============================================
// Navigation Component
// ============================================
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-strong shadow-sm dark:shadow-dark-border/10'
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="VisionPath AI Home">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-shadow">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VisionPath
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#testimonials">Testimonials</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="btn-ghost text-sm font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 dark:border-dark-border glass-strong"
          >
            <div className="px-4 py-6 space-y-4">
              <MobileNavLink href="#features" onClick={() => setIsOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="#testimonials" onClick={() => setIsOpen(false)}>Testimonials</MobileNavLink>
              <MobileNavLink href="#faq" onClick={() => setIsOpen(false)}>FAQ</MobileNavLink>
              <div className="pt-4 space-y-3">
                <Link
                  href="/login"
                  className="block w-full text-center btn-secondary"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center btn-primary"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
  </a>
);

const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) => (
  <a
    href={href}
    onClick={onClick}
    className="block py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card font-medium transition-colors"
  >
    {children}
  </a>
);

// ============================================
// Hero Section
// ============================================
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg" />
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            AI-Powered Accessibility Platform
          </div>

          <h1 className="heading-1 mb-6">
            Navigate{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Empowering everyone with AI-powered indoor navigation, voice guidance,
            and intelligent accessibility features. Navigate any space with confidence.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="btn-primary text-lg inline-flex items-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="#features"
              className="btn-secondary text-lg inline-flex items-center"
            >
              Watch Demo
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Hero Stats */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-dark-border">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white dark:border-dark-bg flex items-center justify-center text-white text-xs font-bold"
                >
                  {['AK', 'MJ', 'PL', 'RS'][i - 1]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Trusted by 10,000+ users
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-1 shadow-2xl">
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6">
              {/* Mock Dashboard UI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Live Navigation</p>
                      <p className="text-sm text-gray-500">Engineering Block</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
                  </div>
                </div>

                {/* Mock Map */}
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 0v60M0 30h60" stroke="%236366f1" stroke-width="0.5"/%3E%3C/svg%3E")',
                  }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/50 animate-bounce-slow">
                        <Map className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500 rounded-full border-2 border-white" />
                    </div>
                  </div>
                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                    <path
                      d="M50 250 Q150 100 200 150 T350 100"
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="3"
                      strokeDasharray="8 4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Voice Command Chip */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Voice Command</p>
                    <p className="text-xs text-gray-500">&ldquo;Take me to Lab 204&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-dark-card rounded-lg">
                    <div className="w-1.5 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ============================================
// Features Section
// ============================================
const features = [
  {
    icon: Map,
    title: 'AI Navigation',
    description: 'Intelligent indoor navigation with turn-by-turn voice guidance. Never get lost in buildings again.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Mic,
    title: 'Voice Commands',
    description: 'Natural language voice control. Just speak and VisionPath responds instantly.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Eye,
    title: 'Indoor Maps',
    description: 'Detailed indoor maps with building selection, floor plans, and destination markers.',
    color: 'from-primary-500 to-accent-500',
  },
  {
    icon: Camera,
    title: 'OCR Reader',
    description: 'Read text from images and documents aloud. Perfect for notices, signs, and printed materials.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency SOS',
    description: 'One-tap emergency alert with live location sharing to your emergency contacts.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Bot,
    title: 'Object Detection',
    description: 'AI-powered object detection to identify and describe surroundings in real-time.',
    color: 'from-indigo-500 to-purple-500',
  },
];

const FeaturesSection = () => (
  <section id="features" className="section-padding relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
          <Star className="w-4 h-4" />
          Powerful Features
        </div>
        <h2 className="heading-2 mb-4">
          Everything you need to{' '}
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            navigate independently
          </span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive tools designed to make indoor spaces accessible for everyone.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 shadow-lg`}>
              <feature.icon className="w-full h-full text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// How It Works Section
// ============================================
const steps = [
  { number: '01', title: 'Create Your Profile', description: 'Tell us how you\'d like VisionPath to assist you. Choose from Visually Impaired, Low Vision, or Standard mode.' },
  { number: '02', title: 'Select Your Destination', description: 'Type or speak your destination. Search for rooms, buildings, or facilities across the campus.' },
  { number: '03', title: 'Follow Voice Guidance', description: 'Get turn-by-turn voice instructions. VisionPath guides you every step of the way.' },
];

const HowItWorksSection = () => (
  <section className="section-padding bg-gray-50 dark:bg-dark-card/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="heading-2 mb-4">How It Works</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get started in three simple steps
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="relative text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20">
              <span className="text-2xl font-bold text-white">{step.number}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-accent-200 dark:from-primary-900 dark:to-accent-900" />
            )}
            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// Accessibility Modes Section
// ============================================
const accessibilityModes = [
  {
    title: 'Visually Impaired',
    description: 'Full screen reader optimization, voice navigation, text-to-speech, voice commands, large touch targets, high contrast, and audio feedback.',
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
    features: ['Screen Reader', 'Voice Navigation', 'Text To Speech', 'Voice Commands', 'High Contrast'],
  },
  {
    title: 'Low Vision',
    description: 'Large fonts, dark mode, magnifier ready interface, high contrast, and intelligent voice assistant for enhanced visibility.',
    icon: Eye,
    color: 'from-blue-500 to-cyan-500',
    features: ['Large Fonts', 'Dark Mode', 'Magnifier Ready', 'High Contrast', 'Voice Assistant'],
  },
  {
    title: 'Standard Experience',
    description: 'Modern dashboard with full navigation, maps, and premium UI. All accessibility features available on demand.',
    icon: Shield,
    color: 'from-primary-500 to-accent-500',
    features: ['Modern Dashboard', 'Navigation', 'Maps', 'Full Features'],
  },
];

const AccessibilitySection = () => (
  <section className="section-padding">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">
          <Shield className="w-4 h-4" />
          Personalized Experience
        </div>
        <h2 className="heading-2 mb-4">
          Choose your{' '}
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            accessibility mode
          </span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          VisionPath automatically adapts to your needs from the moment you sign up.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {accessibilityModes.map((mode, index) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="relative p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border card-hover"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} p-3 mb-4 shadow-lg`}>
              <mode.icon className="w-full h-full text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{mode.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{mode.description}</p>
            <div className="space-y-2">
              {mode.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-accent-500" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// Testimonials Section
// ============================================
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Student',
    image: 'SJ',
    content: 'VisionPath has completely transformed how I navigate campus. The voice guidance is incredibly accurate and responsive.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Professor',
    image: 'MC',
    content: 'As someone with low vision, the high contrast mode and large fonts have made a world of difference. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Visually Impaired User',
    image: 'PP',
    content: 'The screen reader optimization and voice commands work flawlessly. Finally, an app that truly understands accessibility.',
    rating: 5,
  },
  {
    name: 'David Williams',
    role: 'Student',
    image: 'DW',
    content: 'The OCR reader is a lifesaver for reading notices and documents. The text-to-speech is crystal clear.',
    rating: 5,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="section-padding bg-gray-50 dark:bg-dark-card/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="heading-2 mb-4">What Our Users Say</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Hear from people who use VisionPath AI every day
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                {testimonial.image}
              </div>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// FAQ Section
// ============================================
const faqs = [
  {
    question: 'What is VisionPath AI?',
    answer: 'VisionPath AI is an AI-powered indoor navigation and accessibility platform designed to help visually impaired, low vision, and standard users navigate indoor spaces independently.',
  },
  {
    question: 'Is VisionPath free to use?',
    answer: 'Yes! VisionPath offers a free tier with full access to core features. Premium features are available for organizations and institutions.',
  },
  {
    question: 'How does voice navigation work?',
    answer: 'Simply speak your destination, and VisionPath provides turn-by-turn voice guidance. The system uses natural language processing to understand commands.',
  },
  {
    question: 'Can I use VisionPath in any building?',
    answer: 'VisionPath works in any building with mapped floor plans. We\'re continuously adding new buildings and campuses to our platform.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption for all data. Your location history and personal information are protected with industry-standard security.',
  },
];

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
                aria-expanded={openFAQ === index}
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA Section
// ============================================
const CTASection = () => (
  <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
    </div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="heading-2 text-white mb-6">
          Ready to navigate without limits?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join thousands of users who navigate independently with VisionPath AI.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-700 font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl shadow-black/20"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-colors"
          >
            Learn More
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============================================
// Footer
// ============================================
const Footer = () => (
  <footer className="bg-gray-900 dark:bg-dark-bg text-gray-400">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VisionPath</span>
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered indoor navigation and accessibility platform for everyone.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">© 2024 VisionPath AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// ============================================
// Main Landing Page
// ============================================
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AccessibilitySection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}

