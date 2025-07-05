'use client';
import React from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

interface LetterSlotProps {
  letter?: string;
  isFilled?: boolean;
  isBlank?: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onDrop?: (letter: string) => void;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export function LetterSlot({
  letter,
  isFilled = false,
  isBlank = false,
  color,
  size = 'medium',
  onDrop,
  onClick,
  className,
  index
}: LetterSlotProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const sizeClasses = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl'
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isBlank && !isFilled) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isBlank && !isFilled && onDrop) {
      const droppedLetter = e.dataTransfer.getData('text/plain');
      onDrop(droppedLetter);
    }
  };

  if (isBlank && !isFilled) {
    return (
      <motion.div
        className={cn(
          sizeClasses[size],
          'border-b-3 border-black',
          'flex items-center justify-center',
          'font-bold font-comic',
          'transition-all duration-200',
          {
            'outline-2 outline-dashed outline-green-500': isDragOver,
            'cursor-pointer hover:bg-gray-50': !!onClick
          },
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onClick}
        animate={{
          scale: isDragOver ? 1.1 : 1
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {letter}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        'flex items-center justify-center',
        'font-bold font-comic',
        'border-3 border-black rounded-lg',
        'shadow-[2px_2px_0_black]',
        {
          'cursor-pointer hover:transform hover:scale-105': !!onClick
        },
        className
      )}
      style={{
        backgroundColor: color || '#ffc0cb'
      }}
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17,
        delay: index ? index * 0.05 : 0
      }}
    >
      {letter}
    </motion.div>
  );
}

// Letter input variant for manual entry
interface LetterInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

export function LetterInput({
  value,
  onChange,
  disabled = false,
  size = 'medium',
  className,
  placeholder = '',
  maxLength = 1
}: LetterInputProps) {
  const sizeClasses = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl'
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      className={cn(
        sizeClasses[size],
        'text-center',
        'font-bold font-comic',
        'border-b-3 border-black',
        'bg-transparent',
        'outline-none focus:border-blue-500',
        'transition-colors duration-200',
        'uppercase',
        {
          'opacity-50 cursor-not-allowed': disabled
        },
        className
      )}
    />
  );
}