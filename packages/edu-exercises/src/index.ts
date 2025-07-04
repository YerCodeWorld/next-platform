// Main exports
export * from './types';
export { validateExercise, exerciseToLanScript, exercisesToLanScript, formatLanScript } from './parser';
export * from './parser/lanscript/parser';
export * from './builder/exerciseBuilder';
export * from './components';

// EduScript exports
export * from './parser/eduscript';
export * from './data/wordLibraries';

// Phase 0 improvements - Type safety, validation, error handling
export * from './parser/validator';
export * from './utils/sanitization';
export * from './utils/logger';
export * from './components/ErrorBoundary';

// Phase 1 improvements - Exercise Registry System
export * from './registry/ExerciseRegistry';
export * from './exercises';
export * from './utils/exerciseHelpers';

// Re-export commonly used items
export { LanScriptParser } from './parser/lanscript/parser';
export { EduScriptParser, detectScriptType } from './parser/eduscript/parser';
export { ExerciseBuilder } from './builder/exerciseBuilder';
export { ExerciseCreator } from './components/create/ExerciseCreator';
export { ExerciseDisplay } from './components/display/ExerciseDisplay';

// Phase 0 convenience exports
export { validateExerciseByType } from './parser/validator';
export { sanitizeExercisePayload } from './utils/sanitization';
export { logger } from './utils/logger';
export { ExerciseErrorBoundary, ExerciseDisplayErrorBoundary, ExerciseBuilderErrorBoundary } from './components/ErrorBoundary';

// Phase 1 convenience exports
export { 
    exerciseRegistry, 
    registerExerciseType, 
    getExerciseConfig,
    detectExerciseType as registryDetectExerciseType,
    parseExerciseContent,
    validateExerciseContent
} from './registry/ExerciseRegistry';
export { initializeExerciseRegistry } from './exercises';
