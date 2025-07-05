'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { MatchingDisplay } from './MatchingDisplay';
import { MatchingThreesomeDisplay } from './MatchingThreesomeDisplay';

interface MatchingVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function MatchingVariationRouter(props: MatchingVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'threesome':
    case 'three':
      return <MatchingThreesomeDisplay {...props} />;
    case 'original':
    default:
      return <MatchingDisplay {...props} />;
  }
}