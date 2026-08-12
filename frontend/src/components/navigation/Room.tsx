'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RoomProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Reusable, clickable room card.
 * When selected it gets a blue (primary) background, white text,
 * a shadow and a smooth scale animation.
 */
export function Room({ label, selected, onClick, className }: RoomProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      animate={{ scale: selected ? 1.06 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      aria-pressed={selected}
      className={cn(
        'w-full h-full min-h-[38px] rounded-lg border text-[10px] sm:text-xs font-semibold',
        'flex items-center justify-center text-center leading-tight px-1',
        'transition-colors duration-200 shadow-sm hover:shadow',
        selected
          ? 'bg-primary-600 text-white border-primary-700 shadow-lg shadow-primary-500/40'
          : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300',
        className
      )}
    >
      {label}
    </motion.button>
  );
}
