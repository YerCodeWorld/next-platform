'use client';
import React from 'react';
import { Exercise, ExercisePackage, User, SelectorContent } from '@repo/api-bridge';
import { SelectorOnTextDisplay } from './SelectorOnTextDisplay';
import { SelectorImageDisplay } from './SelectorImageDisplay';

interface SelectorDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function SelectorDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: SelectorDisplayProps) {
  const content = exercise.content as SelectorContent;
  
  // Route to appropriate variation display
  switch (content.variation) {
    case 'image':
      return (
        <SelectorImageDisplay
          exercise={exercise}
          package={pkg}
          locale={locale}
          userData={userData}
          onComplete={onComplete}
        />
      );
    
    case 'on-text':
    default:
      return (
        <SelectorOnTextDisplay
          exercise={exercise}
          package={pkg}
          locale={locale}
          userData={userData}
          onComplete={onComplete}
        />
      );
  }
}