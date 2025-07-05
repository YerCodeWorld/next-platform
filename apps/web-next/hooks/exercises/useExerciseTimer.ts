'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExerciseTimerOptions {
  autoStart?: boolean;
  onComplete?: (elapsedTime: number) => void;
}

export function useExerciseTimer(options: UseExerciseTimerOptions = {}) {
  const { autoStart = true, onComplete } = options;
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    onComplete?.(elapsed);
  }, [elapsed, onComplete]);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(autoStart);
  }, [autoStart]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    elapsed,
    isRunning,
    start,
    pause,
    stop,
    reset,
    formatTime
  };
}