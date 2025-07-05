// SELECTOR exercise type implementation

import type { ExerciseTypeConfig } from '../registry/ExerciseRegistry';
import type { SelectorContent } from '@repo/api-bridge';
import { validateStringLength, removeDecorators } from '../utils/exerciseHelpers';

// Detection patterns for different variations
const selectorPatterns = {
  // on-text: I [is] a baseball player
  onText: /\[[^\]]+\]/,
  // image: @img() with coordinate data (experimental)
  image: /@img\s*\(/
};

// Detect SELECTOR exercise type and variation
function detectSelector(lines: string[]): { isMatch: boolean; variation: string } {
  const relevantLines = lines.filter(line => 
    line.trim() && !line.trim().startsWith('//') && !line.includes('@ins(') && !line.includes('@idea(')
  );

  if (relevantLines.length === 0) {
    return { isMatch: false, variation: 'on-text' };
  }

  // Check for image variation
  const hasImagePattern = relevantLines.some(line => selectorPatterns.image.test(line));
  if (hasImagePattern) {
    return { isMatch: true, variation: 'image' };
  }

  // Check for on-text variation (contains square brackets)
  const hasTextPattern = relevantLines.some(line => selectorPatterns.onText.test(line));
  if (hasTextPattern) {
    return { isMatch: true, variation: 'on-text' };
  }

  return { isMatch: false, variation: 'on-text' };
}

// Parse SELECTOR content from lines
function parseSelector(lines: string[]): SelectorContent {
  const detection = detectSelector(lines);
  const variation = detection.variation as 'on-text' | 'image';

  if (variation === 'image') {
    return parseImageVariation(lines);
  } else {
    return parseOnTextVariation(lines);
  }
}

// Parse on-text variation: I [is] a baseball player
function parseOnTextVariation(lines: string[]): SelectorContent {
  const sentences: Array<{
    text: string;
    selectableWords: Array<{
      wordIndex: number;
      isTarget: boolean;
      word: string;
    }>;
    instruction?: string;
  }> = [];

  let globalInstruction = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Extract global instruction if present
    const instructionMatch = trimmed.match(/@ins\s*\(([^)]+)\)/);
    if (instructionMatch && instructionMatch[1]) {
      const instruction = instructionMatch[1].replace(/['"]/g, '');
      
      // Check if this instruction is at the end of a sentence or standalone
      const cleanLine = trimmed.replace(/@ins\s*\([^)]+\)/, '').trim();
      if (cleanLine) {
        // Instruction is attached to a sentence
        const sentence = parseSentenceWithSelections(cleanLine, instruction);
        if (sentence) {
          sentences.push(sentence);
        }
      } else {
        // Standalone instruction
        globalInstruction = instruction;
      }
      continue;
    }

    // Parse sentence with selections
    if (selectorPatterns.onText.test(trimmed)) {
      const sentence = parseSentenceWithSelections(trimmed);
      if (sentence) {
        sentences.push(sentence);
      }
    }
  }

  return {
    variation: 'on-text',
    sentences,
    globalInstruction: globalInstruction || 'Select the correct words'
  };
}

// Parse a sentence with bracketed selections
function parseSentenceWithSelections(text: string, instruction?: string): {
  text: string;
  selectableWords: Array<{
    wordIndex: number;
    isTarget: boolean;
    word: string;
  }>;
  instruction?: string;
} | null {
  const selectableWords: Array<{
    wordIndex: number;
    isTarget: boolean;
    word: string;
  }> = [];

  // Extract bracketed words and their positions
  let processedText = text;
  let wordIndex = 0;
  let currentText = '';

  // Split by spaces to process word by word
  const words = text.split(/\s+/);
  const finalWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    
    // Check if word contains brackets
    const bracketMatch = word.match(/\[([^\]]+)\]/);
    if (bracketMatch && bracketMatch[1]) {
      const selectedWord = bracketMatch[1];
      const cleanWord = word.replace(/\[([^\]]+)\]/, selectedWord);
      
      selectableWords.push({
        wordIndex: i,
        isTarget: true,
        word: selectedWord
      });
      
      finalWords.push(cleanWord);
    } else {
      finalWords.push(word);
    }
  }

  // If no selections found, return null
  if (selectableWords.length === 0) {
    return null;
  }

  return {
    text: finalWords.join(' '),
    selectableWords,
    instruction
  };
}

// Parse image variation: @img(URL) with coordinate data
function parseImageVariation(lines: string[]): SelectorContent {
  let imageUrl = '';
  let instruction = 'Select the correct areas in the image';
  const selectableAreas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    isTarget: boolean;
    label?: string;
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Extract image URL
    const imageMatch = trimmed.match(/@img\s*\(([^)]+)\)/);
    if (imageMatch && imageMatch[1]) {
      imageUrl = imageMatch[1].replace(/['"]/g, '');
      continue;
    }

    // Extract instruction
    const instructionMatch = trimmed.match(/@ins\s*\(([^)]+)\)/);
    if (instructionMatch && instructionMatch[1]) {
      instruction = instructionMatch[1].replace(/['"]/g, '');
      continue;
    }

    // Parse coordinate data (if provided)
    // Format: area(x, y, width, height, isTarget, label?)
    const areaMatch = trimmed.match(/area\s*\(([^)]+)\)/);
    if (areaMatch && areaMatch[1]) {
      const params = areaMatch[1].split(',').map(p => p.trim());
      if (params.length >= 5 && params[0] && params[1] && params[2] && params[3] && params[4]) {
        selectableAreas.push({
          x: parseFloat(params[0]) || 0,
          y: parseFloat(params[1]) || 0,
          width: parseFloat(params[2]) || 10,
          height: parseFloat(params[3]) || 10,
          isTarget: params[4].toLowerCase() === 'true',
          label: params[5] ? params[5].replace(/['"]/g, '') : undefined
        });
      }
    }
  }

  return {
    variation: 'image',
    image: {
      url: imageUrl,
      selectableAreas,
      instruction
    },
    globalInstruction: instruction
  };
}

// Validate SELECTOR content
function validateSelector(content: SelectorContent): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.variation) {
    content.variation = 'on-text';
  }

  if (content.variation === 'on-text') {
    if (!content.sentences || content.sentences.length === 0) {
      errors.push('On-text variation requires at least one sentence with selections');
    } else {
      content.sentences.forEach((sentence, index) => {
        const textValidation = validateStringLength(sentence.text, 1, 500, 'Sentence text');
        if (textValidation) {
          errors.push(`Sentence ${index + 1}: ${textValidation}`);
        }
        
        if (!sentence.selectableWords || sentence.selectableWords.length === 0) {
          errors.push(`Sentence ${index + 1}: Must have at least one selectable word`);
        }

        // Check if at least one word is marked as target
        const hasTargets = sentence.selectableWords.some(word => word.isTarget);
        if (!hasTargets) {
          errors.push(`Sentence ${index + 1}: Must have at least one target word`);
        }
      });
    }
  } else if (content.variation === 'image') {
    if (!content.image) {
      errors.push('Image variation requires image configuration');
    } else {
      if (!content.image.url) {
        errors.push('Image variation requires a valid image URL');
      }
      
      if (!content.image.selectableAreas || content.image.selectableAreas.length === 0) {
        errors.push('Image variation should have selectable areas defined');
      } else {
        // Check if at least one area is marked as target
        const hasTargets = content.image.selectableAreas.some(area => area.isTarget);
        if (!hasTargets) {
          errors.push('Image variation must have at least one target area');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Convert content back to LanScript
function selectorLanScript(content: SelectorContent): string {
  const lines: string[] = [];

  if (content.globalInstruction) {
    lines.push(`@ins("${content.globalInstruction}")`);
  }

  if (content.variation === 'on-text') {
    content.sentences?.forEach(sentence => {
      let line = sentence.text;
      
      // Replace target words with bracketed versions
      sentence.selectableWords.forEach(selection => {
        if (selection.isTarget) {
          const words = line.split(/\s+/);
          if (words[selection.wordIndex]) {
            words[selection.wordIndex] = `[${selection.word}]`;
            line = words.join(' ');
          }
        }
      });

      if (sentence.instruction) {
        line += ` @ins("${sentence.instruction}")`;
      }

      lines.push(line);
    });
  } else if (content.variation === 'image') {
    if (content.image) {
      lines.push(`@img("${content.image.url}")`);
      
      if (content.image.instruction) {
        lines.push(`@ins("${content.image.instruction}")`);
      }

      // Add coordinate data
      content.image.selectableAreas?.forEach(area => {
        const params = [
          area.x.toString(),
          area.y.toString(),
          area.width.toString(),
          area.height.toString(),
          area.isTarget.toString()
        ];
        if (area.label) {
          params.push(`"${area.label}"`);
        }
        lines.push(`area(${params.join(', ')})`);
      });
    }
  }

  return lines.join('\n');
}

// Export the exercise configuration
export const selectorExercise: ExerciseTypeConfig<SelectorContent> = {
  type: 'SELECTOR',
  displayName: 'Selector',
  description: 'Select specific words or areas based on instructions',
  icon: 'cursor',
  
  detectPattern: (lines: string[]) => detectSelector(lines).isMatch,
  parseContent: parseSelector,
  validateContent: (content: SelectorContent) => {
    const result = validateSelector(content);
    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: []
    };
  },
  toLanScript: selectorLanScript,
  
  errorMessages: {
    parseError: (error: Error) => `Failed to parse selector exercise: ${error.message}`,
    validationError: (errors: string[]) => `Validation failed: ${errors.join(', ')}`,
    displayError: (error: Error) => `Display error: ${error.message}`
  },
  
  DisplayComponent: undefined, // Will be provided by the main app
  BuilderComponent: undefined  // Will be provided by the main app
};