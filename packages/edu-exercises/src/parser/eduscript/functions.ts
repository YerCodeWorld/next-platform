// EduScript function implementations

import { EduScriptFunction, ParseContext, FunctionCall } from './types';
import { fill, libraryExists } from '../../data/wordLibraries';

export class FunctionRegistry {
  private functions: Map<string, EduScriptFunction> = new Map();

  constructor() {
    this.registerCoreFunctions();
  }

  register(func: EduScriptFunction): void {
    this.functions.set(func.name, func);
  }

  execute(name: string, params: any[], context: ParseContext): any {
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Unknown function: ${name}`);
    }

    if (func.validate && !func.validate(params)) {
      throw new Error(`Invalid parameters for function: ${name}`);
    }

    return func.execute(params, context);
  }

  has(name: string): boolean {
    return this.functions.has(name);
  }

  private registerCoreFunctions(): void {
    // @fill function
    this.register({
      name: 'fill',
      execute: (params: any[], context: ParseContext) => {
        const [library, amount = 1, filters = {}] = params;
        
        if (!libraryExists(library)) {
          throw new Error(`Library '${library}' does not exist`);
        }

        try {
          return fill(library, amount, filters);
        } catch (error) {
          throw new Error(`@fill error: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
      validate: (params: any[]) => {
        return params.length >= 1 && typeof params[0] === 'string';
      }
    });

    // @img function
    this.register({
      name: 'img',
      execute: (params: any[], context: ParseContext) => {
        const [url] = params;
        return { type: 'image', url };
      },
      validate: (params: any[]) => {
        return params.length === 1 && typeof params[0] === 'string';
      }
    });

    // @idea function (replaces @hint)
    this.register({
      name: 'idea',
      execute: (params: any[], context: ParseContext) => {
        const [text] = params;
        return { type: 'idea', text };
      },
      validate: (params: any[]) => {
        return params.length === 1 && typeof params[0] === 'string';
      }
    });

    // @ins function
    this.register({
      name: 'ins',
      execute: (params: any[], context: ParseContext) => {
        const [text] = params;
        return { type: 'instruction', text };
      },
      validate: (params: any[]) => {
        return params.length === 1 && typeof params[0] === 'string';
      }
    });

    // @var function
    this.register({
      name: 'var',
      execute: (params: any[], context: ParseContext) => {
        const [varName] = params;
        
        if (!context.variables.has(varName)) {
          throw new Error(`Variable '${varName}' is not defined`);
        }

        const variable = context.variables.get(varName)!;
        
        // If it's a function call, execute it
        if (variable.type === 'function') {
          return this.execute(variable.value.name, variable.value.params, context);
        }
        
        return variable.value;
      },
      validate: (params: any[]) => {
        return params.length === 1 && typeof params[0] === 'string';
      }
    });

    // @define function
    this.register({
      name: 'define',
      execute: (params: any[], context: ParseContext) => {
        const [name, content] = params;
        
        context.variables.set(name, {
          name,
          value: content,
          type: Array.isArray(content) ? 'array' : 'string'
        });
        
        return null; // @define doesn't return content
      },
      validate: (params: any[]) => {
        return params.length === 2 && typeof params[0] === 'string';
      }
    });

    // @randomize function
    this.register({
      name: 'randomize',
      execute: (params: any[], context: ParseContext) => {
        const [content, type, amount = 1] = params;
        
        if (type === 'blank') {
          return this.randomizeBlank(content, amount);
        } else if (type === 'singleBlank') {
          return this.randomizeSingleBlank(content);
        }
        
        // Default: shuffle array
        if (Array.isArray(content)) {
          return [...content].sort(() => Math.random() - 0.5);
        }
        
        return content;
      },
      validate: (params: any[]) => {
        return params.length >= 1;
      }
    });

    // @length function
    this.register({
      name: 'length',
      execute: (params: any[], context: ParseContext) => {
        const [content] = params;
        
        if (typeof content === 'string') {
          return content.length;
        } else if (Array.isArray(content)) {
          return content.length;
        }
        
        return 0;
      },
      validate: (params: any[]) => {
        return params.length === 1;
      }
    });

    // @notes function (replaces @explanation)
    this.register({
      name: 'notes',
      execute: (params: any[], context: ParseContext) => {
        const [text] = params;
        return { type: 'notes', text };
      },
      validate: (params: any[]) => {
        return params.length === 1 && typeof params[0] === 'string';
      }
    });
  }

  private randomizeBlank(content: string | string[], amount: number): any {
    if (typeof content === 'string') {
      const words = content.split(' ');
      const indices = this.getRandomIndices(words.length, amount);
      
      return words.map((word, index) => ({
        text: word,
        isBlank: indices.includes(index)
      }));
    }
    
    if (Array.isArray(content)) {
      const indices = this.getRandomIndices(content.length, amount);
      return content.map((item, index) => ({
        text: item,
        isBlank: indices.includes(index)
      }));
    }
    
    return content;
  }

  private randomizeSingleBlank(content: string | string[]): any {
    if (typeof content === 'string') {
      const letters = content.split('');
      const blankCount = Math.max(1, Math.floor(letters.length / 3));
      const indices = this.getRandomIndices(letters.length, blankCount);
      
      return letters.map((letter, index) => ({
        letter,
        isBlank: indices.includes(index)
      }));
    }
    
    if (Array.isArray(content)) {
      return content.map(word => this.randomizeSingleBlank(word));
    }
    
    return content;
  }

  private getRandomIndices(length: number, count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length }, (_, i) => i);
    
    for (let i = 0; i < Math.min(count, length); i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const removed = available.splice(randomIndex, 1)[0];
      if (removed !== undefined) {
        indices.push(removed);
      }
    }
    
    return indices;
  }
}

// Utility function to parse function calls from text
export function parseFunctionCall(text: string): FunctionCall | null {
  const match = text.match(/@(\w+)\s*\((.*?)\)/);
  if (!match || !match[1] || match[2] === undefined) return null;

  const name = match[1];
  const paramsStr = match[2];
  const params = parseFunctionParams(paramsStr);

  return {
    name,
    params,
    raw: match[0]
  };
}

// Parse function parameters
export function parseFunctionParams(paramsStr: string): any[] {
  if (!paramsStr.trim()) return [];

  const params: any[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;

  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar) {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && char === ',' && depth === 0) {
      params.push(parseParamValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    params.push(parseParamValue(current.trim()));
  }

  return params;
}

// Parse individual parameter value
function parseParamValue(value: string): any {
  value = value.trim();
  
  // String literals
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }
  
  // Booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    const content = value.slice(1, -1);
    if (!content.trim()) return [];
    return content.split(',').map(item => parseParamValue(item.trim()));
  }
  
  // Objects (simple key=value pairs)
  if (value.includes('=')) {
    const obj: any = {};
    value.split(',').forEach(pair => {
      const parts = pair.split('=');
      if (parts.length >= 2) {
        const key = parts[0]?.trim();
        const val = parts[1]?.trim();
        if (key && val !== undefined) {
          obj[key] = parseParamValue(val);
        }
      }
    });
    return obj;
  }
  
  // Plain strings (unquoted)
  return value;
}