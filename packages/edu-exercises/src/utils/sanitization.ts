// packages/edu-exercises/src/utils/sanitization.ts

/**
 * Sanitization utilities for exercise content
 * Prevents XSS attacks and ensures content safety
 */

/**
 * Sanitizes plain text by removing HTML tags and limiting length
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: urls
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes HTML content by allowing only safe tags
 * For future use if we add rich text support
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // For now, just remove all HTML since we don't use DOMPurify yet
  // TODO: Add DOMPurify when rich text support is needed
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: urls
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitizes arrays by filtering out empty/invalid items
 */
export function sanitizeArray<T>(
  input: unknown, 
  itemSanitizer: (item: unknown) => T | null,
  maxItems: number = 100
): T[] {
  if (!Array.isArray(input)) {
    return [];
  }
  
  return input
    .slice(0, maxItems) // Limit array size
    .map(itemSanitizer)
    .filter((item): item is T => item !== null);
}

/**
 * Deep sanitization of exercise content
 */
export function sanitizeExerciseContent<T>(content: T): T {
  if (content === null || content === undefined) {
    return content;
  }
  
  if (typeof content === 'string') {
    return sanitizeText(content) as T;
  }
  
  if (typeof content === 'number' || typeof content === 'boolean') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => sanitizeExerciseContent(item)) as T;
  }
  
  if (typeof content === 'object') {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(content)) {
      // Sanitize the key as well
      const cleanKey = sanitizeText(key, 50);
      if (cleanKey) {
        (sanitized as any)[cleanKey] = sanitizeExerciseContent(value);
      }
    }
    return sanitized;
  }
  
  return content;
}

/**
 * Sanitize exercise payload before processing
 */
export function sanitizeExercisePayload(payload: any): any {
  if (!payload || typeof payload !== 'object') {
    return {};
  }
  
  return {
    title: sanitizeText(payload.title || '', 200),
    instructions: sanitizeText(payload.instructions || '', 500),
    type: sanitizeText(payload.type || '', 50),
    difficulty: sanitizeText(payload.difficulty || '', 50),
    category: sanitizeText(payload.category || '', 50),
    content: sanitizeExerciseContent(payload.content),
    hints: sanitizeArray(
      payload.hints, 
      (hint) => {
        const clean = sanitizeText(String(hint || ''), 200);
        return clean ? clean : null;
      },
      10
    ),
    explanation: sanitizeText(payload.explanation || '', 1000),
    tags: sanitizeArray(
      payload.tags,
      (tag) => {
        const clean = sanitizeText(String(tag || ''), 50);
        return clean ? clean : null;
      },
      20
    ),
    isPublished: Boolean(payload.isPublished),
    authorEmail: sanitizeText(payload.authorEmail || '', 100)
  };
}

/**
 * Validates that a string contains only allowed characters
 */
export function isValidText(text: string, allowedPattern?: RegExp): boolean {
  if (typeof text !== 'string') {
    return false;
  }
  
  // Default pattern: letters, numbers, spaces, basic punctuation
  const defaultPattern = /^[a-zA-Z0-9\s.,!?;:()\-'"_]+$/;
  const pattern = allowedPattern || defaultPattern;
  
  return pattern.test(text);
}

/**
 * Sanitizes file names and IDs
 */
export function sanitizeIdentifier(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, hyphen
    .slice(0, 50) // Limit length
    .toLowerCase();
}

/**
 * Content length limits for different exercise elements
 */
export const CONTENT_LIMITS = {
  TITLE: 200,
  INSTRUCTIONS: 500,
  EXPLANATION: 1000,
  HINT: 200,
  TAG: 50,
  QUESTION_TEXT: 500,
  OPTION_TEXT: 200,
  SENTENCE_TEXT: 500,
  SEGMENT_TEXT: 100,
  PAIR_ITEM: 200,
  ANSWER_TEXT: 100,
  
  // Array limits
  MAX_QUESTIONS: 50,
  MAX_OPTIONS: 10,
  MAX_SENTENCES: 50,
  MAX_SEGMENTS: 20,
  MAX_PAIRS: 20,
  MAX_BLANKS: 10,
  MAX_HINTS: 10,
  MAX_TAGS: 20
} as const;

/**
 * Validates content length against limits
 */
export function validateContentLength(
  content: string, 
  limit: number, 
  fieldName: string
): string | null {
  if (typeof content !== 'string') {
    return `${fieldName} must be a string`;
  }
  
  if (content.length > limit) {
    return `${fieldName} must be less than ${limit} characters`;
  }
  
  return null;
}