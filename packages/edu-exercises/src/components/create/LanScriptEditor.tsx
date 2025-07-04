// packages/exercises/src/components/create/LanScriptEditor.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
    LanScriptParser,
    LanScriptParseResult
} from '../../parser/lanscript/parser';
import {
    CreateExercisePayload,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent
} from '@repo/api-bridge';
import { exerciseRegistry } from '../../registry/ExerciseRegistry';
import { ExercisePreview } from './ExercisePreview';

import { toast } from 'sonner';
import '../styles/lanscriptEditor.css';
import { initializeExerciseRegistry } from '../../exercises';

// Initialize the exercise registry
initializeExerciseRegistry();

// We'll register the language inside the component to ensure it happens
let languageRegistered = false;

function registerLanScriptLanguage() {
    if (languageRegistered) {
        console.log('🔧 LanScript language already registered');
        return;
    }
    
    console.log('🚀 Registering LanScript language for Monaco Editor...');
    
    // Register LanScript language
    monaco.languages.register({ id: 'lanscript' });
    console.log('✅ LanScript language registered');
    
    // Define language tokens
    monaco.languages.setMonarchTokensProvider('lanscript', {
    tokenizer: {
        root: [
            // Comments
            [/\/\/.*$/, 'comment'],

            // Metadata keys (with or without colon)
            [/^(type|difficulty|category|topic|title|instructions|explanation|tags|timed|timeLimit|theme|size|gridSize|caseSensitive|allowBackwards)(\s*:)?/i, 'keyword'],

            // Global decorators
            [/^(HINT|EXPLANATION)\s*\(/i, 'keyword.global'],

            // Line decorators
            [/@\w+\([^)]*\)/, 'decorator'],

            // Fill-in-the-blank answers
            [/\*[^*]+\*/, 'string.answer'],

            // Matching operator
            [/ = /, 'operator.match'],

            // Ordering separator
            [/ \| /, 'operator.order'],

            // Multiple choice correct answer
            [/\[[^\]]+]/, 'annotation.correct'],

            // Strings in quotes
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],

            // Numbers
            [/\d+/, 'number'],

            // Booleans
            [/\b(true|false)\b/, 'keyword.boolean'],

            // Block delimiters
            [/[{}]/, 'delimiter.bracket'],
        ]
    }
    });

    // Define language configuration
    monaco.languages.setLanguageConfiguration('lanscript', {
        comments: {
            lineComment: '//',
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: '*', close: '*' },
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: '*', close: '*' },
        ],
    });

    // Define theme
    monaco.editor.defineTheme('lanscript-theme', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
            { token: 'keyword.global', foreground: '059669', fontStyle: 'bold' },
            { token: 'decorator', foreground: '0891b2' },
            { token: 'string', foreground: 'dc2626' },
            { token: 'string.answer', foreground: 'ea580c', fontStyle: 'bold' },
            { token: 'operator.match', foreground: '7c3aed', fontStyle: 'bold' },
            { token: 'operator.order', foreground: '0891b2', fontStyle: 'bold' },
            { token: 'annotation.correct', foreground: '059669', fontStyle: 'bold' },
            { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
            { token: 'number', foreground: '0891b2' },
            { token: 'keyword.boolean', foreground: '7c3aed' },
            { token: 'delimiter.bracket', foreground: '4b5563', fontStyle: 'bold' },
        ],
        colors: {
            'editor.foreground': '#1f2937',
            'editor.background': '#ffffff',
            'editorLineNumber.foreground': '#9ca3af',
            'editorIndentGuide.background': '#e5e7eb',
            'editor.selectionBackground': '#ddd6fe',
            'editorCursor.foreground': '#7c3aed',
        }
    });
    
    console.log('✅ LanScript language configuration complete');
    languageRegistered = true;
}

// Generate hover information with registry data
const getHoverInfo = (): Record<string, { title: string; docs: string }> => {
    const registeredTypes = exerciseRegistry.getExerciseTypes();
    const metadata = exerciseRegistry.getExerciseMetadata();
    
    let typesDocs = 'Exercise type. Options:\n';
    if (metadata.length > 0) {
        typesDocs += metadata.map(m => `- \`${m.type.toLowerCase()}\` - ${m.description || m.displayName}`).join('\n');
    } else {
        typesDocs += '- `fill_blank` - Fill in the blanks\n- `matching` - Match pairs\n- `multiple_choice` - Multiple choice questions\n- `ordering` - Put words in order\n- `categorizer` - Categorize items\n- `selector` - Select items\n- `reading` - Reading comprehension\n- `conversation` - Conversation exercise\n- `puzzle` - Puzzle exercise';
    }
    
    return {
        'type': {
            title: '**type**',
            docs: typesDocs
        },
        'difficulty': {
            title: '**difficulty**',
            docs: 'Set difficulty level:\n- `BEGINNER`\n- `INTERMEDIATE`\n- `ADVANCED`'
        },
        'category': {
            title: '**category**',
            docs: 'Exercise category:\n- `GRAMMAR`\n- `VOCABULARY`\n- `READING`\n- `WRITING`\n- `SPEAKING`\n- `CONVERSATION`\n- `GENERAL`'
        },
        'title': {
            title: '**title**',
            docs: 'The exercise title shown to students'
        },
        'instructions': {
            title: '**instructions**',
            docs: 'Optional instructions for completing the exercise'
        },
        'topic': {
            title: '**topic**',
            docs: 'Topic tag for the exercise (e.g., "animals", "food")'
        },
        'theme': {
            title: '**theme** (Letter Soup)',
            docs: 'Theme for word search puzzle (e.g., "Animals", "Verbs")'
        },
        'size': {
            title: '**size** (Letter Soup)',
            docs: 'Grid size for word search (8-20)'
        },
        'gridSize': {
            title: '**gridSize** (Letter Soup)',
            docs: 'Alternative to size. Grid dimensions (8-20)'
        },
        'caseSensitive': {
            title: '**caseSensitive** (Letter Soup)',
            docs: 'Whether word search is case sensitive (true/false)'
        },
        'allowBackwards': {
            title: '**allowBackwards** (Letter Soup)',
            docs: 'Allow words to appear backwards (true/false)'
        },
        '@hint': {
            title: '**@hint()**',
            docs: 'Add a hint for this specific question.\nExample: `@hint(Think about past tense)`'
        },
        '@explanation': {
            title: '**@explanation()**',
            docs: 'Add explanation for this specific question.\nShown after the student answers.'
        },
        'hint': {
            title: '**HINT()**',
            docs: 'Global hint for the entire exercise.\nUse `@hint()` for question-specific hints.'
        },
        'explanation': {
            title: '**EXPLANATION()**',
            docs: 'Global explanation for the entire exercise.\nUse `@explanation()` for question-specific explanations.'
        }
    };
};

interface LanScriptEditorProps {
    authorEmail: string;
    onExercisesParsed: (exercises: CreateExercisePayload[]) => void;
    onSaveAll?: () => void;
    exercises?: CreateExercisePayload[];
    defaultMetadata: {
        difficulty: string;
        category: string;
        tags: string[];
    };
    initialScript?: string;
}

const defaultScript = `// Welcome to LanScript! Create exercises with simple syntax
// Click the template buttons above or start typing

{
  type fill_blank
  title Fill in the Blanks Exercise
  
  // Use *answer* or *option1|option2* for blanks
  The sun *rises* in the east.
  She *went|walked* to school yesterday.
}`;

export const LanScriptEditor: React.FC<LanScriptEditorProps> = ({
                                                                    authorEmail,
                                                                    onExercisesParsed,
                                                                    onSaveAll,
                                                                    defaultMetadata,
                                                                    initialScript
                                                                }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [parseResult, setParseResult] = useState<LanScriptParseResult | null>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const disposablesRef = useRef<monaco.IDisposable[]>([]);

    useEffect(() => {
        if (!editorRef.current) return;

        // Register the language first
        registerLanScriptLanguage();

        // Create Monaco editor
        const editor = monaco.editor.create(editorRef.current, {
            value: initialScript || defaultScript,
            language: 'lanscript',
            theme: 'lanscript-theme',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
            wrappingIndent: 'indent',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            suggest: {
                snippetsPreventQuickSuggestions: false,
                showKeywords: true,
                showSnippets: true,
            },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: true
            },
            padding: { top: 10, bottom: 10 },
            // Mobile-friendly options
            acceptSuggestionOnEnter: 'smart',
            acceptSuggestionOnCommitCharacter: true,
            tabCompletion: 'on',
            quickSuggestionsDelay: 100,
            // Better mobile editing
            glyphMargin: false,
            contextmenu: true,
            // Improved mobile paste support
            domReadOnly: false,
            readOnly: false,
        });

        monacoRef.current = editor;

        // Enhanced mobile support - better paste handling
        if (typeof window !== 'undefined' && 'ontouchstart' in window) {
            // Mobile-specific enhancements
            const editorDomNode = editor.getDomNode();
            if (editorDomNode) {
                // Add touch-friendly styles
                editorDomNode.style.touchAction = 'manipulation';
                
                // Improve paste support on mobile
                const textArea = editorDomNode.querySelector('textarea');
                if (textArea) {
                    textArea.addEventListener('paste', (e) => {
                        // Ensure paste works properly on mobile
                        e.stopPropagation();
                        setTimeout(() => {
                            // Trigger parse after paste
                            handleParse(editor.getValue());
                        }, 100);
                    });
                }
            }
        }

        // Register hover provider with better implementation
        console.log('🔧 Registering Monaco hover provider for lanscript language');
        const hoverProvider = monaco.languages.registerHoverProvider('lanscript', {
            provideHover: (model, position) => {
                console.log('🎯 Hover triggered!', { position });
                const line = model.getLineContent(position.lineNumber);
                const offset = position.column - 1; // Monaco uses 1-based columns
                const hoverInfo = getHoverInfo(); // Get dynamic hover info

                // Check for decorators first
                if (line.includes('@')) {
                    const decoratorMatch = /@(\w+)\([^)]*\)/.exec(line);
                    if (decoratorMatch) {
                        const [fullMatch, decoratorName] = decoratorMatch;
                        const decoratorStart = line.indexOf(fullMatch);
                        const decoratorEnd = decoratorStart + fullMatch.length;

                        if (offset >= decoratorStart && offset <= decoratorEnd) {
                            const info = hoverInfo[`@${decoratorName}`];
                            if (info) {
                                return {
                                    contents: [{ value: `${info.title}\n\n${info.docs}` }],
                                    range: new monaco.Range(
                                        position.lineNumber,
                                        decoratorStart + 1,
                                        position.lineNumber,
                                        decoratorEnd + 1
                                    )
                                };
                            }
                        }
                    }
                }

                // Check for keywords
                const lowerLine = line.toLowerCase();
                for (const [keyword, info] of Object.entries(hoverInfo)) {
                    if (keyword.startsWith('@')) continue; // Skip decorators

                    const keywordIndex = lowerLine.indexOf(keyword.toLowerCase());
                    if (keywordIndex !== -1) {
                        const keywordEnd = keywordIndex + keyword.length;

                        // Check if cursor is within keyword bounds
                        if (offset >= keywordIndex && offset < keywordEnd) {
                            // Make sure it's a word boundary
                            const beforeChar = keywordIndex > 0 ? lowerLine[keywordIndex - 1] : ' ';
                            const afterChar = keywordEnd < lowerLine.length ? lowerLine[keywordEnd] : ' ';

                            if (/\s/.test(beforeChar || '') && (/\s|:/.test(afterChar || ''))) {
                                return {
                                    contents: [{ value: `${info.title}\n\n${info.docs}` }],
                                    range: new monaco.Range(
                                        position.lineNumber,
                                        keywordIndex + 1,
                                        position.lineNumber,
                                        keywordEnd + 1
                                    )
                                };
                            }
                        }
                    }
                }

                // Check for syntax patterns
                if (line.includes('*') && line.lastIndexOf('*') > line.indexOf('*')) {
                    const firstStar = line.indexOf('*');
                    const lastStar = line.lastIndexOf('*');
                    if (offset >= firstStar && offset <= lastStar) {
                        return {
                            contents: [{
                                value: '**Fill-in-the-blank**\n\nUse `*answer*` for single answer\nUse `*option1|option2*` for multiple options'
                            }]
                        };
                    }
                }

                if (line.includes(' = ')) {
                    const eqIndex = line.indexOf(' = ');
                    if (offset >= eqIndex - 5 && offset <= eqIndex + 5) {
                        return {
                            contents: [{
                                value: '**Matching Pair**\n\nFormat: `Left item = Right item`\nAdd hints: `@hint(your hint)`'
                            }]
                        };
                    }
                }

                if (line.includes(' | ')) {
                    const pipeIndex = line.indexOf(' | ');
                    if (offset >= pipeIndex - 5 && offset <= pipeIndex + 5) {
                        return {
                            contents: [{
                                value: '**Word Ordering**\n\nSeparate words with ` | `\nStudents will reorder them correctly'
                            }]
                        };
                    }
                }

                return null;
            }
        });

        // Register completion provider with better context awareness
        console.log('🔧 Registering Monaco completion provider for lanscript language');
        const completionProvider = monaco.languages.registerCompletionItemProvider('lanscript', {
            triggerCharacters: ['@', ' ', '\n', '{', 't', 'd', 'c'], // Add common starting letters
            provideCompletionItems: (model, position, context) => {
                console.log('🎯 Autocomplete triggered!', { position, context, character: context.triggerCharacter });
                const line = model.getLineContent(position.lineNumber);
                const lineUntilPosition = line.substring(0, position.column - 1);
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                // Check if we're inside a block
                const openBraces = (textUntilPosition.match(/\{/g) || []).length;
                const closeBraces = (textUntilPosition.match(/\}/g) || []).length;
                const insideBlock = openBraces > closeBraces;

                const suggestions: monaco.languages.CompletionItem[] = [];

                // Decorator completions
                if (context.triggerCharacter === '@' || lineUntilPosition.endsWith('@')) {
                    return {
                        suggestions: [
                            {
                                label: '@hint',
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: '@hint(${1:hint text})',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add hint for this question',
                                range: monaco.Range.fromPositions(position)
                            },
                            {
                                label: '@explanation',
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: '@explanation(${1:explanation text})',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add explanation for this question',
                                range: monaco.Range.fromPositions(position)
                            }
                        ]
                    };
                }

                // Block start
                if (context.triggerCharacter === '{' || (!insideBlock && lineUntilPosition.trim() === '')) {
                    suggestions.push({
                        label: 'exercise-block',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: `{
  type \${1|fill_blank,matching,multiple_choice,ordering|}
  title \${2:Exercise Title}
  difficulty \${3|BEGINNER,INTERMEDIATE,ADVANCED|}
  
  \${4:// Your exercise content here}
}`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create new exercise block',
                        range: monaco.Range.fromPositions(position)
                    });
                }

                // Metadata completions (only at start of line inside block)
                if (insideBlock && /^\s*$/.test(lineUntilPosition)) {
                    // Get registered exercise types from registry
                    const registeredTypes = exerciseRegistry.getExerciseTypes();
                    console.log('🎯 Registry types available:', registeredTypes);
                    const typeOptions = registeredTypes.length > 0 
                        ? registeredTypes.map(type => type.toLowerCase()).join(',')
                        : 'fill_blank,matching,multiple_choice,ordering';
                    console.log('🎯 Type options for autocomplete:', typeOptions);
                        
                    // Type
                    suggestions.push({
                        label: 'type',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: `type \${1|${typeOptions}|}`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Set exercise type (from registry)',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Title
                    suggestions.push({
                        label: 'title',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'title ${1:Exercise Title}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Set exercise title',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Difficulty
                    suggestions.push({
                        label: 'difficulty',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'difficulty ${1|BEGINNER,INTERMEDIATE,ADVANCED|}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Set difficulty level',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Category
                    suggestions.push({
                        label: 'category',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'category ${1|GENERAL,GRAMMAR,VOCABULARY,READING,WRITING,SPEAKING,CONVERSATION|}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Set exercise category',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Instructions
                    suggestions.push({
                        label: 'instructions',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'instructions ${1:Instructions for students}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Add instructions',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Letter Soup specific
                    suggestions.push({
                        label: 'theme',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'theme ${1:Animals}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Set theme for letter soup',
                        range: monaco.Range.fromPositions(position)
                    });

                    suggestions.push({
                        label: 'size',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'size ${1:10}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Grid size (8-20)',
                        range: monaco.Range.fromPositions(position)
                    });

                    // Global decorators
                    suggestions.push({
                        label: 'HINT',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'HINT(${1:global hint text})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Add global hint for entire exercise',
                        range: monaco.Range.fromPositions(position)
                    });

                    suggestions.push({
                        label: 'EXPLANATION',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'EXPLANATION(${1:global explanation text})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Add global explanation',
                        range: monaco.Range.fromPositions(position)
                    });
                }

                // Content helpers based on detected type
                const typeMatch = textUntilPosition.match(/type\s+(\w+)/i);
                if (typeMatch && insideBlock && lineUntilPosition.trim() === '') {
                    if (!typeMatch[1]) return;
                    const exerciseType = typeMatch[1].toLowerCase();

                    switch (exerciseType) {
                        case 'fill_blank':
                            suggestions.push({
                                label: 'blank-sentence',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: 'The ${1:word} *${2:answer}* ${3:rest of sentence}.',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add fill-in-the-blank sentence',
                                range: monaco.Range.fromPositions(position)
                            });
                            break;
                        case 'matching':
                            suggestions.push({
                                label: 'match-pair',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: '${1:Left item} = ${2:Right item}',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add matching pair',
                                range: monaco.Range.fromPositions(position)
                            });
                            break;
                        case 'multiple_choice':
                            suggestions.push({
                                label: 'mc-question',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: '${1:Question}? = ${2:Option1} | ${3:Option2} | ${4:Option3} [${5:Option1}]',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add multiple choice question',
                                range: monaco.Range.fromPositions(position)
                            });
                            break;
                        case 'ordering':
                            suggestions.push({
                                label: 'order-sentence',
                                kind: monaco.languages.CompletionItemKind.Snippet,
                                insertText: '${1:Word1} | ${2:Word2} | ${3:Word3} | ${4:Word4}',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Add ordering sentence',
                                range: monaco.Range.fromPositions(position)
                            });
                            break;
                    }
                }

                return { suggestions };
            }
        });

        // Store disposables
        disposablesRef.current = [hoverProvider, completionProvider];

        // Parse on change with debounce
        let parseTimeout: NodeJS.Timeout;
        const contentChangeDisposable = editor.onDidChangeModelContent(() => {
            clearTimeout(parseTimeout);
            parseTimeout = setTimeout(() => {
                handleParse(editor.getValue());
            }, 300);
        });
        disposablesRef.current.push(contentChangeDisposable);
        handleParse(initialScript || defaultScript);

        return () => {
            clearTimeout(parseTimeout);
            disposablesRef.current.forEach(d => d.dispose());
            editor.dispose();
        };
    }, []);

    // Update editor content when initialScript changes
    useEffect(() => {
        if (monacoRef.current && initialScript !== undefined) {
            monacoRef.current.setValue(initialScript);
        }
    }, [initialScript]);

    const validateExercises = (exercises: CreateExercisePayload[]): string[] => {
        const errors: string[] = [];
        const maxAllowed = initialScript ? 1 : 3;

        if (exercises.length > maxAllowed) {
            errors.push(`Maximum ${maxAllowed} exercise${maxAllowed === 1 ? '' : 's'} allowed. Found ${exercises.length}.`);
        }

        exercises.forEach((exercise, index) => {
            const exerciseNum = index + 1;

            switch (exercise.type) {
                case 'FILL_BLANK': {
                    const content = exercise.content as FillBlankContent;
                    if (content.sentences.length < 2) {
                        errors.push(`Exercise ${exerciseNum}: Fill-blank needs at least 2 sentences`);
                    }
                    break;
                }
                case 'MATCHING': {
                    const content = exercise.content as MatchingContent;
                    if (content.pairs.length < 3) {
                        errors.push(`Exercise ${exerciseNum}: Matching needs at least 3 pairs`);
                    }
                    break;
                }
                case 'MULTIPLE_CHOICE': {
                    const content = exercise.content as MultipleChoiceContent;
                    if (content.questions.length < 2) {
                        errors.push(`Exercise ${exerciseNum}: Multiple choice needs at least 2 questions`);
                    }
                    break;
                }
                case 'ORDERING': {
                    const content = exercise.content as OrderingContent;
                    if (content.sentences.length < 2) {
                        errors.push(`Exercise ${exerciseNum}: Ordering needs at least 2 sentences`);
                    }
                    break;
                }
            }

            // Check duplicate titles
            const duplicates = exercises.filter(e => e.title === exercise.title).length > 1;
            if (duplicates && exercises.indexOf(exercise) === exercises.findIndex(e => e.title === exercise.title)) {
                errors.push(`Duplicate title: "${exercise.title}"`);
            }
        });

        return errors;
    };

    const handleParse = (script: string) => {
        const parser = new LanScriptParser();
        const maxBlocks = initialScript ? 1 : 3;
        const result = parser.parse(script, authorEmail);

        if (result.errors.length === 0 && result.exercises.length > 0) {
            const validationErrs = validateExercises(result.exercises);
            if (validationErrs.length > 0) {
                setParseResult({
                    exercises: result.exercises,
                    errors: [...result.errors, ...validationErrs]
                });
                setValidationErrors(validationErrs);
            } else {
                setParseResult(result);
                setValidationErrors([]);
                onExercisesParsed(result.exercises);
            }
        } else {
            setParseResult(result);
            setValidationErrors([]);
        }

        // Update error markers
        if (monacoRef.current) {
            const model = monacoRef.current.getModel();
            if (model) {
                if (result.errors.length > 0) {
                    const markers: monaco.editor.IMarkerData[] = result.errors.map((error) => ({
                        severity: monaco.MarkerSeverity.Error,
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1000,
                        message: error,
                    }));
                    monaco.editor.setModelMarkers(model, 'lanscript', markers);
                } else {
                    monaco.editor.setModelMarkers(model, 'lanscript', []);
                }
            }
        }
    };

    const handleSaveAll = async () => {
        if (parseResult?.errors.length === 0 && parseResult.exercises.length > 0 && onSaveAll) {
            setSaving(true);
            try {
                await onSaveAll();
                if (monacoRef.current) {
                    monacoRef.current.setValue('');
                }
            } finally {
                setSaving(false);
            }
        } else {
            toast.error('Please fix errors before saving');
        }
    };

    const insertTemplate = (type: string) => {
        if (!monacoRef.current) return;

        // Get registry metadata for better templates
        const metadata = exerciseRegistry.getExerciseMetadata();
        const exerciseConfig = metadata.find(m => m.type.toLowerCase() === type.replace(/([A-Z])/g, '_$1').toLowerCase());
        
        const templates: Record<string, string> = {
            fillBlank: `{
  type fill_blank
  title Fill in the Blanks
  difficulty ${defaultMetadata.difficulty}
  category ${defaultMetadata.category}
  
  // Use *word* for blanks, *option1|option2* for multiple answers
  The cat *sits* on the mat.
  She *went|walked* to school yesterday. @hint(past tense)
  They *are playing|play* football now.
}`,
            matching: `{
  type matching
  title Match the Pairs
  difficulty ${defaultMetadata.difficulty}
  category ${defaultMetadata.category}
  
  // Format: Left = Right
  Apple = Fruit @hint(grows on trees)
  Car = Vehicle
  Rose = Flower
  Blue = Color
  Paris = City
}`,
            multipleChoice: `{
  type multiple_choice
  title Choose the Correct Answer
  difficulty ${defaultMetadata.difficulty}
  category ${defaultMetadata.category}
  
  // Format: Question = Option1 | Option2 | Option3 [correct]
  What color is the sky? = Red | Blue | Green | Yellow [Blue]
  Which are mammals? = Dog | Fish | Cat | Bird [Dog,Cat] @explanation(Mammals feed milk to their young)
  What is 2+2? = 3 | 4 | 5 | 6 [4]
}`,
            ordering: `{
  type ordering
  title Put the Words in Order
  difficulty ${defaultMetadata.difficulty}
  category ${defaultMetadata.category}
  
  // Separate words with |
  I | like | to | read | books
  The | quick | brown | fox | jumps
  She | is | studying | English | grammar @hint(present continuous)
}`
        };

        const position = monacoRef.current.getPosition();
        if (position) {
            monacoRef.current.executeEdits('', [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: '\n\n' + templates[type] + '\n',
                forceMoveMarkers: true
            }]);
        }
    };

    return (
        <div className="lanscript-editor-container">
            <div className="lanscript-toolbar">
                <div className="lanscript-toolbar-left">
                    <button onClick={() => insertTemplate('fillBlank')} title="Insert Fill-in-the-blank template">
                        <i className="fas fa-pen-to-square"></i>
                        <span>Fill Blank</span>
                    </button>
                    <button onClick={() => insertTemplate('matching')} title="Insert Matching template">
                        <i className="fas fa-link"></i>
                        <span>Matching</span>
                    </button>
                    <button onClick={() => insertTemplate('multipleChoice')} title="Insert Multiple Choice template">
                        <i className="fas fa-list-check"></i>
                        <span>Multiple Choice</span>
                    </button>
                    <button onClick={() => insertTemplate('ordering')} title="Insert Ordering template">
                        <i className="fas fa-arrows-up-down"></i>
                        <span>Ordering</span>
                    </button>
                    <div className="toolbar-separator"></div>
                    <button onClick={() => setShowPreview(!showPreview)} className={showPreview ? 'active' : ''}>
                        <i className="fas fa-eye"></i>
                        <span>Preview</span>
                    </button>
                    <div className="toolbar-separator"></div>
                    <span className="toolbar-hint">
                        <i className="fas fa-info-circle"></i>
                        {initialScript ? 'Edit mode: 1 exercise' : 'Max 3 exercises'}
                    </span>
                </div>
                <div className="lanscript-toolbar-right">
                    {parseResult && (
                        <span className={`parse-status ${parseResult.errors.length === 0 && validationErrors.length === 0 ? 'success' : 'error'}`}>
                            {parseResult.errors.length === 0 && validationErrors.length === 0
                                ? `✓ ${parseResult.exercises?.length || 0} ready`
                                : `✗ ${parseResult.errors.length + validationErrors.length} errors`
                            }
                        </span>
                    )}
                    <button
                        className="save-button"
                        onClick={handleSaveAll}
                        disabled={parseResult?.errors.length !== 0 || validationErrors.length > 0 || saving}
                    >
                        {saving ? (
                            <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                        ) : (
                            <><i className="fas fa-save"></i> Save All</>
                        )}
                    </button>
                </div>
            </div>

            <div className="lanscript-content">
                <div className="lanscript-editor-wrapper">
                    <div ref={editorRef} className="lanscript-monaco-editor" />
                </div>

                {showPreview && (
                    <div className="lanscript-preview">
                        <h3>Preview</h3>
                        {parseResult?.errors.length === 0 && parseResult.exercises.length > 0 && validationErrors.length === 0 ? (
                            <div className="preview-exercises">
                                {parseResult.exercises.map((exercise, index) => (
                                    <ExercisePreview key={index} exercise={exercise} />
                                ))}
                            </div>
                        ) : parseResult?.errors || validationErrors.length > 0 ? (
                            <div className="preview-errors">
                                <h4>Errors:</h4>
                                <ul>
                                    {parseResult?.errors?.map((error, index) => (
                                        <li key={`parse-${index}`}>{error}</li>
                                    ))}
                                    {validationErrors.map((error, index) => (
                                        <li key={`validation-${index}`}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="preview-empty">
                                <p>Start typing to see preview...</p>
                                <div className="preview-tips">
                                    <h4>Quick Tips:</h4>
                                    <ul>
                                        <li>Use <code>*word*</code> for fill-in-the-blank</li>
                                        <li>Use <code>=</code> for matching pairs</li>
                                        <li>Use <code>|</code> to separate words for ordering</li>
                                        <li>Add <code>@hint(text)</code> for question hints</li>
                                        <li>Use <code>HINT(text)</code> for global hints</li>
                                        <li>Type <code>@</code> for decorator suggestions</li>
                                        <li>Start a new line in a block for metadata suggestions</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};