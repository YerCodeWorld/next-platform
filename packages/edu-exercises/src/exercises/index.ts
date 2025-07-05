// packages/edu-exercises/src/exercises/index.ts

/**
 * Exercise Types Registry
 * Central location for registering all exercise types
 */

import { exerciseRegistry } from '../registry/ExerciseRegistry';
import { multipleChoiceExercise } from './multipleChoice';
import { fillBlankExercise } from './fillBlank';
import { matchingExercise } from './matching';
import { orderingExercise } from './ordering';
import { categorizeExercise } from './categorize';
import { selectorExercise } from './selector';
import { logger } from '../utils/logger';

/**
 * Register all default exercise types
 */
export function registerDefaultExerciseTypes(): void {
    logger.info('Registering default exercise types');
    
    try {
        // Register all exercise types
        exerciseRegistry.register(multipleChoiceExercise);
        exerciseRegistry.register(fillBlankExercise);
        exerciseRegistry.register(matchingExercise);
        exerciseRegistry.register(orderingExercise);
        exerciseRegistry.register(categorizeExercise);
        exerciseRegistry.register(selectorExercise);
        
        logger.info('All default exercise types registered successfully', {
            registeredTypes: exerciseRegistry.getExerciseTypes()
        });
    } catch (error) {
        logger.error('Failed to register default exercise types', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}

/**
 * Initialize the exercise registry with default types
 */
export function initializeExerciseRegistry(): void {
    // Check if registry has any types registered (indicates initialization)
    if (exerciseRegistry.getExerciseTypes().length === 0) {
        registerDefaultExerciseTypes();
        exerciseRegistry.initialize();
    }
}

// Export exercise configurations for direct use
export { multipleChoiceExercise } from './multipleChoice';
export { fillBlankExercise } from './fillBlank';
export { matchingExercise } from './matching';
export { orderingExercise } from './ordering';
export { categorizeExercise } from './categorize';
export { selectorExercise } from './selector';

// Export registry for convenience
export { exerciseRegistry } from '../registry/ExerciseRegistry';

// Auto-initialize on import (can be disabled if needed)
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
    // Only auto-initialize in browser or Node.js environments
    initializeExerciseRegistry();
}