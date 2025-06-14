// components/exercises/LazyExercisePlayers.tsx
'use client';

import dynamic from 'next/dynamic';
import { ExercisePlayerSkeleton } from './LoadingSkeletons';

// Lazy load exercise players for better performance
export const LazyFillBlankPlayer = dynamic(
  () => import('./players/FillBlankPlayer').then(mod => ({ default: mod.FillBlankPlayer })),
  {
    loading: () => <ExercisePlayerSkeleton />,
    ssr: false
  }
);

export const LazyMultipleChoicePlayer = dynamic(
  () => import('./players/MultipleChoicePlayer').then(mod => ({ default: mod.MultipleChoicePlayer })),
  {
    loading: () => <ExercisePlayerSkeleton />,
    ssr: false
  }
);

export const LazyMatchingPlayer = dynamic(
  () => import('./players/MatchingPlayer').then(mod => ({ default: mod.MatchingPlayer })),
  {
    loading: () => <ExercisePlayerSkeleton />,
    ssr: false
  }
);

export const LazyOrderingPlayer = dynamic(
  () => import('./players/OrderingPlayer').then(mod => ({ default: mod.OrderingPlayer })),
  {
    loading: () => <ExercisePlayerSkeleton />,
    ssr: false
  }
);