'use client';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Card, CARD_COLORS } from './Card';

interface TimelineItem {
  id: string;
  content: string;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  onReorder: (newOrder: TimelineItem[]) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  disabled?: boolean;
}

export function Timeline({
  items,
  onReorder,
  orientation = 'horizontal',
  className,
  disabled = false
}: TimelineProps) {
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: TimelineItem, index: number) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!disabled && draggedItem) {
      setDraggedOverIndex(index);
    }
  }, [disabled, draggedItem]);

  const handleDragLeave = useCallback(() => {
    setDraggedOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (disabled) return;

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      onReorder(newItems);
    }
    
    setDraggedItem(null);
    setDraggedOverIndex(null);
  }, [items, onReorder, disabled]);

  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div 
        className={cn(
          'absolute bg-black z-0',
          isHorizontal ? 'h-1 w-[90%] top-1/2 left-[5%] -translate-y-1/2' : 'w-1 h-[90%] left-1/2 top-[5%] -translate-x-1/2'
        )}
      />
      
      {/* Timeline cards */}
      <div 
        className={cn(
          'relative z-10',
          isHorizontal ? 'flex justify-center gap-6 flex-wrap' : 'flex flex-col items-center gap-6'
        )}
      >
        {items.map((item, index) => {
          const colorKeys = Object.keys(CARD_COLORS);
          const defaultColor = colorKeys[index % colorKeys.length];
          
          return (
            <motion.div
              key={item.id}
              className={cn(
                'relative',
                draggedOverIndex === index && 'opacity-50'
              )}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              animate={{
                scale: draggedOverIndex === index ? 1.1 : 1
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Card
                variant="draggable"
                color={item.color || defaultColor}
                onDragStart={(e) => handleDragStart(e, item, index)}
                disabled={disabled}
                size="medium"
                className="min-w-[150px] text-center"
              >
                {item.content}
              </Card>
              
              {/* Timeline dot */}
              <div 
                className={cn(
                  'absolute w-3 h-3 bg-black rounded-full',
                  isHorizontal ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-6' : 'right-0 top-1/2 -translate-y-1/2 translate-x-6'
                )}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Simplified timeline for mobile/responsive layouts
export function ResponsiveTimeline({ items, onReorder, className, disabled = false }: TimelineProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent, fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      onReorder(newItems);
    }
    setDraggedIndex(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const colorKeys = Object.keys(CARD_COLORS);
        const defaultColor = colorKeys[index % colorKeys.length];
        
        return (
          <motion.div
            key={item.id}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDragEnd(e, draggedIndex!, index)}
            className={cn(
              'flex items-center gap-3',
              draggedIndex === index && 'opacity-50'
            )}
            animate={{
              x: draggedIndex === index ? 10 : 0
            }}
          >
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <Card
              variant="draggable"
              color={item.color || defaultColor}
              disabled={disabled}
              size="medium"
              className="flex-1"
            >
              {item.content}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}