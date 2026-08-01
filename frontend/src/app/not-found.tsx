'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-dark-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-500/20">
          <Eye className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary inline-flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
