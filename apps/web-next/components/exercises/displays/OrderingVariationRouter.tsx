'use client';
import React from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { OrderingDisplay } from './OrderingDisplay';
import { OrderingAlignerDisplay } from './OrderingAlignerDisplay';
import { OrderingSingleDisplay } from './OrderingSingleDisplay';

interface OrderingVariationRouterProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
  onComplete?: (correct: boolean) => void;
}

export function OrderingVariationRouter(props: OrderingVariationRouterProps) {
  const { exercise } = props;
  
  // Check for variation field
  const variation = exercise.variation || 'original';
  
  switch (variation) {
    case 'aligner':
    case 'timeline':
      return <OrderingAlignerDisplay {...props} />;
    case 'single':
      return <OrderingSingleDisplay {...props} />;
    case 'original':
    default:
      return <OrderingDisplay {...props} />;
  }
}