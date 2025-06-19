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
        const errors: string[] = [];
        const exercises: CreateExercisePayload[] = [];

        try {
            const blocks = this.parseBlocks(script);

            for (const block of blocks) {
                try {
                    const exercise = this.parseBlock(block, authorEmail);
                    exercises.push(exercise);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
                    errors.push(`Block parsing error: ${errorMessage}`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown script parsing error';
            errors.push(`Script parsing error: ${errorMessage}`);
        }

        return { exercises, errors };
    }

    private parseBlocks(script: string): LanScriptBlock[] {
        const blocks: LanScriptBlock[] = [];
        const lines = script.split('\n');
        let currentBlock: LanScriptBlock | null = null;
        let inMetadata = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim() ?? '';

            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
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

        // Auto-detect type if not specified
        const exerciseType = metadata.type || this.detectType(content);

        // Apply default metadata
        const title = metadata.title || `${exerciseType} Exercise`;
        const difficulty = metadata.difficulty || 'INTERMEDIATE';
        const category = metadata.category || 'GENERAL';

        let exerciseContent;

        switch (exerciseType) {
            case 'FILL_BLANK':
                exerciseContent = this.parseFillBlank(content);
                break;
            case 'MATCHING':
                exerciseContent = this.parseMatching(content);
                break;
            case 'MULTIPLE_CHOICE':
                exerciseContent = this.parseMultipleChoice(content);
                break;
            case 'ORDERING':
                exerciseContent = this.parseOrdering(content);
                break;
            default:
                throw new Error(`Unknown exercise type: ${exerciseType}`);
        }

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

    private detectType(lines: string[]): ExerciseType {
        // Check for fill-in-the-blank (asterisks)
        if (lines.some(line => line.includes('*') && line.split('*').length >= 3)) {
            return 'FILL_BLANK';
        }

        // Check for matching (equals sign)
        if (lines.some(line => line.includes('='))) {
            return 'MATCHING';
        }

        // Check for multiple choice (brackets or vertical bars)
        if (lines.some(line => line.includes('[') || (line.includes('|') && line.includes('=')))) {
            return 'MULTIPLE_CHOICE';
        }

        // Check for ordering (pipe symbols without equals)
        if (lines.some(line => line.includes('|') && !line.includes('='))) {
            return 'ORDERING';
        }

        // Default to fill-in-the-blank
        return 'FILL_BLANK';
    }

    private cleanLine(line: string): string {
        // Remove decorators like @hint(...), @explanation(...)
        let cleanLine = line.replace(/@\w+\([^)]*\)/g, '');
        
        // Remove extra whitespace
        cleanLine = cleanLine.trim();
        
        return cleanLine;
    }

    private parseFillBlank(lines: string[]): FillBlankContent {
        const sentences: FillBlankContent['sentences'] = [];

        lines.forEach(line => {
            const cleanLine = this.cleanLine(line);
            if (!cleanLine) return;

            const blanks: { position: number; answers: string[]; hint?: string }[] = [];
            let processedText = cleanLine;
            let blankIndex = 0;

            // Find all *answer* patterns
            const blankPattern = /\*([^*]+)\*/g;
            let match;

            while ((match = blankPattern.exec(cleanLine)) !== null) {
                const answers = match[1].split('|').map(a => a.trim());
                const blankPlaceholder = '___';
                
                blanks.push({
                    position: blankIndex,
                    answers,
                    hint: undefined // Could be extracted from decorators later
                });

                processedText = processedText.replace(match[0], blankPlaceholder);
                blankIndex++;
            }

            if (blanks.length > 0) {
                sentences.push({
                    text: processedText,
                    blanks
                });
            }
        });

        return { sentences };
    }

    private parseMatching(lines: string[]): MatchingContent {
        const pairs: MatchingContent['pairs'] = [];

        lines.forEach(line => {
            const cleanLine = this.cleanLine(line);
            if (!cleanLine || !cleanLine.includes('=')) return;

            const [left, right] = cleanLine.split('=').map(part => part.trim());
            if (left && right) {
                pairs.push({
                    left,
                    right,
                    hint: undefined
                });
            }
        });

        return { pairs, randomize: true };
    }

    private parseMultipleChoice(lines: string[]): MultipleChoiceContent {
        const questions: MultipleChoiceContent['questions'] = [];

        lines.forEach(line => {
            const cleanLine = this.cleanLine(line);
            if (!cleanLine) return;

            // Format: "Question = option1 | option2 | option3 [correct1, correct2]"
            const equalIndex = cleanLine.indexOf('=');
            const bracketIndex = cleanLine.indexOf('[');
            
            if (equalIndex === -1) return;

            const question = cleanLine.substring(0, equalIndex).trim();
            const optionsAndAnswers = cleanLine.substring(equalIndex + 1).trim();

            let optionsText, answersText;
            if (bracketIndex !== -1) {
                optionsText = optionsAndAnswers.substring(0, bracketIndex - equalIndex - 1).trim();
                answersText = optionsAndAnswers.substring(bracketIndex - equalIndex).trim();
            } else {
                optionsText = optionsAndAnswers;
                answersText = '';
            }

            const options = optionsText.split('|').map(opt => opt.trim());
            
            let correctIndices: number[] = [];
            if (answersText) {
                const answers = answersText.replace(/[\[\]]/g, '').split(',').map(a => a.trim());
                correctIndices = answers.map(answer => 
                    options.findIndex(opt => opt.toLowerCase() === answer.toLowerCase())
                ).filter(idx => idx !== -1);
            }

            if (options.length > 1) {
                questions.push({
                    question,
                    options,
                    correctIndices,
                    hint: undefined,
                    explanation: undefined
                });
            }
        });

        return { questions };
    }

    private parseOrdering(lines: string[]): OrderingContent {
        const sentences: OrderingContent['sentences'] = [];

        lines.forEach(line => {
            const cleanLine = this.cleanLine(line);
            if (!cleanLine || !cleanLine.includes('|')) return;

            const segments = cleanLine.split('|').map(segment => segment.trim());
            if (segments.length > 1) {
                sentences.push({
                    segments,
                    hint: undefined
                });
            }
        });

        return { sentences };
    }
}