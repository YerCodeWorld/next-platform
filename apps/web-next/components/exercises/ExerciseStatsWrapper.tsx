import React from 'react';
import { Statistics } from '@repo/components';
import { ExercisePackage } from '@repo/api-bridge';

interface ExerciseStatsWrapperProps {
  packages: ExercisePackage[];
}

export default function ExerciseStatsWrapper({ packages }: ExerciseStatsWrapperProps) {
  // Calculate meaningful statistics from real data
  const totalPackages = packages.length;
  const totalExercises = packages.reduce((total, pkg) => total + (pkg.exerciseCount || 0), 0);
  const totalCategories = new Set(packages.map(pkg => pkg.category)).size;
  
  // Mock completion data for now (will be real once user progress is tracked)
  const estimatedCompletions = Math.floor(totalExercises * 0.3); // 30% completion rate estimate
  
  const stats = [
    {
      end: totalPackages,
      value: totalPackages,
      symbol: '📚',
      label: 'Exercise Packages',
      colorClass: 'text-blue-600'
    },
    {
      end: totalExercises,
      value: totalExercises,
      symbol: '🎯',
      label: 'Total Exercises',
      colorClass: 'text-green-600'
    },
    {
      end: estimatedCompletions,
      value: estimatedCompletions,
      symbol: '✅',
      label: 'Exercise Completions',
      colorClass: 'text-purple-600'
    },
    {
      end: totalCategories,
      value: totalCategories,
      symbol: '📂',
      label: 'Active Categories',
      colorClass: 'text-orange-600'
    }
  ];

  return <Statistics stats={stats} />;
}