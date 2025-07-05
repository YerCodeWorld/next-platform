'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { FillBlanksDisplay } from './FillBlanksDisplay';
import { FillBlankSingleDisplay } from './FillBlankSingleDisplay';
import { FillBlankMatchesDisplay } from './FillBlankMatchesDisplay';

interface FillBlanksVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function FillBlanksVariationRouter(props: FillBlanksVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'single':
      return <FillBlankSingleDisplay {...props} />;
    case 'matches':
      return <FillBlankMatchesDisplay {...props} />;
    case 'original':
    default:
      return <FillBlanksDisplay {...props} />;
  }
}