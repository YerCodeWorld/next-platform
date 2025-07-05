// packages/edu-exercises/src/registry/ExerciseRegistry.ts

import * as React from 'react';
import { 
    ExerciseType, 
    ExerciseContent,
    CreateExercisePayload
} from '@repo/api-bridge';
import { ValidationResult } from '../parser/validator';
import { logger } from '../utils/logger';

/**
 * Configuration interface for exercise variations
 */
export interface ExerciseVariationConfig<T extends ExerciseContent> {
    name: string;
    displayName: string;
    description?: string;
    icon?: string;
    
    // Variation-specific parsing (optional - uses main parseContent if not provided)
    parseContent?: (lines: string[], baseContent: T) => T;
    validateContent?: (content: T) => ValidationResult;
    
    // Variation-specific display component
    DisplayComponent?: React.ComponentType<ExerciseDisplayProps<T>>;
    BuilderComponent?: React.ComponentType<ExerciseBuilderProps<T>>;
    
    // Variation-specific LanScript conversion (optional)
    toLanScript?: (content: T) => string;
    
    // Example content for this variation
    exampleContent?: string;
}

/**
 * Configuration interface for exercise types
 * Everything needed to define a new exercise type in one place
 */
export interface ExerciseTypeConfig<T extends ExerciseContent> {
    // Basic info
    type: ExerciseType;
    displayName: string;
    description?: string;
    icon?: string;
    
    // Detection & Parsing
    detectPattern: RegExp | ((lines: string[]) => boolean);
    parseContent: (lines: string[]) => T;
    validateContent: (content: T) => ValidationResult;
    
    // Variations support
    variations?: Record<string, ExerciseVariationConfig<T>>;
    defaultVariation?: string;
    
    // Detection of variations (optional - for exercises with multiple variations)
    detectVariation?: (lines: string[], content: T) => string | null;
    
    // Display (optional - can be provided by app)
    DisplayComponent?: React.ComponentType<ExerciseDisplayProps<T>>;
    
    // Builder (optional - can be provided by app)
    BuilderComponent?: React.ComponentType<ExerciseBuilderProps<T>>;
    
    // LanScript conversion
    toLanScript: (content: T) => string;
    
    // Error handling
    errorMessages: {
        parseError: (error: Error) => string;
        validationError: (errors: string[]) => string;
        displayError: (error: Error) => string;
    };
    
    // Recovery (optional)
    recoverFromError?: (error: Error, content: T) => Partial<T>;
    
    // Metadata
    exampleContent?: string;
    documentationUrl?: string;
    version?: string;
}

/**
 * Props interface for exercise display components
 */
export interface ExerciseDisplayProps<T extends ExerciseContent> {
    content: T;
    exercise: {
        id: string;
        title: string;
        instructions?: string;
        hints: string[];
        explanation?: string;
    };
    onComplete?: (correct: boolean, score?: number) => void;
    onProgress?: (progress: number) => void;
    locale?: string;
    userData?: any;
}

/**
 * Props interface for exercise builder components
 */
export interface ExerciseBuilderProps<T extends ExerciseContent> {
    content?: T;
    onChange: (content: T) => void;
    onValidate?: (validation: ValidationResult) => void;
    locale?: string;
}

/**
 * Central registry for all exercise types
 * Manages registration, lookup, and operations for exercise types
 */
export class ExerciseRegistry {
    private exercises = new Map<ExerciseType, ExerciseTypeConfig<any>>();
    private initialized = false;
    
    /**
     * Register a new exercise type
     */
    register<T extends ExerciseContent>(config: ExerciseTypeConfig<T>): void {
        if (this.exercises.has(config.type)) {
            logger.warn('Exercise type already registered, overwriting', { 
                type: config.type, 
                displayName: config.displayName 
            });
        }
        
        // Validate the config
        this.validateConfig(config);
        
        this.exercises.set(config.type, config);
        
        logger.info('Exercise type registered', { 
            type: config.type, 
            displayName: config.displayName,
            version: config.version || '1.0.0'
        });
    }
    
    /**
     * Get exercise type configuration
     */
    getExercise<T extends ExerciseContent>(type: ExerciseType): ExerciseTypeConfig<T> | undefined {
        return this.exercises.get(type) as ExerciseTypeConfig<T> | undefined;
    }
    
    /**
     * Get all registered exercise types
     */
    getAllExercises(): Map<ExerciseType, ExerciseTypeConfig<any>> {
        return new Map(this.exercises);
    }
    
    /**
     * Get list of registered exercise types
     */
    getExerciseTypes(): ExerciseType[] {
        return Array.from(this.exercises.keys());
    }
    
    /**
     * Check if an exercise type is registered
     */
    hasExercise(type: ExerciseType): boolean {
        return this.exercises.has(type);
    }
    
    /**
     * Detect exercise type from content lines
     */
    detectType(lines: string[]): ExerciseType | null {
        logger.debug('Detecting exercise type', { lineCount: lines.length });
        
        for (const [type, config] of this.exercises) {
            try {
                const matches = typeof config.detectPattern === 'function' 
                    ? config.detectPattern(lines)
                    : lines.some(line => (config.detectPattern as RegExp).test(line));
                    
                if (matches) {
                    logger.debug('Exercise type detected', { type, displayName: config.displayName });
                    return type;
                }
            } catch (error) {
                logger.warn('Error in exercise type detection', { 
                    type, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
            }
        }
        
        logger.warn('No exercise type detected for content', { lineCount: lines.length });
        return null;
    }
    
    /**
     * Parse content using the appropriate exercise type parser
     */
    parseContent<T extends ExerciseContent>(type: ExerciseType, lines: string[], options?: { variation?: string }): T {
        const config = this.getExercise<T>(type);
        if (!config) {
            throw new Error(`Unknown exercise type: ${type}`);
        }
        
        try {
            logger.debug('Parsing content', { type, lineCount: lines.length, variation: options?.variation });
            const content = config.parseContent(lines);
            
            // Handle variations - use provided variation or detect it
            let detectedVariation: string | null = null;
            
            // Use provided variation if available
            if (options?.variation) {
                detectedVariation = options.variation;
            }
            // Otherwise, detect variation if the exercise type supports it
            else if (config.variations && config.detectVariation) {
                detectedVariation = config.detectVariation(lines, content);
            }
            
            // Apply variation-specific parsing if available
            if (detectedVariation && config.variations && config.variations[detectedVariation]) {
                const variationConfig = config.variations[detectedVariation];
                
                // Use variation-specific parser if available
                if (variationConfig.parseContent) {
                    logger.debug('Using variation-specific parser', { type, variation: detectedVariation });
                    return variationConfig.parseContent(lines, content);
                }
            }
            
            logger.debug('Content parsed successfully', { type, variation: detectedVariation });
            return content;
        } catch (error) {
            const errorMessage = config.errorMessages.parseError(error instanceof Error ? error : new Error('Parse failed'));
            logger.error('Parse error', { type, error: errorMessage });
            throw new Error(errorMessage);
        }
    }

    /**
     * Parse content and detect variation
     */
    parseContentWithVariation<T extends ExerciseContent>(type: ExerciseType, lines: string[], options?: { variation?: string }): { content: T; variation: string } {
        const config = this.getExercise<T>(type);
        if (!config) {
            throw new Error(`Unknown exercise type: ${type}`);
        }
        
        try {
            logger.debug('Parsing content with variation detection', { type, lineCount: lines.length, variation: options?.variation });
            const content = config.parseContent(lines);
            
            // Handle variations - use provided variation or detect it
            let detectedVariation: string = config.defaultVariation || 'original';
            
            // Use provided variation if available
            if (options?.variation) {
                detectedVariation = options.variation;
            }
            // Otherwise, detect variation if the exercise type supports it
            else if (config.variations && config.detectVariation) {
                const detected = config.detectVariation(lines, content);
                if (detected) {
                    detectedVariation = detected;
                }
            }
            
            // Apply variation-specific parsing if available
            let finalContent = content;
            if (detectedVariation && config.variations && config.variations[detectedVariation]) {
                const variationConfig = config.variations[detectedVariation];
                
                // Use variation-specific parser if available
                if (variationConfig.parseContent) {
                    logger.debug('Using variation-specific parser', { type, variation: detectedVariation });
                    finalContent = variationConfig.parseContent(lines, content);
                }
            }
            
            // Add variation metadata to content for validation
            if (detectedVariation && detectedVariation !== 'original') {
                (finalContent as any).variation = detectedVariation;
            }
            
            logger.debug('Content parsed successfully with variation', { type, variation: detectedVariation });
            return { content: finalContent, variation: detectedVariation };
        } catch (error) {
            const errorMessage = config.errorMessages.parseError(error instanceof Error ? error : new Error('Parse failed'));
            logger.error('Parse error', { type, error: errorMessage });
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Validate content using the appropriate exercise type validator
     */
    validateContent<T extends ExerciseContent>(type: ExerciseType, content: T): ValidationResult {
        const config = this.getExercise<T>(type);
        if (!config) {
            return {
                isValid: false,
                errors: [`Unknown exercise type: ${type}`],
                warnings: []
            };
        }
        
        try {
            let result = config.validateContent(content);
            
            // Use variation-specific validation if available
            if (config.variations && (content as any).variation) {
                const variationName = (content as any).variation;
                const variationConfig = config.variations[variationName];
                
                if (variationConfig && variationConfig.validateContent) {
                    logger.debug('Using variation-specific validator', { type, variation: variationName });
                    result = variationConfig.validateContent(content);
                }
            }
            
            logger.debug('Content validation result', { 
                type, 
                isValid: result.isValid, 
                errorCount: result.errors.length 
            });
            return result;
        } catch (error) {
            const errorMessage = `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            logger.error('Validation error', { type, error: errorMessage });
            return {
                isValid: false,
                errors: [errorMessage],
                warnings: []
            };
        }
    }
    
    /**
     * Convert content to LanScript format
     */
    toLanScript<T extends ExerciseContent>(type: ExerciseType, content: T): string {
        const config = this.getExercise<T>(type);
        if (!config) {
            throw new Error(`Unknown exercise type: ${type}`);
        }
        
        try {
            // Use variation-specific toLanScript if available
            if (config.variations && (content as any).variation) {
                const variationName = (content as any).variation;
                const variationConfig = config.variations[variationName];
                
                if (variationConfig && variationConfig.toLanScript) {
                    logger.debug('Using variation-specific toLanScript', { type, variation: variationName });
                    return variationConfig.toLanScript(content);
                }
            }
            
            return config.toLanScript(content);
        } catch (error) {
            const errorMessage = `LanScript conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            logger.error('LanScript conversion error', { type, error: errorMessage });
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Get display component for an exercise type (with variation support)
     */
    getDisplayComponent<T extends ExerciseContent>(type: ExerciseType, variation?: string): React.ComponentType<ExerciseDisplayProps<T>> | undefined {
        const config = this.getExercise<T>(type);
        if (!config) return undefined;
        
        // Try to get variation-specific component first
        if (variation && config.variations && config.variations[variation]) {
            const variationComponent = config.variations[variation].DisplayComponent;
            if (variationComponent) {
                logger.debug('Using variation-specific display component', { type, variation });
                return variationComponent;
            }
        }
        
        return config.DisplayComponent;
    }
    
    /**
     * Get builder component for an exercise type (with variation support)
     */
    getBuilderComponent<T extends ExerciseContent>(type: ExerciseType, variation?: string): React.ComponentType<ExerciseBuilderProps<T>> | undefined {
        const config = this.getExercise<T>(type);
        if (!config) return undefined;
        
        // Try to get variation-specific component first
        if (variation && config.variations && config.variations[variation]) {
            const variationComponent = config.variations[variation].BuilderComponent;
            if (variationComponent) {
                logger.debug('Using variation-specific builder component', { type, variation });
                return variationComponent;
            }
        }
        
        return config.BuilderComponent;
    }
    
    /**
     * Get exercise metadata for listing/selection
     */
    getExerciseMetadata(): Array<{
        type: ExerciseType;
        displayName: string;
        description?: string;
        icon?: string;
        exampleContent?: string;
    }> {
        return Array.from(this.exercises.values()).map(config => ({
            type: config.type,
            displayName: config.displayName,
            description: config.description,
            icon: config.icon,
            exampleContent: config.exampleContent
        }));
    }
    
    /**
     * Get available variations for an exercise type
     */
    getVariations<T extends ExerciseContent>(type: ExerciseType): Record<string, ExerciseVariationConfig<T>> | undefined {
        const config = this.getExercise<T>(type);
        return config?.variations;
    }
    
    /**
     * Get variation metadata for an exercise type
     */
    getVariationMetadata(type: ExerciseType): Array<{
        name: string;
        displayName: string;
        description?: string;
        icon?: string;
        exampleContent?: string;
    }> {
        const config = this.getExercise(type);
        if (!config?.variations) {
            return [];
        }
        
        return Object.entries(config.variations).map(([name, variationConfig]) => ({
            name,
            displayName: variationConfig.displayName,
            description: variationConfig.description,
            icon: variationConfig.icon,
            exampleContent: variationConfig.exampleContent
        }));
    }
    
    /**
     * Detect variation for an exercise type
     */
    detectVariation<T extends ExerciseContent>(type: ExerciseType, lines: string[], content: T): string | null {
        const config = this.getExercise<T>(type);
        if (!config?.detectVariation) {
            return config?.defaultVariation || null;
        }
        
        try {
            const detected = config.detectVariation(lines, content);
            logger.debug('Variation detected', { type, variation: detected });
            return detected;
        } catch (error) {
            logger.warn('Error detecting variation', { 
                type, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
            return config.defaultVariation || null;
        }
    }
    
    /**
     * Check if an exercise type supports variations
     */
    hasVariations(type: ExerciseType): boolean {
        const config = this.getExercise(type);
        return !!(config?.variations && Object.keys(config.variations).length > 0);
    }
    
    /**
     * Get default variation for an exercise type
     */
    getDefaultVariation(type: ExerciseType): string | null {
        const config = this.getExercise(type);
        return config?.defaultVariation || null;
    }
    
    /**
     * Parse a complete LanScript document
     */
    parseScript(script: string, authorEmail: string): { exercises: CreateExercisePayload[]; errors: string[] } {
        const exercises: CreateExercisePayload[] = [];
        const errors: string[] = [];
        
        try {
            // This would integrate with the existing LanScript parser
            // For now, we'll return a placeholder
            logger.info('Parsing LanScript document', { scriptLength: script.length });
            
            // TODO: Implement full LanScript parsing using registry
            return { exercises, errors };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Script parsing failed';
            errors.push(errorMessage);
            logger.error('Script parsing error', { error: errorMessage });
            return { exercises, errors };
        }
    }
    
    /**
     * Initialize the registry with default exercise types
     */
    initialize(): void {
        if (this.initialized) {
            logger.warn('Registry already initialized');
            return;
        }
        
        logger.info('Initializing exercise registry');
        
        // Default exercise types will be registered here
        // This will be implemented when we convert existing types
        
        this.initialized = true;
        logger.info('Exercise registry initialized', { 
            exerciseCount: this.exercises.size 
        });
    }
    
    /**
     * Reset the registry (useful for testing)
     */
    reset(): void {
        logger.info('Resetting exercise registry');
        this.exercises.clear();
        this.initialized = false;
    }
    
    /**
     * Validate exercise type configuration
     */
    private validateConfig<T extends ExerciseContent>(config: ExerciseTypeConfig<T>): void {
        if (!config.type) {
            throw new Error('Exercise type is required');
        }
        
        if (!config.displayName) {
            throw new Error('Display name is required');
        }
        
        if (!config.detectPattern) {
            throw new Error('Detection pattern is required');
        }
        
        if (!config.parseContent) {
            throw new Error('Parse content function is required');
        }
        
        if (!config.validateContent) {
            throw new Error('Validate content function is required');
        }
        
        // Components are optional - can be provided by app level
        // if (!config.DisplayComponent) {
        //     throw new Error('Display component is required');
        // }
        
        // if (!config.BuilderComponent) {
        //     throw new Error('Builder component is required');
        // }
        
        if (!config.toLanScript) {
            throw new Error('toLanScript function is required');
        }
        
        if (!config.errorMessages) {
            throw new Error('Error messages are required');
        }
        
        logger.debug('Exercise type config validated', { type: config.type });
    }
}

// Create singleton registry instance
export const exerciseRegistry = new ExerciseRegistry();

// Helper functions for common operations
export const registerExerciseType = <T extends ExerciseContent>(config: ExerciseTypeConfig<T>) => {
    exerciseRegistry.register(config);
};

export const getExerciseConfig = <T extends ExerciseContent>(type: ExerciseType) => {
    return exerciseRegistry.getExercise<T>(type);
};

export const detectExerciseType = (lines: string[]): ExerciseType | null => {
    return exerciseRegistry.detectType(lines);
};

export const parseExerciseContent = <T extends ExerciseContent>(type: ExerciseType, lines: string[]): T => {
    return exerciseRegistry.parseContent<T>(type, lines);
};

export const validateExerciseContent = <T extends ExerciseContent>(type: ExerciseType, content: T): ValidationResult => {
    return exerciseRegistry.validateContent<T>(type, content);
};