'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { SelectorDisplay } from './SelectorDisplay';
import { SelectorImageDisplay } from './SelectorImageDisplay';
import { SelectorOnTextDisplay } from './SelectorOnTextDisplay';

interface SelectorVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function SelectorVariationRouter(props: SelectorVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'image':
    case 'images':
      return <SelectorImageDisplay {...props} />;
    case 'ontext':
    case 'on_text':
      return <SelectorOnTextDisplay {...props} />;
    case 'original':
    default:
      return <SelectorDisplay {...props} />;
  }
}