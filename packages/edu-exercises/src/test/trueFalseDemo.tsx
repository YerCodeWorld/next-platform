// packages/edu-exercises/src/test/trueFalseDemo.tsx
// Demo: Creating a new exercise type with the registry system

import * as React from 'react';
import { ExerciseTypeConfig, ExerciseDisplayProps, ExerciseBuilderProps } from '../registry/ExerciseRegistry';
import { ValidationResult } from '../parser/validator';
import { 
    removeDecorators,
    isCommentLine,
    validateMinLength,
    validateMaxLength,
    validateStringLength,
    ErrorMessages
} from '../utils/exerciseHelpers';

/**
 * DEMO: True/False Exercise Type
 * Shows how easy it is to add a new exercise type with our registry system
 * 
 * Format: "The sky is blue. TRUE"
 *         "Fish can fly. FALSE"
 */

// Define the content interface
interface TrueFalseContent {
    statements: Array<{
        statement: string;
        isTrue: boolean;
        hint?: string;
    }>;
}

// Simple display component (in real app, this would be more sophisticated)
const TrueFalseDisplay: React.FC<ExerciseDisplayProps<any>> = ({ 
    content, 
    exercise, 
    onComplete 
}) => {
    const [userAnswers, setUserAnswers] = React.useState<(boolean | null)[]>(
        content.statements.map(() => null)
    );
    const [showResults, setShowResults] = React.useState(false);

    const handleAnswer = (index: number, answer: boolean) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = answer;
        setUserAnswers(newAnswers);
    };

    const checkAnswers = () => {
        setShowResults(true);
        const correct = userAnswers.every((answer, index) => 
            answer === content.statements[index]?.isTrue
        );
        onComplete?.(correct);
    };

    const allAnswered = userAnswers.every(answer => answer !== null);

    return (
        <div style={{ padding: '20px', fontFamily: 'Comic Neue, sans-serif' }}>
            <h3>🤔 True or False?</h3>
            <p><strong>{exercise.title}</strong></p>
            {exercise.instructions && <p><em>{exercise.instructions}</em></p>}
            
            <div style={{ margin: '20px 0' }}>
                {content.statements.map((statement, index) => (
                    <div key={index} style={{ 
                        margin: '15px 0', 
                        padding: '15px', 
                        border: '2px solid #ddd', 
                        borderRadius: '10px',
                        backgroundColor: showResults 
                            ? (userAnswers[index] === statement.isTrue ? '#d4edda' : '#f8d7da')
                            : '#f8f9fa'
                    }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                            {statement.statement}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => handleAnswer(index, true)}
                                disabled={showResults}
                                style={{
                                    padding: '8px 16px',
                                    border: '2px solid #28a745',
                                    borderRadius: '5px',
                                    backgroundColor: userAnswers[index] === true ? '#28a745' : 'white',
                                    color: userAnswers[index] === true ? 'white' : '#28a745',
                                    cursor: showResults ? 'default' : 'pointer'
                                }}
                            >
                                ✅ TRUE
                            </button>
                            <button 
                                onClick={() => handleAnswer(index, false)}
                                disabled={showResults}
                                style={{
                                    padding: '8px 16px',
                                    border: '2px solid #dc3545',
                                    borderRadius: '5px',
                                    backgroundColor: userAnswers[index] === false ? '#dc3545' : 'white',
                                    color: userAnswers[index] === false ? 'white' : '#dc3545',
                                    cursor: showResults ? 'default' : 'pointer'
                                }}
                            >
                                ❌ FALSE
                            </button>
                        </div>
                        
                        {showResults && (
                            <p style={{ 
                                margin: '10px 0 0 0', 
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: userAnswers[index] === statement.isTrue ? '#155724' : '#721c24'
                            }}>
                                {userAnswers[index] === statement.isTrue ? '✅ Correct!' : '❌ Incorrect'} 
                                {statement.hint && ` (Hint: ${statement.hint})`}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            
            {!showResults && (
                <button 
                    onClick={checkAnswers}
                    disabled={!allAnswered}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        border: '2px solid #007bff',
                        borderRadius: '8px',
                        backgroundColor: allAnswered ? '#007bff' : '#ccc',
                        color: 'white',
                        cursor: allAnswered ? 'pointer' : 'default'
                    }}
                >
                    Check Answers
                </button>
            )}
            
            {showResults && (
                <button 
                    onClick={() => {
                        setShowResults(false);
                        setUserAnswers(content.statements.map(() => null));
                    }}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        border: '2px solid #6f42c1',
                        borderRadius: '8px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

// Simple builder component
const TrueFalseBuilder: React.FC<ExerciseBuilderProps<any>> = ({ 
    content, 
    onChange 
}) => {
    const statements = content?.statements || [{ statement: '', isTrue: true }];

    const updateStatement = (index: number, field: keyof typeof statements[0], value: any) => {
        const newStatements = [...statements];
        newStatements[index] = { ...newStatements[index], [field]: value };
        onChange({ statements: newStatements });
    };

    const addStatement = () => {
        onChange({ 
            statements: [...statements, { statement: '', isTrue: true }] 
        });
    };

    const removeStatement = (index: number) => {
        onChange({ 
            statements: statements.filter((_, i) => i !== index) 
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>🛠️ True/False Builder</h3>
            
            {statements.map((statement, index) => (
                <div key={index} style={{ 
                    margin: '15px 0', 
                    padding: '15px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px' 
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Statement {index + 1}:
                        </label>
                        <textarea
                            value={statement.statement}
                            onChange={(e) => updateStatement(index, 'statement', e.target.value)}
                            placeholder="Enter a true or false statement..."
                            style={{ 
                                width: '100%', 
                                minHeight: '60px', 
                                padding: '8px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px' 
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontWeight: 'bold' }}>Correct Answer:</label>
                        <div>
                            <label style={{ marginRight: '20px' }}>
                                <input 
                                    type="radio" 
                                    name={`answer-${index}`}
                                    checked={statement.isTrue}
                                    onChange={() => updateStatement(index, 'isTrue', true)}
                                /> TRUE
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name={`answer-${index}`}
                                    checked={!statement.isTrue}
                                    onChange={() => updateStatement(index, 'isTrue', false)}
                                /> FALSE
                            </label>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Hint (optional):</label>
                        <input
                            type="text"
                            value={statement.hint || ''}
                            onChange={(e) => updateStatement(index, 'hint', e.target.value)}
                            placeholder="Optional hint for this statement..."
                            style={{ 
                                width: '100%', 
                                padding: '8px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px' 
                            }}
                        />
                    </div>
                    
                    {statements.length > 1 && (
                        <button 
                            onClick={() => removeStatement(index)}
                            style={{ 
                                padding: '5px 10px', 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}
            
            <button 
                onClick={addStatement}
                style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Add Statement
            </button>
        </div>
    );
};

// Parse True/False content from LanScript
// Format: "The sky is blue. TRUE" or "Fish can fly. FALSE"
function parseTrueFalseContent(lines: string[]): TrueFalseContent {
    const statements: TrueFalseContent['statements'] = [];
    
    lines.forEach(line => {
        if (isCommentLine(line)) return;
        
        const cleanLine = removeDecorators(line);
        if (!cleanLine) return;
        
        // Check if line ends with TRUE or FALSE
        const trueMatch = cleanLine.match(/^(.+)\s+(TRUE|true)$/i);
        const falseMatch = cleanLine.match(/^(.+)\s+(FALSE|false)$/i);
        
        if (trueMatch) {
            statements.push({
                statement: trueMatch[1]?.trim() || '',
                isTrue: true
            });
        } else if (falseMatch) {
            statements.push({
                statement: falseMatch[1]?.trim() || '',
                isTrue: false
            });
        }
    });
    
    return { statements };
}

// Validate True/False content
function validateTrueFalseContent(content: TrueFalseContent): ValidationResult {
    const errors: string[] = [];
    
    if (!content.statements || !Array.isArray(content.statements)) {
        errors.push(ErrorMessages.missingContent('statements'));
        return { isValid: false, errors };
    }
    
    const minError = validateMinLength(content.statements, 1, 'statement');
    if (minError) errors.push(minError);
    
    const maxError = validateMaxLength(content.statements, 20, 'statements');
    if (maxError) errors.push(maxError);
    
    content.statements.forEach((statement, index) => {
        const statementNum = index + 1;
        
        if (!statement.statement || typeof statement.statement !== 'string') {
            errors.push(`Statement ${statementNum} is missing text`);
        } else {
            const lengthError = validateStringLength(statement.statement, 1, 300, `Statement ${statementNum}`);
            if (lengthError) errors.push(lengthError);
        }
        
        if (typeof statement.isTrue !== 'boolean') {
            errors.push(`Statement ${statementNum} must have a true/false answer`);
        }
        
        if (statement.hint) {
            const hintError = validateStringLength(statement.hint, 1, 200, `Hint for statement ${statementNum}`);
            if (hintError) errors.push(hintError);
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

// Convert to LanScript format
function trueFalseToLanScript(content: TrueFalseContent): string {
    return content.statements.map(statement => {
        let line = `${statement.statement} ${statement.isTrue ? 'TRUE' : 'FALSE'}`;
        if (statement.hint) {
            line += ` @hint(${statement.hint})`;
        }
        return line;
    }).join('\n');
}

/**
 * TRUE/FALSE EXERCISE TYPE CONFIGURATION
 * This single file defines everything needed for a new exercise type!
 */
export const trueFalseExercise: ExerciseTypeConfig<any> = {
    type: 'TRUE_FALSE' as any, // Cast needed since it's not in the main enum yet
    displayName: 'True or False',
    description: 'Statements that students must identify as true or false',
    icon: 'question',
    
    // Detection: lines ending with TRUE or FALSE
    detectPattern: (lines: string[]) => {
        return lines.some(line => 
            !isCommentLine(line) && 
            /\s+(TRUE|FALSE|true|false)$/.test(line.trim())
        );
    },
    
    parseContent: parseTrueFalseContent,
    validateContent: validateTrueFalseContent,
    
    DisplayComponent: TrueFalseDisplay,
    BuilderComponent: TrueFalseBuilder,
    
    toLanScript: trueFalseToLanScript,
    
    errorMessages: {
        parseError: (error: Error) => ErrorMessages.parseError('True/False', error),
        validationError: (errors: string[]) => ErrorMessages.validationError('True/False', errors),
        displayError: (error: Error) => ErrorMessages.displayError('True/False', error)
    },
    
    exampleContent: `The Earth is round. TRUE
Fish can fly. FALSE
Water boils at 100°C. TRUE @hint(At sea level)
The sun revolves around Earth. FALSE`,
    
    version: '1.0.0'
};

/**
 * Demo function to show how easy it is to add a new exercise type
 */
export function demonstrateTrueFalseExercise() {
    console.log('🎯 Demo: Adding True/False Exercise Type');
    
    // Import the registry
    const { exerciseRegistry } = require('../exercises');
    
    // Register our new exercise type
    exerciseRegistry.register(trueFalseExercise);
    
    console.log('✅ True/False exercise type registered!');
    
    // Test detection
    const testLines = [
        "The sky is blue. TRUE",
        "Fish can swim. FALSE"
    ];
    
    const detectedType = exerciseRegistry.detectType(testLines);
    console.log('Detected type:', detectedType); // Should be TRUE_FALSE
    
    // Test parsing
    const content = exerciseRegistry.parseContent('TRUE_FALSE', testLines);
    console.log('Parsed content:', content);
    
    // Test validation
    const validation = exerciseRegistry.validateContent('TRUE_FALSE', content);
    console.log('Validation:', validation);
    
    // Test LanScript conversion
    const lanscript = exerciseRegistry.toLanScript('TRUE_FALSE', content);
    console.log('LanScript format:', lanscript);
    
    console.log('\n🎉 New exercise type working perfectly!');
    console.log('📝 All of this was defined in a single file!');
    
    return { detectedType, content, validation, lanscript };
}

// Export for testing
export type { TrueFalseContent };