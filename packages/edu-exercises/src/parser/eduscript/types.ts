// EduScript parser types

export interface EduScriptMetadata {
  type: string;
  title?: string;
  instructions?: string;
  difficulty?: string;
  [key: string]: any;
}

export interface EduScriptConfig {
  variation?: string;
  style?: string;
  time?: number;
  limit?: number;
  lives?: number;
  shuffle?: boolean;
  [key: string]: any;
}

export interface EduScriptVariable {
  name: string;
  value: any;
  type: 'string' | 'array' | 'function';
}

export interface ParseContext {
  metadata: EduScriptMetadata;
  config: EduScriptConfig;
  variables: Map<string, EduScriptVariable>;
  authorEmail: string;
  exerciseIndex: number;
}

export interface FunctionCall {
  name: string;
  params: any[];
  raw: string;
}

export interface EduScriptFunction {
  name: string;
  execute(params: any[], context: ParseContext): any;
  validate?(params: any[]): boolean;
}

export interface EduScriptParseResult {
  success: boolean;
  exercises: any[]; // CreateExercisePayload[] after conversion
  errors: string[];
  warnings: string[];
}

export interface InlineDecorator {
  type: 'ins' | 'idea' | 'img' | 'hint';
  value: string;
  position: number;
}

// Exercise-specific types
export interface ParsedExercise {
  metadata: EduScriptMetadata;
  config: EduScriptConfig;
  content: any;
  variables: Map<string, EduScriptVariable>;
  decorators: InlineDecorator[];
  raw: string;
}

export interface ExerciseBlock {
  metadata: string;
  config: string;
  content: string;
  raw: string;
  startLine: number;
  endLine: number;
}