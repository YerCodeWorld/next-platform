import { getAllExercisePackages, getUserPackageProgress } from './api-server';
import type { ExercisePackage } from '@repo/db';

export async function getExercisePackagesWithProgress(userEmail?: string) {
  try {
    const packages = await getAllExercisePackages();
    
    if (!userEmail) {
      return {
        packages,
        userProgress: {}
      };
    }

    // Get user progress for all packages
    const userProgress: Record<string, {
      completedExercises: string[];
      totalExercises: number;
      completionRate: number;
    }> = {};

    for (const pkg of packages) {
      try {
        const progress = await getUserPackageProgress(pkg.id, userEmail);
        userProgress[pkg.id] = {
          completedExercises: progress.completedExercises || [],
          totalExercises: pkg.exerciseCount || 0,
          completionRate: progress.completionRate || 0
        };
      } catch (error) {
        // Set default progress if error fetching
        userProgress[pkg.id] = {
          completedExercises: [],
          totalExercises: pkg.exerciseCount || 0,
          completionRate: 0
        };
      }
    }

    return {
      packages,
      userProgress
    };
  } catch (error) {
    console.error('Error fetching exercise packages with progress:', error);
    return {
      packages: [] as ExercisePackage[],
      userProgress: {}
    };
  }
}