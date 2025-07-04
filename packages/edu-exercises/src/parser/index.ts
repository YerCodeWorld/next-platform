export { detectExerciseType } from './detector';
export { validateExercise } from './validator';
export { exerciseToLanScript, exercisesToLanScript, formatLanScript } from './lanscript/converter';

// EduScript parser exports
export { 
  EduScriptParser, 
  detectScriptType,
  FunctionRegistry,
  parseFunctionCall,
  parseFunctionParams,
  type EduScriptMetadata,
  type EduScriptConfig,
  type EduScriptVariable,
  type ParseContext,
  type FunctionCall,
  type EduScriptFunction,
  type EduScriptParseResult,
  type InlineDecorator,
  type ParsedExercise,
  type ExerciseBlock
} from './eduscript';