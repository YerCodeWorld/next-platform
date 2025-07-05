'use client';
import React from 'react';
import { Exercise, ExercisePackage, User, CategorizeContent } from '@repo/api-bridge';
import { CategorizeOriginalDisplay } from './CategorizeOriginalDisplay';
import { CategorizeOrderingDisplay } from './CategorizeOrderingDisplay';
import { CategorizeLakeDisplay } from './CategorizeLakeDisplay';

interface CategorizeDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function CategorizeDisplay({
  exercise,
  package: pkg,
  locale,
  userData,
  onComplete
}: CategorizeDisplayProps) {
  const content = exercise.content as CategorizeContent;
  
  // Route to appropriate variation display
  switch (content.variation) {
    case 'ordering.txt':
      return (
        <CategorizeOrderingDisplay
          exercise={exercise}
          package={pkg}
          locale={locale}
          userData={userData}
          onComplete={onComplete}
        />
      );
    
    case 'lake':
      return (
        <CategorizeLakeDisplay
          exercise={exercise}
          package={pkg}
          locale={locale}
          userData={userData}
          onComplete={onComplete}
        />
      );
    
    case 'original':
    default:
      return (
        <CategorizeOriginalDisplay
          exercise={exercise}
          package={pkg}
          locale={locale}
          userData={userData}
          onComplete={onComplete}
        />
      );
  }
}