'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';

export interface CardProps {
  variant?: 'selectable' | 'draggable' | 'filled' | 'blank' | 'option';
  color?: string;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  'data-accept'?: boolean;
  badge?: string | number;
}

// Pastel color palette matching your design examples
export const CARD_COLORS = {
  blue: '#d0f0ff',
  pink: '#ffc0cb',
  green: '#b3ecb3',
  yellow: '#fef4d6',
  purple: '#e0e0ff',
  orange: '#ffe08a',
  mint: '#e0fff7',
  lavender: '#f0e0ff',
  coral: '#ffe0e0',
  sky: '#d0eaff'
};

export function Card({
  variant = 'selectable',
  color,
  selected = false,
  disabled = false,
  size = 'medium',
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  className,
  children,
  style,
  badge,
  ...props
}: CardProps) {
  const isDraggable = variant === 'draggable';
  const isDropZone = props['data-accept'];

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    selectable: 'cursor-pointer hover:transform hover:scale-105',
    draggable: 'cursor-grab active:cursor-grabbing',
    filled: 'cursor-default',
    blank: 'cursor-default border-b-2 border-black',
    option: 'cursor-pointer hover:transform hover:-translate-y-1'
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center',
    'font-bold font-comic',
    'transition-all duration-200',
    'select-none',
    sizeClasses[size],
    variantClasses[variant],
    {
      'border-3 border-black rounded-xl shadow-[3px_3px_0_black]': variant !== 'blank',
      'bg-transparent border-transparent': variant === 'blank',
      'outline-3 outline-dashed outline-green-500': isDropZone || false,
      'transform scale-105': selected && variant === 'selectable',
      'opacity-60 cursor-not-allowed': disabled,
      'outline-4 outline outline-black': selected && variant === 'option'
    },
    className
  );

  const cardStyle: React.CSSProperties = {
    backgroundColor: variant !== 'blank' ? (color ? CARD_COLORS[color as keyof typeof CARD_COLORS] || color : '#fff') : 'transparent',
    ...style
  };

  const cardContent = (
    <div
      className={baseClasses}
      onClick={!disabled ? onClick : undefined}
      onDragStart={isDraggable ? onDragStart : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      onDragOver={isDropZone ? onDragOver : undefined}
      onDrop={isDropZone ? onDrop : undefined}
      draggable={isDraggable}
      style={cardStyle}
    >
      {children}
      {badge && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
          {badge}
        </div>
      )}
    </div>
  );

  if (variant === 'option' || variant === 'selectable') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {cardContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  return cardContent;
}