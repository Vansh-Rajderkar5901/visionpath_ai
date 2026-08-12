'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, Loader2, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';

type Stage = 'request' | 'sent' | 'set-password' | 'done';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      // In development the API hands back the token directly, so the reset can
      // be completed here. With an email provider configured it does not, and
      // the user follows the emailed link instead.
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setStage('set-password');
      } else {
        setStage('sent');
      }
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start the reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setStage('done');
      toast.success('Password updated. You can sign in now.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reset the password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-dark-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              VisionPath
            </span>
          </Link>

          {stage === 'request' && (
            <>
              <h1 className="text-3xl font-bold mb-2">Forgot password?</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your email and we&apos;ll help you set a new one.
              </p>
            </>
          )}

          {stage === 'sent' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-gray-600 dark:text-gray-400">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
            </div>
          )}

          {stage === 'set-password' && (
            <>
              <h1 className="text-3xl font-bold mb-2">Choose a new password</h1>
              <p className="text-gray-600 dark:text-gray-400">
                At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
              </p>
            </>
          )}

          {stage === 'done' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold">Password updated</h1>
              <p className="text-gray-600 dark:text-gray-400">Taking you to sign in...</p>
            </div>
          )}
        </div>

        {stage === 'request' && (
          <form onSubmit={handleRequest} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  aria-required="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
          </form>
        )}

        {stage === 'set-password' && (
          <form onSubmit={handleSetPassword} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="input-field pl-12"
                  placeholder="Min. 8 characters"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="input-field pl-12"
                  placeholder="Repeat your password"
                  aria-required="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}

        {stage !== 'done' && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        )}
      </motion.div>
    </main>
  );
}
