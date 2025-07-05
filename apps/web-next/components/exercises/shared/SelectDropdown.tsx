'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = '...',
  disabled = false,
  className,
  size = 'medium'
}: SelectDropdownProps) {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg'
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'appearance-none w-full',
          'font-bold font-comic',
          'bg-[#e0f0ff] text-black',
          'border-2 border-black rounded-xl',
          'shadow-[2px_2px_0_black]',
          'transition-all duration-200',
          'cursor-pointer',
          sizeClasses[size],
          'pr-10', // Space for chevron
          {
            'hover:shadow-[3px_3px_0_black] hover:transform hover:-translate-y-0.5': !disabled,
            'opacity-60 cursor-not-allowed': disabled
          }
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom chevron icon */}
      <ChevronDown 
        className={cn(
          'absolute right-3 top-1/2 transform -translate-y-1/2',
          'w-5 h-5 pointer-events-none',
          disabled ? 'text-gray-400' : 'text-black'
        )}
      />
    </div>
  );
}