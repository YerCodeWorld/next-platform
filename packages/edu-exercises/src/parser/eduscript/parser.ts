// EduScript parser implementation

import { 
  EduScriptParseResult, 
  ParsedExercise, 
  ExerciseBlock, 
  ParseContext,
  EduScriptMetadata,
  EduScriptConfig,
  EduScriptVariable,
  InlineDecorator
} from './types';
import { FunctionRegistry, parseFunctionCall } from './functions';
import { exerciseRegistry } from '../../registry/ExerciseRegistry';
import { CreateExercisePayload } from '@repo/api-bridge';

export class EduScriptParser {
  private functionRegistry: FunctionRegistry;

  constructor() {
    this.functionRegistry = new FunctionRegistry();
  }

  parse(script: string, authorEmail: string): EduScriptParseResult {
    const result: EduScriptParseResult = {
      success: true,
      exercises: [],
      errors: [],
      warnings: []
    };

    try {
      // Split script into exercise blocks
      const blocks = this.extractBlocks(script);
      
      if (blocks.length === 0) {
        result.errors.push('No valid exercise blocks found');
        result.success = false;
        return result;
      }

      // Parse each block
      blocks.forEach((block, index) => {
        try {
          const parsedExercise = this.parseExerciseBlock(block, authorEmail, index);
          
          // Convert ParsedExercise to CreateExercisePayload using exercise registry
          const exercisePayload = this.convertToExercisePayload(parsedExercise, authorEmail);
          result.exercises.push(exercisePayload);
        } catch (error) {
          result.errors.push(`Block ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
          result.success = false;
        }
      });

    } catch (error) {
      result.errors.push(`Parser error: ${error instanceof Error ? error.message : String(error)}`);
      result.success = false;
    }

    return result;
  }

  private extractBlocks(script: string): ExerciseBlock[] {
    const blocks: ExerciseBlock[] = [];
    const lines = script.split('\n');
    let currentBlock: string[] = [];
    let inBlock = false;
    let braceDepth = 0;
    let startLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      // Skip empty lines and comments outside blocks
      if (!inBlock && (line === '' || line.startsWith('//'))) {
        continue;
      }

      // Start of block
      if (line === '{' && !inBlock) {
        inBlock = true;
        braceDepth = 1;
        startLine = i;
        currentBlock = [];
        continue;
      }

      if (inBlock) {
        // Count braces for nested structures
        braceDepth += (line.match(/\{/g) || []).length;
        braceDepth -= (line.match(/\}/g) || []).length;

        if (braceDepth === 0) {
          // End of block
          const blockContent = currentBlock.join('\n');
          const block = this.parseBlockStructure(blockContent, startLine, i);
          if (block) {
            blocks.push(block);
          }
          inBlock = false;
          currentBlock = [];
        } else {
          const currentLine = lines[i];
          if (currentLine !== undefined) {
            currentBlock.push(currentLine);
          }
        }
      }
    }

    return blocks;
  }

  private parseBlockStructure(content: string, startLine: number, endLine: number): ExerciseBlock | null {
    const lines = content.split('\n');
    let metadata = '';
    let config = '';
    let exerciseContent = '';
    let currentSection = 'content';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('@metadata(')) {
        currentSection = 'metadata';
        metadata += line + '\n';
      } else if (trimmed.startsWith('@config(')) {
        currentSection = 'config';
        config += line + '\n';
      } else if (currentSection === 'metadata' && !trimmed.endsWith(')')) {
        metadata += line + '\n';
      } else if (currentSection === 'metadata' && trimmed.endsWith(')')) {
        metadata += line + '\n';
        currentSection = 'content';
      } else if (currentSection === 'config' && !trimmed.endsWith(')')) {
        config += line + '\n';
      } else if (currentSection === 'config' && trimmed.endsWith(')')) {
        config += line + '\n';
        currentSection = 'content';
      } else {
        exerciseContent += line + '\n';
      }
    }

    return {
      metadata: metadata.trim(),
      config: config.trim(),
      content: exerciseContent.trim(),
      raw: content,
      startLine,
      endLine
    };
  }

  private parseExerciseBlock(block: ExerciseBlock, authorEmail: string, exerciseIndex: number): ParsedExercise {
    // Parse metadata
    const metadata = this.parseMetadata(block.metadata);
    
    // Parse config
    const config = this.parseConfig(block.config);
    
    // Create parse context
    const context: ParseContext = {
      metadata,
      config,
      variables: new Map<string, EduScriptVariable>(),
      authorEmail,
      exerciseIndex
    };

    // Parse content with function resolution
    const processedContent = this.processContent(block.content, context);
    
    // Extract inline decorators
    const decorators = this.extractInlineDecorators(block.content);

    return {
      metadata,
      config,
      content: processedContent,
      variables: context.variables,
      decorators,
      raw: block.raw
    };
  }

  private parseMetadata(metadataStr: string): EduScriptMetadata {
    const metadata: EduScriptMetadata = { type: '' };
    
    if (!metadataStr) return metadata;

    // Extract content between @metadata( and )
    const match = metadataStr.match(/@metadata\s*\(([\s\S]*?)\)/);
    if (!match || !match[1]) return metadata;

    const content = match[1];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;

      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();

      metadata[key] = this.parseValue(value);
    }

    return metadata;
  }

  private parseConfig(configStr: string): EduScriptConfig {
    const config: EduScriptConfig = {};
    
    if (!configStr) return config;

    // Extract content between @config( and )
    const match = configStr.match(/@config\s*\(([\s\S]*?)\)/);
    if (!match || !match[1]) return config;

    const content = match[1];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;

      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();

      config[key] = this.parseValue(value);
    }

    return config;
  }

  private parseValue(value: string): any {
    value = value.trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Numbers
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    
    // Booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    return value;
  }

  private processContent(content: string, context: ParseContext): any {
    let processedContent = content;
    const processedLines: string[] = [];

    // Process each line
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      try {
        const processedLine = this.processLine(trimmed, context);
        if (processedLine !== null) {
          processedLines.push(processedLine);
        }
      } catch (error) {
        throw new Error(`Error processing line "${trimmed}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return processedLines.join('\n');
  }

  private processLine(line: string, context: ParseContext): string | null {
    // Handle variable definitions
    if (line.startsWith('@var ')) {
      this.processVariableDefinition(line, context);
      return null; // Variable definitions don't produce content
    }

    // Handle @define calls
    if (line.includes('@define(')) {
      this.processDefineFunction(line, context);
      return null;
    }

    // Process function calls in the line
    let processedLine = line;
    const functionMatches = line.matchAll(/@(\w+)\s*\([^)]*\)/g);
    
    for (const match of functionMatches) {
      const functionCall = parseFunctionCall(match[0]);
      if (functionCall && this.functionRegistry.has(functionCall.name)) {
        try {
          const result = this.functionRegistry.execute(
            functionCall.name, 
            functionCall.params, 
            context
          );
          
          // Replace function call with result
          if (result !== null && result !== undefined) {
            const replacement = Array.isArray(result) ? result.join(' | ') : String(result);
            processedLine = processedLine.replace(functionCall.raw, replacement);
          }
        } catch (error) {
          throw new Error(`Function ${functionCall.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return processedLine;
  }

  private processVariableDefinition(line: string, context: ParseContext): void {
    // @var routines = @fill('daily routines', 3)
    const match = line.match(/@var\s+(\w+)\s*=\s*(.+)/);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid variable definition: ${line}`);
    }

    const varName = match[1];
    const varValue = match[2];
    
    // Check if value is a function call
    const functionCall = parseFunctionCall(varValue.trim());
    if (functionCall) {
      context.variables.set(varName, {
        name: varName,
        value: functionCall,
        type: 'function'
      });
    } else {
      // Regular value
      const parsedValue = this.parseValue(varValue);
      context.variables.set(varName, {
        name: varName,
        value: parsedValue,
        type: typeof parsedValue === 'object' ? 'array' : 'string'
      });
    }
  }

  private processDefineFunction(line: string, context: ParseContext): void {
    const functionCall = parseFunctionCall(line);
    if (functionCall && functionCall.name === 'define') {
      this.functionRegistry.execute(functionCall.name, functionCall.params, context);
    }
  }

  private extractInlineDecorators(content: string): InlineDecorator[] {
    const decorators: InlineDecorator[] = [];
    const decoratorPattern = /@(ins|idea|img|hint)\s*\(([^)]+)\)/g;
    
    let match;
    while ((match = decoratorPattern.exec(content)) !== null) {
      decorators.push({
        type: match[1] as 'ins' | 'idea' | 'img' | 'hint',
        value: match[2].replace(/['"]/g, ''), // Remove quotes
        position: match.index
      });
    }

    return decorators;
  }

  private convertToExercisePayload(parsedExercise: ParsedExercise, authorEmail: string): CreateExercisePayload {
    const { metadata, config, content, raw } = parsedExercise;
    
    // Get exercise type from metadata and normalize it
    let exerciseType = metadata.type?.toUpperCase();
    if (!exerciseType) {
      throw new Error('Exercise type is required in metadata');
    }
    
    // Normalize type names (handle spaces and common variations)
    exerciseType = exerciseType.replace(/\s+/g, '_');
    
    // Handle common type variations
    const typeMap: Record<string, string> = {
      'FILL_BLANK': 'FILL_BLANK',
      'FILL_BLANKS': 'FILL_BLANK',
      'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
      'MULTI_CHOICE': 'MULTIPLE_CHOICE',
      'MATCHING': 'MATCHING',
      'ORDERING': 'ORDERING',
      'CATEGORIZE': 'CATEGORIZER',
      'SELECTOR': 'SELECTOR'
    };
    
    exerciseType = typeMap[exerciseType] || exerciseType;

    // Use exercise registry to parse the content for this exercise type
    // The registry expects lines array, not a raw string
    const contentLines = content.split('\n').filter(line => line.trim() !== '');
    const parseResult = exerciseRegistry.parseContentWithVariation(exerciseType, contentLines, {
      variation: config.style || config.variation // 'style' takes precedence over 'variation' for display preference
    });

    // Create the payload in the format expected by the API
    const payload: CreateExercisePayload = {
      type: exerciseType as any,
      title: metadata.title || `${exerciseType} Exercise`,
      instructions: metadata.instructions || '',
      difficulty: metadata.difficulty as any || 'INTERMEDIATE',
      category: metadata.category as any || 'GENERAL',
      isPublished: false,
      content: parseResult.content,
      authorEmail,
      // New fields for preserving original EduScript
      rawEduScript: raw,
      variation: parseResult.variation, // Use detected variation
      // Optional fields
      hints: metadata.hints || [],
      tags: metadata.tags || [],
      explanation: metadata.explanation,
      timeLimit: config.time
    };

    return payload;
  }
}

// Utility function to detect script type
export function detectScriptType(script: string): 'lanscript' | 'eduscript' | 'unknown' {
  // EduScript indicators
  if (script.includes('@metadata(') || 
      script.includes('@config(') || 
      script.includes('@fill(') ||
      script.includes('@var ')) {
    return 'eduscript';
  }

  // LanScript indicators (simple key-value pairs)
  if (script.match(/^\s*\w+\s*:\s*.+$/m)) {
    return 'lanscript';
  }

  return 'unknown';
}