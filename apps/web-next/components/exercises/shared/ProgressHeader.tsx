'use client';
import React from 'react';
import { Clock, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface ProgressHeaderProps {
  title: string;
  subtitle?: string;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  timer?: {
    elapsed: number;
    format?: (seconds: number) => string;
  };
  hint?: {
    content: string;
    onToggle: () => void;
    isVisible: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

export function ProgressHeader({
  title,
  subtitle,
  progress,
  timer,
  hint,
  className,
  children
}: ProgressHeaderProps) {
  const defaultFormatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = timer?.format || defaultFormatTime;

  return (
    <div className={cn('mb-6', className)}>
      {/* Progress indicator */}
      {progress && (
        <div className="text-center mb-4">
          <span className="font-bold text-lg font-comic">
            {progress.label || 'SENTENCE'} {progress.current}/{progress.total}
          </span>
        </div>
      )}

      {/* Main header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold font-comic underline decoration-2 underline-offset-4">
          {title.toUpperCase()}
        </h2>
        {subtitle && (
          <p className="mt-2 text-gray-600 font-comic">
            {subtitle}
          </p>
        )}
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center">
        {/* Timer */}
        {timer && (
          <div className="flex items-center gap-2 font-bold font-comic">
            <Clock className="w-5 h-5" />
            <span>{formatTime(timer.elapsed)}</span>
          </div>
        )}

        {/* Custom controls */}
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}

        {/* Hint button */}
        {hint && (
          <motion.button
            onClick={hint.onToggle}
            className={cn(
              'p-2 rounded-lg border-2 border-black',
              'font-comic',
              'transition-colors duration-200',
              hint.isVisible ? 'bg-yellow-200' : 'bg-white hover:bg-gray-100'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Separate component for hint display
interface HintDisplayProps {
  content: string;
  onClose: () => void;
  className?: string;
}

export function HintDisplay({ content, onClose, className }: HintDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative p-4 mb-4',
        'bg-yellow-100 border-3 border-black rounded-xl',
        'shadow-[3px_3px_0_black]',
        'font-comic',
        className
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-black"
      >
        ×
      </button>
      <div className="flex items-start gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{content}</p>
      </div>
    </motion.div>
  );
}