// packages/exercises/src/parser/lanscript/parser.ts
import {
    CreateExercisePayload,
    ExerciseCategory,
    ExerciseDifficulty,
    ExerciseType,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from '@repo/api-bridge';
import { logger, logParserError, measurePerformance } from '../../utils/logger';
import { sanitizeExercisePayload } from '../../utils/sanitization';
import { validateExerciseByType } from '../validator';
import { exerciseRegistry } from '../../exercises';

export interface LanScriptBlock {
    metadata: {
        type?: ExerciseType;
        difficulty?: ExerciseDifficulty;
        category?: ExerciseCategory;
        topic?: string;
        title?: string;
        instructions?: string;
        explanation?: string;
        isPublished?: boolean;
        tags?: string[];
        hints?: string[];
        theme?: string;
        size?: number;
        gridSize?: number;
        grid_difficulty?: string;
        placementDifficulty?: string;
        caseSensitive?: boolean;
        allowBackwards?: boolean;
    };
    content: string[];
}

export interface LanScriptParseResult {
    exercises: CreateExercisePayload[];
    errors: string[];
}

export class LanScriptParser {
    parse(script: string, authorEmail: string): LanScriptParseResult {
        return measurePerformance('lanscript_parse', () => {
            const errors: string[] = [];
            const exercises: CreateExercisePayload[] = [];

            try {
                logger.debug('Starting LanScript parsing', { 
                    scriptLength: script.length, 
                    authorEmail 
                });

                const blocks = this.parseBlocks(script);
                logger.debug('Parsed blocks', { blockCount: blocks.length });

                for (const [index, block] of blocks.entries()) {
                    try {
                        const exercise = this.parseBlock(block, authorEmail);
                        
                        // Sanitize the exercise payload
                        const sanitizedExercise = sanitizeExercisePayload(exercise);
                        
                        // Validate the exercise
                        const validation = validateExerciseByType(sanitizedExercise);
                        if (!validation.isValid) {
                            errors.push(`Exercise ${index + 1} validation failed: ${validation.errors.join(', ')}`);
                            logger.warn('Exercise validation failed', { 
                                exerciseIndex: index + 1, 
                                errors: validation.errors 
                            });
                        } else {
                            exercises.push(sanitizedExercise);
                            logger.debug('Exercise parsed successfully', { 
                                exerciseIndex: index + 1, 
                                type: sanitizedExercise.type 
                            });
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
                        const blockError = `Block ${index + 1} parsing error: ${errorMessage}`;
                        errors.push(blockError);
                        
                        logParserError(`Block ${index + 1}`, error instanceof Error ? error : new Error(errorMessage));
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown script parsing error';
                const scriptError = `Script parsing error: ${errorMessage}`;
                errors.push(scriptError);
                
                logParserError(script, error instanceof Error ? error : new Error(errorMessage));
            }

            logger.info('LanScript parsing completed', { 
                exerciseCount: exercises.length, 
                errorCount: errors.length 
            });

            return { exercises, errors };
        }, { scriptLength: script.length });
    }

    private parseBlocks(script: string): LanScriptBlock[] {
        const blocks: LanScriptBlock[] = [];
        const lines = script.split('\n');
        let currentBlock: LanScriptBlock | null = null;
        let inMetadata = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? '';

            // Skip empty lines and comments
            if (!line || line.startsWith('#') || line.startsWith('//')) {
                continue;
            }

            // Start of a new block
            if (line === '{') {
                if (currentBlock) {
                    blocks.push(currentBlock);
                }
                currentBlock = {
                    metadata: {},
                    content: []
                };
                inMetadata = true;
                continue;
            }

            // End of a block
            if (line === '}') {
                if (currentBlock) {
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
                inMetadata = false;
                continue;
            }

            // Parse metadata or content
            if (currentBlock) {
                if (inMetadata && line.includes(':')) {
                    this.parseMetadataLine(line, currentBlock.metadata);
                } else {
                    // Content line - switch out of metadata mode
                    inMetadata = false;
                    currentBlock.content.push(line);
                }
            } else {
                // No block started yet, treat as a simple single-block script
                if (!currentBlock) {
                    currentBlock = {
                        metadata: {},
                        content: []
                    };
                }
                currentBlock.content.push(line);
            }
        }

        // Add final block if exists
        if (currentBlock) {
            blocks.push(currentBlock);
        }

        return blocks;
    }

    private parseMetadataLine(line: string, metadata: LanScriptBlock['metadata']) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');

        switch (key) {
            case 'type':
                if (['fill_blank', 'matching', 'multiple_choice', 'ordering'].includes(cleanValue.toLowerCase())) {
                    metadata.type = cleanValue.toUpperCase() as ExerciseType;
                }
                break;
            case 'difficulty':
                if (['beginner', 'intermediate', 'advanced'].includes(cleanValue.toLowerCase())) {
                    metadata.difficulty = cleanValue.toUpperCase() as ExerciseDifficulty;
                }
                break;
            case 'category':
                metadata.category = cleanValue.toUpperCase() as ExerciseCategory;
                break;
            case 'title':
                metadata.title = cleanValue;
                break;
            case 'instructions':
                metadata.instructions = cleanValue;
                break;
            case 'explanation':
                metadata.explanation = cleanValue;
                break;
            case 'ispublished':
                metadata.isPublished = cleanValue.toLowerCase() === 'true';
                break;
            case 'tags':
                metadata.tags = cleanValue.split(',').map(tag => tag.trim());
                break;
            case 'hints':
                metadata.hints = cleanValue.split(',').map(hint => hint.trim());
                break;
        }
    }

    private parseBlock(block: LanScriptBlock, authorEmail: string): CreateExercisePayload {
        const { metadata, content } = block;

        // Auto-detect type if not specified using registry
        const exerciseType = metadata.type || exerciseRegistry.detectType(content);
        
        if (!exerciseType) {
            throw new Error('Could not detect exercise type from content');
        }

        // Apply default metadata
        const title = metadata.title || `${exerciseType} Exercise`;
        const difficulty = metadata.difficulty || 'INTERMEDIATE';
        const category = metadata.category || 'GENERAL';

        // Parse content using registry
        const exerciseContent = exerciseRegistry.parseContent(exerciseType, content);

        return {
            title,
            instructions: metadata.instructions,
            type: exerciseType,
            difficulty,
            category,
            content: exerciseContent,
            hints: metadata.hints || [],
            explanation: metadata.explanation,
            tags: metadata.tags || [],
            isPublished: metadata.isPublished || false,
            authorEmail
        };
    }

    // Type detection is now handled by the registry
    // This method is kept for backwards compatibility but delegates to registry
    private detectType(lines: string[]): ExerciseType {
        const detected = exerciseRegistry.detectType(lines);
        return detected || 'FILL_BLANK'; // Fallback to fill blank
    }

    // All parsing methods are now handled by the exercise registry
    // Keeping these utility methods for backwards compatibility
    
    private cleanLine(line: string): string {
        // Remove decorators like @hint(...), @explanation(...)
        let cleanLine = line.replace(/@\w+\([^)]*\)/g, '');
        
        // Remove extra whitespace
        cleanLine = cleanLine.trim();
        
        return cleanLine;
    }

    private isCommentLine(line: string): boolean {
        const trimmed = line.trim();
        return trimmed.startsWith('//') || trimmed.startsWith('#');
    }
}