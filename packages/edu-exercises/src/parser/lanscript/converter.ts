// packages/edu-exercises/src/parser/lanscript/converter.ts
import { Exercise, CreateExercisePayload } from '@repo/api-bridge';

/**
 * Converts an Exercise or CreateExercisePayload object to LanScript format
 * @param exercise - The exercise object to convert
 * @returns LanScript formatted string
 */
export function exerciseToLanScript(exercise: Exercise | CreateExercisePayload): string {
    // Validate required fields
    if (!exercise.type || !exercise.title) {
        console.warn('Exercise missing required fields:', exercise);
        return '{\n  // Error: Exercise data incomplete\n}';
    }
    
    let script = '{\n';
    
    // Basic metadata with safe access
    script += `  type: "${exercise.type.toLowerCase()}"\n`;
    script += `  title: "${escapeQuotes(exercise.title)}"\n`;
    script += `  difficulty: "${exercise.difficulty || 'BEGINNER'}"\n`;
    script += `  category: "${exercise.category || 'GENERAL'}"\n`;
    
    // Check if it's a full Exercise object with isPublished
    if ('isPublished' in exercise) {
        script += `  isPublished: "${exercise.isPublished}"\n`;
    }
    
    // Optional fields
    if (exercise.instructions) {
        script += `  instructions: "${escapeQuotes(exercise.instructions)}"\n`;
    }
    
    if (exercise.explanation) {
        script += `  explanation: "${escapeQuotes(exercise.explanation)}"\n`;
    }
    
    if (exercise.tags && exercise.tags.length > 0) {
        script += `  tags: "${exercise.tags.join(', ')}"\n`;
    }
    
    // Global hints (if any)
    if (exercise.hints && exercise.hints.length > 0) {
        script += `  HINT(${escapeQuotes(exercise.hints.join('. '))})\n`;
    }
    
    script += '\n';
    
    // Content based on type
    switch (exercise.type) {
        case 'FILL_BLANK': {
            const content = exercise.content as any;
            content.sentences?.forEach((sentence: any) => {
                let text = sentence.text;
                
                // Convert blanks back to *word* format
                sentence.blanks?.forEach((blank: any) => {
                    const answers = blank.answers.join('|');
                    // Replace the first occurrence of ___ with the answer format
                    text = text.replace('___', `*${answers}*`);
                });
                
                script += `  ${text}`;
                
                // Add hint if present
                if (sentence.blanks?.[0]?.hint) {
                    script += ` @hint(${escapeQuotes(sentence.blanks[0].hint)})`;
                }
                
                script += '\n';
            });
            break;
        }
        
        case 'MATCHING': {
            const content = exercise.content as any;
            content.pairs?.forEach((pair: any) => {
                script += `  ${escapeQuotes(pair.left)} = ${escapeQuotes(pair.right)}`;
                
                if (pair.hint) {
                    script += ` @hint(${escapeQuotes(pair.hint)})`;
                }
                
                script += '\n';
            });
            break;
        }
        
        case 'MULTIPLE_CHOICE': {
            const content = exercise.content as any;
            content.questions?.forEach((q: any) => {
                // Build the correct answers list
                const correctAnswers = q.correctIndices
                    .map((i: number) => q.options[i])
                    .join(',');
                
                // Format question and options
                script += `  ${escapeQuotes(q.question)} = ${q.options.map(escapeQuotes).join(' | ')} [${correctAnswers}]`;
                
                if (q.hint) {
                    script += ` @hint(${escapeQuotes(q.hint)})`;
                }
                
                if (q.explanation) {
                    script += ` @explanation(${escapeQuotes(q.explanation)})`;
                }
                
                script += '\n';
            });
            break;
        }
        
        case 'ORDERING': {
            const content = exercise.content as any;
            content.sentences?.forEach((sentence: any) => {
                script += `  ${sentence.segments.map(escapeQuotes).join(' | ')}`;
                
                if (sentence.hint) {
                    script += ` @hint(${escapeQuotes(sentence.hint)})`;
                }
                
                script += '\n';
            });
            break;
        }
    }
    
    script += '}';
    return script;
}

/**
 * Escapes quotes in strings for LanScript format
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeQuotes(str: string): string {
    if (!str) return str;
    // Escape double quotes and backslashes
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Converts multiple exercises to a single LanScript document
 * @param exercises - Array of exercises to convert
 * @returns LanScript formatted string with multiple exercise blocks
 */
export function exercisesToLanScript(exercises: (Exercise | CreateExercisePayload)[]): string {
    return exercises.map(exerciseToLanScript).join('\n\n');
}

/**
 * Formats a LanScript string with proper indentation
 * @param lanscript - The LanScript string to format
 * @returns Formatted LanScript string
 */
export function formatLanScript(lanscript: string): string {
    const lines = lanscript.split('\n');
    const formatted: string[] = [];
    let insideBlock = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed === '{') {
            formatted.push('{');
            insideBlock = true;
        } else if (trimmed === '}') {
            formatted.push('}');
            insideBlock = false;
        } else if (trimmed.length > 0) {
            if (insideBlock) {
                formatted.push('  ' + trimmed);
            } else {
                formatted.push(trimmed);
            }
        } else if (line.length === 0) {
            formatted.push('');
        }
    }
    
    return formatted.join('\n');
}