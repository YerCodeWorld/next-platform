// packages/edu-exercises/src/utils/exerciseHelpers.ts

/**
 * Common utility functions for exercise parsing and validation
 * Reduces code duplication across exercise type implementations
 */

/**
 * Parse key-value pairs from text lines
 */
export function parseKeyValue(line: string, separator: string = ':'): { key: string; value: string } | null {
    const index = line.indexOf(separator);
    if (index === -1) return null;
    
    return {
        key: line.substring(0, index).trim(),
        value: line.substring(index + 1).trim()
    };
}

/**
 * Parse comma-separated values with trimming
 */
export function parseCommaSeparated(text: string): string[] {
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Parse pipe-separated values with trimming
 */
export function parsePipeSeparated(text: string): string[] {
    return text.split('|').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Extract content within brackets [content]
 */
export function extractBracketContent(text: string): string | null {
    const match = text.match(/\[([^\]]+)\]/);
    return match ? match[1].trim() : null;
}

/**
 * Extract content within asterisks *content*
 */
export function extractAsteriskContent(text: string): string[] {
    const matches = text.match(/\*([^*]+)\*/g);
    return matches ? matches.map(match => match.slice(1, -1).trim()) : [];
}

/**
 * Remove decorators like @hint(...) from text
 */
export function removeDecorators(text: string): string {
    return text.replace(/@\w+\([^)]*\)/g, '').trim();
}

/**
 * Extract decorator content like @hint(content)
 */
export function extractDecorator(text: string, decoratorName: string): string | null {
    const pattern = new RegExp(`@${decoratorName}\\(([^)]*)\\)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
}

/**
 * Check if a line is a comment (starts with // or #)
 */
export function isCommentLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('#');
}

/**
 * Filter out comment lines from text
 */
export function filterComments(lines: string[]): string[] {
    return lines.filter(line => !isCommentLine(line));
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Validate minimum array length
 */
export function validateMinLength(items: any[], min: number, itemName: string): string | null {
    if (!Array.isArray(items) || items.length < min) {
        return `At least ${min} ${itemName} required`;
    }
    return null;
}

/**
 * Validate maximum array length
 */
export function validateMaxLength(items: any[], max: number, itemName: string): string | null {
    if (Array.isArray(items) && items.length > max) {
        return `Maximum of ${max} ${itemName} allowed`;
    }
    return null;
}

/**
 * Validate string length
 */
export function validateStringLength(
    text: string, 
    min: number, 
    max: number, 
    fieldName: string
): string | null {
    if (typeof text !== 'string') {
        return `${fieldName} must be a string`;
    }
    
    if (text.length < min) {
        return `${fieldName} must be at least ${min} characters`;
    }
    
    if (text.length > max) {
        return `${fieldName} must be less than ${max} characters`;
    }
    
    return null;
}

/**
 * Validate that indices are within array bounds
 */
export function validateIndices(
    indices: number[], 
    arrayLength: number, 
    fieldName: string
): string[] {
    const errors: string[] = [];
    
    indices.forEach((index, i) => {
        if (typeof index !== 'number') {
            errors.push(`${fieldName}[${i}] must be a number`);
        } else if (index < 0 || index >= arrayLength) {
            errors.push(`${fieldName}[${i}] (${index}) is out of bounds (0-${arrayLength - 1})`);
        }
    });
    
    return errors;
}

/**
 * Create a range of numbers
 */
export function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Find duplicates in an array
 */
export function findDuplicates<T>(array: T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();
    
    array.forEach(item => {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    });
    
    return Array.from(duplicates);
}

/**
 * Calculate position offsets for text replacements
 */
export function calculatePositions(
    text: string, 
    pattern: RegExp, 
    replacement: string
): Array<{ start: number; end: number; originalLength: number; newLength: number }> {
    const positions: Array<{ start: number; end: number; originalLength: number; newLength: number }> = [];
    let match;
    let offset = 0;
    
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
        positions.push({
            start: match.index + offset,
            end: match.index + match[0].length + offset,
            originalLength: match[0].length,
            newLength: replacement.length
        });
        
        // Update offset for subsequent matches
        offset += (replacement.length - match[0].length);
        
        // Prevent infinite loop for global regex
        if (!pattern.global) break;
    }
    
    return positions;
}

/**
 * Replace text while tracking position changes
 */
export function replaceWithPositions(
    text: string,
    pattern: RegExp,
    replacement: string
): { text: string; positions: Array<{ position: number; originalLength: number; newLength: number }> } {
    const positions: Array<{ position: number; originalLength: number; newLength: number }> = [];
    let result = text;
    let offset = 0;
    let match;
    
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
        const position = match.index + offset;
        const originalLength = match[0].length;
        const newLength = replacement.length;
        
        positions.push({
            position,
            originalLength,
            newLength
        });
        
        // Replace the match
        result = result.slice(0, position) + replacement + result.slice(position + originalLength);
        
        // Update offset
        offset += (newLength - originalLength);
        
        // Prevent infinite loop for global regex
        if (!pattern.global) break;
    }
    
    return { text: result, positions };
}

/**
 * Common error message generators
 */
export const ErrorMessages = {
    parseError: (exerciseType: string, error: Error) => 
        `Failed to parse ${exerciseType} exercise: ${error.message}`,
    
    validationError: (exerciseType: string, errors: string[]) => 
        `${exerciseType} exercise validation failed: ${errors.join(', ')}`,
    
    displayError: (exerciseType: string, error: Error) => 
        `Failed to display ${exerciseType} exercise: ${error.message}`,
    
    missingContent: (fieldName: string) => 
        `${fieldName} is required`,
    
    invalidFormat: (fieldName: string, expectedFormat: string) => 
        `${fieldName} has invalid format. Expected: ${expectedFormat}`,
    
    outOfRange: (fieldName: string, min: number, max: number) => 
        `${fieldName} must be between ${min} and ${max}`,
    
    tooFew: (itemName: string, min: number) => 
        `At least ${min} ${itemName} required`,
    
    tooMany: (itemName: string, max: number) => 
        `Maximum of ${max} ${itemName} allowed`
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
    // Multiple choice detection
    multipleChoice: /\|\s*\[.*\]/,
    
    // Fill blank detection
    fillBlank: /\*[^*]+\*/,
    
    // Matching detection  
    matching: /^[^=]+=[^=]+$/,
    
    // Ordering detection
    ordering: /\|/,
    
    // Metadata patterns
    metadata: /^\s*(\w+)\s*:\s*(.+)$/,
    
    // Comment patterns
    comment: /^\s*(#|\/\/)/,
    
    // Decorator patterns
    decorator: /@(\w+)\(([^)]*)\)/
};

/**
 * Text processing utilities
 */
export const TextUtils = {
    /**
     * Normalize whitespace
     */
    normalizeWhitespace: (text: string): string => {
        return text.replace(/\s+/g, ' ').trim();
    },
    
    /**
     * Remove empty lines
     */
    removeEmptyLines: (lines: string[]): string[] => {
        return lines.filter(line => line.trim().length > 0);
    },
    
    /**
     * Capitalize first letter
     */
    capitalize: (text: string): string => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    
    /**
     * Count words in text
     */
    wordCount: (text: string): number => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },
    
    /**
     * Truncate text with ellipsis
     */
    truncate: (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + '...';
    }
};