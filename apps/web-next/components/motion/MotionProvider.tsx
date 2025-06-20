'use client';
import React, { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { useSounds } from '../../utils/sounds';

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const { initializeSounds } = useSounds();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize sounds and motion on first user interaction
    const handleFirstInteraction = () => {
      if (!isInitialized) {
        initializeSounds();
        setIsInitialized(true);
        
        // Remove listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    // Add interaction listeners
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initializeSounds, isInitialized]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.3,
        }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}