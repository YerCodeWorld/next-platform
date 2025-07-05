'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { MultipleChoiceDisplay } from './MultipleChoiceDisplay';
import { MultipleChoiceCardsDisplay } from './MultipleChoiceCardsDisplay';
import { MultipleChoiceMatchesDisplay } from './MultipleChoiceMatchesDisplay';
import { MultipleChoiceTrueFalseDisplay } from './MultipleChoiceTrueFalseDisplay';

interface MultipleChoiceVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function MultipleChoiceVariationRouter(props: MultipleChoiceVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'cards':
      return <MultipleChoiceCardsDisplay {...props} />;
    case 'matches':
      return <MultipleChoiceMatchesDisplay {...props} />;
    case 'truefalse':
    case 'true_false':
    case 'true-false': // Add support for hyphenated variation name
      return <MultipleChoiceTrueFalseDisplay {...props} />;
    case 'original':
    default:
      return <MultipleChoiceDisplay {...props} />;
  }
}