'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { CategorizeDisplay } from './CategorizeDisplay';
import { CategorizeOriginalDisplay } from './CategorizeOriginalDisplay';
import { CategorizeLakeDisplay } from './CategorizeLakeDisplay';
import { CategorizeOrderingDisplay } from './CategorizeOrderingDisplay';

interface CategorizeVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function CategorizeVariationRouter(props: CategorizeVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'lake':
      return <CategorizeLakeDisplay {...props} />;
    case 'ordering':
      return <CategorizeOrderingDisplay {...props} />;
    case 'original':
      return <CategorizeOriginalDisplay {...props} />;
    default:
      // Default to CategorizeDisplay which might have its own routing logic
      return <CategorizeDisplay {...props} />;
  }
}