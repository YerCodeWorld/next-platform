'use client';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface DragDropZoneProps {
  onDrop: (data: string, index?: number) => void;
  acceptType?: string;
  children?: React.ReactNode;
  className?: string;
  index?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function DragDropZone({
  onDrop,
  acceptType = 'text/plain',
  children,
  className,
  index,
  disabled = false,
  placeholder = 'Drop here'
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      const data = e.dataTransfer.getData(acceptType);
      onDrop(data, index);
    }
  }, [acceptType, onDrop, index, disabled]);

  return (
    <motion.div
      className={cn(
        'relative min-h-[45px] min-w-[100px]',
        'border-b-3 border-black',
        'transition-all duration-200',
        {
          'outline-3 outline-dashed outline-green-500': isDragOver,
          'opacity-50': disabled
        },
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{
        scale: isDragOver ? 1.05 : 1
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children || (
        <div className="text-gray-400 text-center">
          {placeholder}
        </div>
      )}
    </motion.div>
  );
}

// Draggable item wrapper
interface DraggableItemProps {
  data: string;
  dataType?: string;
  children: React.ReactNode;
  className?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export function DraggableItem({
  data,
  dataType = 'text/plain',
  children,
  className,
  onDragStart,
  onDragEnd,
  disabled = false
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData(dataType, data);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStart?.();
  }, [data, dataType, onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        {
          'opacity-30 scale-90': isDragging,
          'cursor-not-allowed': disabled
        },
        className
      )}
    >
      {children}
    </div>
  );
}