// packages/edu-exercises/src/components/create/EduScriptEditor.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, LanguageSupport, StreamLanguage } from '@codemirror/language';
import { autocompletion, completionKeymap, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { lintGutter, linter, Diagnostic } from '@codemirror/lint';
import { searchKeymap } from '@codemirror/search';
import { bracketMatching, foldGutter } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

import {
    EduScriptParser,
    EduScriptParseResult
} from '../../parser/eduscript';
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
import '../styles/eduScriptEditor.css';
import { initializeExerciseRegistry } from '../../exercises';

// Initialize the exercise registry
initializeExerciseRegistry();

// EduScript language definition for CodeMirror 6
const eduScriptLanguage = StreamLanguage.define({
    name: 'eduscript',
    
    token: (stream, state) => {
        // Skip whitespace
        if (stream.eatSpace()) return null;
        
        // Comments
        if (stream.match('//')) {
            stream.skipToEnd();
            return 'comment';
        }
        
        // Block delimiters
        if (stream.eat('{') || stream.eat('}')) {
            return 'bracket';
        }
        
        // Metadata keywords
        if (stream.match(/^(type|difficulty|category|topic|title|instructions|explanation|tags|timed|timeLimit|theme|size|gridSize|caseSensitive|allowBackwards|variation|limit|shuffle|style|time)(\s*[:=]?)/i)) {
            return 'keyword';
        }
        
        // Global decorators
        if (stream.match(/^(HINT|EXPLANATION|CONFIG|METADATA)\s*\(/i)) {
            return 'keyword.global';
        }
        
        // Line decorators
        if (stream.match(/@\w+\([^)]*\)/)) {
            return 'decorator';
        }
        
        // Fill-in-the-blank answers
        if (stream.match(/\*[^*]+\*/)) {
            return 'string.answer';
        }
        
        // Matching operator
        if (stream.match(' = ')) {
            return 'operator.match';
        }
        
        // Ordering separator
        if (stream.match(' | ')) {
            return 'operator.order';
        }
        
        // Multiple choice correct answer
        if (stream.match(/\[[^\]]+]/)) {
            return 'annotation.correct';
        }
        
        // Selector brackets
        if (stream.match(/\[[^\]]+\]/)) {
            return 'string.selection';
        }
        
        // Strings in quotes
        if (stream.match(/"[^"]*"/)) {
            return 'string';
        }
        if (stream.match(/'[^']*'/)) {
            return 'string';
        }
        
        // Numbers
        if (stream.match(/\d+/)) {
            return 'number';
        }
        
        // Booleans
        if (stream.match(/\b(true|false)\b/)) {
            return 'keyword.boolean';
        }
        
        // Default: consume one character
        stream.next();
        return null;
    }
});

// Comprehensive template system
interface TemplateCategory {
    name: string;
    icon: string;
    templates: Template[];
}

interface Template {
    name: string;
    description: string;
    content: string;
}

// Create templates from EduScript showcase and registry
const createTemplates = (defaultMetadata: any): TemplateCategory[] => {
    const registeredTypes = exerciseRegistry.getExerciseTypes();
    const exerciseMetadata = exerciseRegistry.getExerciseMetadata();
    
    const categories: TemplateCategory[] = [
        {
            name: 'Exercise Types',
            icon: 'fas fa-dumbbell',
            templates: []
        },
        {
            name: 'Exercise Variations',
            icon: 'fas fa-layer-group',
            templates: []
        },
        {
            name: 'Metadata & Config',
            icon: 'fas fa-cog',
            templates: []
        },
        {
            name: 'Quick Snippets',
            icon: 'fas fa-bolt',
            templates: []
        }
    ];

    // Exercise Types Templates
    categories[0].templates = [
        {
            name: 'Fill Blank - Original',
            description: 'Basic fill-in-the-blank exercise',
            content: `{
  @metadata(
    type = fill blank
    title = Fill in the Blanks Exercise
    instructions = Complete the sentences with the correct words
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
  )

  She *is* my *little|younger* sister.
  We *are not* your friends.              @ins(negative be)
  *When* was the party?                   @ins(WH word for time)
  Sometimes you *are* a good friend.
}`
        },
        {
            name: 'Fill Blank - Single',
            description: 'Single word fill-in exercises',
            content: `{
  @metadata(
    type = fill blank
    title = Complete the Words
    instructions = Fill in the missing letters
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = single
    limit = 10
  )

  T[r]ans[for]mati[o]n   // T _ ans _ _ _  mati _ n
  W[a]te[rme]lon

  // Using helper functions
  [Baseball Player]        @ins(Write the profession of a person who plays baseball)
  [Singer]                 @ins(Write the main profession of Michael Jackson)
}`
        },
        {
            name: 'Fill Blank - Matches',
            description: 'Antonym/synonym matching fills',
            content: `{
  @metadata(
    type = fill blank
    title = Write Antonyms
    instructions = Write the antonym of each word
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = matches
    limit = 6
    shuffle = true
  )

  // Global hint using function calls
  @HINT(@length(@blank))

  happy           = *sad*
  funny           = *boring*
  clean           = *dirty*
  *popular*       = unpopular
  *big|large*     = small
}`
        },
        {
            name: 'Matching - Original',
            description: 'Basic matching pairs exercise',
            content: `{
  @metadata(
    type = match
    title = Match Fruits with Colors
    instructions = Match the fruits with their colors
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    time = 120
  )

  @fill('red_fruit')       = red        @hint(What color is the most famous apple?)

  banana                   = yellow
  watermelon               = green      @hint(We are not talking about the meat!)
  coconut                  = white      @ins(MEAT)

  // Extra matches for difficulty
  = @fill('colors', 2)
}`
        },
        {
            name: 'Matching - Threesome',
            description: 'Three-way matching exercise',
            content: `{
  @metadata(
    type = match
    title = Subject-Verb-Object Match
    instructions = Match subjects with verbs and objects
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = threesome
  )

  I    = am  = a student
  She  = is  = a nurse
  We   = are = doctors
  They = are = baseball players @ins(third person!)
}`
        },
        {
            name: 'Multiple Choice - Original',
            description: 'Standard multiple choice questions',
            content: `{
  @metadata(
    type = multiple choice
    title = Daily Routines
    instructions = Select the correct daily routine
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    limit = 10
  )

  The last activity we do in the day = take a shower   | eat dinner | [go to bed]       | speak English
  When eat in the morning            = do exercise     | have lunch | [have breakfast]
  Taking your pet for some fresh air  = listen to music | study      | walk the dog      | do the dishes

  // Using functions for dynamic options
  Getting up in the yellow bus       = @fill('daily routines', 3) | [going to school]
  Washing those things you ate on    = @fill('daily routines', 3) | [do the dishes]
}`
        },
        {
            name: 'Multiple Choice - Cards',
            description: 'Card-style multiple choice with images',
            content: `{
  @metadata(
    type = multiple choice
    title = Select the Country
    instructions = Choose the correct country
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    style = cards
    limit = 10
  )

  // Using variables for dynamic content
  @var cities = @fill('cities', 2)
  @var question = @fill('cities', 2) | @fill('neighborhoods', 1) | [@fill('countries', 1)]

  [Dom. Rep] | New York City | Lima | Shibuya

  [Japan]  | @fill('cities', 3)
  [Russia] | @fill('neighborhoods', 2)  | Buenos Aires

  // Flexible answer positioning
  @fill('geographic_locations', 2) | [Egypt] | @fill('cities', 2)
}`
        },
        {
            name: 'Multiple Choice - Matches',
            description: 'Multiple choice with matching format',
            content: `{
  @metadata(
    type = multiple choice
    title = Match Grammar Tenses
    instructions = Match each sentence with its correct tense
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = matches
    limit = 10
  )

  Present Simple     = She does not usually go to the gym
  Past Simple        = Our family went to the USA last summer
  Future Simple      = I will think about your idea
  Present Continuous = Who is thinking what I am thinking?    @idea(This is a nice phrase!)

  // Extra answers for difficulty
  = I have been here for a long time!
  = We will have graduated by the time you come back...
}`
        },
        {
            name: 'Multiple Choice - True/False',
            description: 'True or false statements',
            content: `{
  @metadata(
    type = multiple choice
    title = True or False
    instructions = Decide if each statement is true or false
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = true-false
    limit = 10
  )

  The Earth is round (true)
  Cats are reptiles (false)
  Water boils at 100°C (true)
  The sun rises in the west (false)
  Spain is in Europe (true)
}`
        },
        {
            name: 'Ordering - Original',
            description: 'Put words in correct order',
            content: `{
  @metadata(
    type = ordering
    title = Sentence Order
    instructions = Put the words in the correct order
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
  )

  We    | can  | be  | good | friends
  This  | city | is  | wonderful!
  Where | is   | the | park?
}`
        },
        {
            name: 'Ordering - Single',
            description: 'Order single items',
            content: `{
  @metadata(
    type = ordering
    title = Order Places
    instructions = Put these places in alphabetical order
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = single
  )

  Cinema
  Restaurant
  Beach

  // Or using functions
  @fill('city places', 5)
}`
        },
        {
            name: 'Ordering - Aligner',
            description: 'Sequence of events ordering',
            content: `{
  @metadata(
    type = ordering
    title = Story Sequence
    instructions = Order the events from earliest to last
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = aligner
  )

  You open the fridge
  You take a carton of milk and open it
  You pour some milk in a glass
  The glass falls and spills on the floor
  You sweep the mess
  You pour some milk again in another glass
  You drink the milk
}`
        },
        {
            name: 'Categorize - Original',
            description: 'Basic categorization exercise',
            content: `{
  @metadata(
    type = categorize
    title = Countries by Continent
    instructions = Categorize the countries with their continents
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    style = corners
  )

  ASIA         = @fill('asian countries', 5)
  EUROPE       = UK | France | Ukraine | Germany | Italy
  THE AMERICAS = @fill('american countries', 5)
  AFRICA       = @fill('african countries', 5)
}`
        },
        {
            name: 'Categorize - Ordering',
            description: 'Categorize and reorder items',
            content: `{
  @metadata(
    type = categorize
    title = Clothing by Context
    instructions = Categorize clothing items by when you wear them
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = ordering
  )

  COLD   = Coat     | Scarf      | Gloves | Boots      | Hat
  HOT    = Sandals  | Flip Flops  | Shorts | Sunglasses | T-shirt
  FORMAL = Suit     | Tie | Watch | Blazer | Shoes
}`
        },
        {
            name: 'Categorize - Lake',
            description: 'Select all correct items',
            content: `{
  @metadata(
    type = categorize
    title = Select Planets
    instructions = Select all the planets
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = lake
  )

  // "=" indicates correct answers
  = @fill('planets', 5)

  @fill('stars', 5)
  @fill('asteroids', 5)
}`
        },
        {
            name: 'Selector - On Text',
            description: 'Select specific words in text',
            content: `{
  @metadata(
    type = selector
    title = Grammar Errors
    instructions = Select all grammatical errors
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    time = 75
  )

  I [is] a baseball player
  The family will be here [yesterday]
  She is [more smart] than her
}`
        },
        {
            name: 'Selector - Complex Text',
            description: 'Advanced text selection with instructions',
            content: `{
  @metadata(
    type = selector
    title = Verb Identification
    instructions = Select following instructions
    difficulty = ${defaultMetadata.difficulty}
  )

  @config(
    variation = original
    time = 75
  )

  I [was] not thinking you [were] going to do something like that. I am surely amazed \\
  by the amount of things you [did]. @ins(Select All Past Tense Verbs)

  Yesterday, some of my relatives [visited] a place where it [was] impossible to get access before. \\
  authorities [considered] that it [was] already suitable for local visitors so they [opened] it. @ins(Select All Past Tense Verbs)

  When are we [going] to [play] basketball? I have [been] [watching] tiktok all day, I [need] to do something \\
  different than just [procrastinating]. @ins(Select All Verbs)
}`
        }
    ];

    // Metadata & Config Templates
    categories[2].templates = [
        {
            name: 'Full Metadata Block',
            description: 'Complete metadata structure',
            content: `@metadata(
  type = fill blank
  title = Exercise Title
  instructions = Complete instructions for students
  difficulty = ${defaultMetadata.difficulty}
  category = ${defaultMetadata.category}
  topic = topic_name
  tags = ["tag1", "tag2", "tag3"]
  explanation = Optional explanation shown after completion
)`
        },
        {
            name: 'Config Block - Basic',
            description: 'Basic configuration options',
            content: `@config(
  variation = original
  limit = 10
  shuffle = true
  time = 120
)`
        },
        {
            name: 'Config Block - Advanced',
            description: 'Advanced configuration with styling',
            content: `@config(
  variation = original
  style = cards
  limit = 15
  shuffle = true
  time = 180
  caseSensitive = false
  allowBackwards = true
  gridSize = 12
)`
        },
        {
            name: 'Global Hints & Explanations',
            description: 'Global decorators for entire exercise',
            content: `// Global hint for the entire exercise
HINT(This appears as a hint for all questions)

// Global explanation shown after completion
EXPLANATION(This explains the concept being practiced)

// Alternative syntax
@global_hint(Appears at the top of the exercise)
@global_explanation(Shown when exercise is completed)`
        }
    ];

    // Quick Snippets
    categories[3].templates = [
        {
            name: 'Fill Blank Syntax',
            description: 'Quick fill-in-the-blank patterns',
            content: `// Single answer
The cat *sits* on the mat.

// Multiple options
She *went|walked* to school.

// With hints
They *are playing* football now. @hint(present continuous)

// With explanations
I *have been* here for hours. @explanation(present perfect continuous)`
        },
        {
            name: 'Matching Syntax',
            description: 'Quick matching patterns',
            content: `// Basic matching
Apple = Fruit
Car = Vehicle

// With hints
Rose = Flower @hint(grows in gardens)
Blue = Color @explanation(primary color)

// Function calls
@fill('animals') = @fill('habitats')`
        },
        {
            name: 'Multiple Choice Syntax',
            description: 'Quick multiple choice patterns',
            content: `// Standard format
What color is the sky? = Red | Blue | Green | Yellow [Blue]

// Alternative format (answer first)
What is the capital? = [Paris] | London | Madrid | Rome

// Multiple correct answers
Which are mammals? = Dog | Fish | Cat | Bird [Dog,Cat]

// True/False format
The Earth is round (true)
Cats are dogs (false)

// Matching format
Apple = Fruit
Car = Vehicle

// With decorators
What is 2+2? = 3 | 4 | 5 | 6 [4] @explanation(Basic addition)`
        },
        {
            name: 'Ordering Syntax',
            description: 'Quick ordering patterns',
            content: `// Word ordering
I | like | to | read | books

// With hints
The | quick | brown | fox | jumps @hint(famous sentence)

// Function calls
@fill('sequence_words', 5)`
        },
        {
            name: 'Decorators Reference',
            description: 'All available decorators',
            content: `// Hints and explanations
@hint(helpful hint text)
@explanation(detailed explanation)
@idea(broader concept explanation)

// Instructions (per question)
@ins(specific instructions for this question)

// Global decorators
HINT(global hint for entire exercise)
EXPLANATION(global explanation)

// Function calls
@fill('category', amount)
@fill('category', amount, difficulty)
@randomize(content, type)

// Variables (experimental)
@var variable_name = @fill('category', 3)
@var(variable_name)

// Images
@image(URL)
@img(URL)`
        },
        {
            name: 'Function Calls',
            description: 'Dynamic content generation',
            content: `// Fill functions
@fill('animals', 5)          // 5 random animals
@fill('colors', 3, beginner) // 3 beginner-level colors

// Randomization
@randomize(word_list, blank_type)
@randomize(@fill('fruits', 5), singleBlank)

// Variables
@var animals = @fill('animals', 3)
@var question = @fill('cities', 2) | [@fill('countries', 1)]

// Using variables
@var(animals)
@var(question)`
        }
    ];

    return categories;
};

// EduScript completion provider
const eduScriptCompletions = (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const line = context.state.doc.lineAt(context.pos);
    const lineText = line.text;
    const beforeCursor = lineText.slice(0, context.pos - line.from);

    // Check if we're in a metadata or config block
    const textBefore = context.state.doc.sliceString(0, context.pos);
    const inMetadata = /@metadata\s*\(/i.test(textBefore) && !textBefore.includes(')');
    const inConfig = /@config\s*\(/i.test(textBefore) && !textBefore.includes(')');
    const inBlock = (textBefore.match(/\{/g) || []).length > (textBefore.match(/\}/g) || []).length;

    const options: any[] = [];

    // Metadata completions
    if (inMetadata || (inBlock && beforeCursor.trim() === '')) {
        options.push(
            { label: 'type', type: 'keyword', info: 'Exercise type' },
            { label: 'title', type: 'keyword', info: 'Exercise title' },
            { label: 'instructions', type: 'keyword', info: 'Student instructions' },
            { label: 'difficulty', type: 'keyword', info: 'Difficulty level' },
            { label: 'category', type: 'keyword', info: 'Exercise category' },
            { label: 'topic', type: 'keyword', info: 'Topic tag' },
            { label: 'explanation', type: 'keyword', info: 'Exercise explanation' },
            { label: 'tags', type: 'keyword', info: 'Exercise tags' }
        );
    }

    // Config completions
    if (inConfig) {
        options.push(
            { label: 'variation', type: 'keyword', info: 'Exercise variation' },
            { label: 'limit', type: 'keyword', info: 'Question limit' },
            { label: 'shuffle', type: 'keyword', info: 'Shuffle questions' },
            { label: 'time', type: 'keyword', info: 'Time limit in seconds' },
            { label: 'style', type: 'keyword', info: 'Display style' }
        );
    }

    // Exercise types from registry
    if (beforeCursor.includes('type =') || beforeCursor.includes('type=')) {
        const registeredTypes = exerciseRegistry.getExerciseTypes();
        registeredTypes.forEach(type => {
            options.push({
                label: type.toLowerCase().replace('_', ' '),
                type: 'constant',
                info: `${type} exercise type`
            });
        });
    }

    // Decorators
    if (beforeCursor.endsWith('@') || context.explicit) {
        options.push(
            { label: '@hint', type: 'function', info: 'Add hint for this question' },
            { label: '@explanation', type: 'function', info: 'Add explanation' },
            { label: '@ins', type: 'function', info: 'Add instructions' },
            { label: '@idea', type: 'function', info: 'Add concept explanation' },
            { label: '@fill', type: 'function', info: 'Fill with dynamic content' },
            { label: '@randomize', type: 'function', info: 'Randomize content' },
            { label: '@var', type: 'function', info: 'Define variable' },
            { label: '@image', type: 'function', info: 'Add image' },
            { label: '@metadata', type: 'function', info: 'Exercise metadata block' },
            { label: '@config', type: 'function', info: 'Configuration block' }
        );
    }

    // Global decorators
    if (inBlock && beforeCursor.trim() === '') {
        options.push(
            { label: 'HINT', type: 'function', info: 'Global hint for entire exercise' },
            { label: 'EXPLANATION', type: 'function', info: 'Global explanation' }
        );
    }

    return {
        from: word.from,
        options
    };
};

// EduScript linter
const eduScriptLinter = (parseFunction: (text: string) => EduScriptParseResult) => {
    return linter(view => {
        const diagnostics: Diagnostic[] = [];
        const doc = view.state.doc;
        const result = parseFunction(doc.toString());

        result.errors.forEach(error => {
            diagnostics.push({
                from: 0,
                to: doc.length,
                severity: 'error',
                message: error
            });
        });

        return diagnostics;
    });
};

interface EduScriptEditorProps {
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

const defaultScript = `// Welcome to EduScript! Create exercises with simple, powerful syntax
// Click the template buttons below or start typing

{
  @metadata(
    type = fill blank
    title = Fill in the Blanks Exercise
    instructions = Complete the sentences with the correct words
    difficulty = BEGINNER
  )
  
  // Use *answer* or *option1|option2* for blanks
  The sun *rises* in the east.
  She *went|walked* to school yesterday. @hint(past tense)
}`;

export const EduScriptEditor: React.FC<EduScriptEditorProps> = ({
    authorEmail,
    onExercisesParsed,
    onSaveAll,
    defaultMetadata,
    initialScript
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [parseResult, setParseResult] = useState<EduScriptParseResult | null>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');

    const templates = useMemo(() => createTemplates(defaultMetadata), [defaultMetadata]);

    // Move validateExercises before handleParse to avoid hoisting issues
    const validateExercises = useCallback((exercises: CreateExercisePayload[]): string[] => {
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
                    const validation = exerciseRegistry.validateContent('MULTIPLE_CHOICE', content);
                    if (!validation.isValid) {
                        validation.errors.forEach(error => {
                            errors.push(`Exercise ${exerciseNum}: ${error}`);
                        });
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
    }, [initialScript]);

    const handleParse = useCallback((script: string) => {
        const parser = new EduScriptParser();
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
    }, [authorEmail, onExercisesParsed, validateExercises]);

    useEffect(() => {
        if (!editorRef.current || typeof window === 'undefined') return;

        const extensions: Extension[] = [
            // Basic setup
            lineNumbers(),
            highlightActiveLine(),
            foldGutter(),
            bracketMatching(),
            
            // Language support
            new LanguageSupport(eduScriptLanguage),
            syntaxHighlighting(defaultHighlightStyle),
            
            // Autocompletion
            autocompletion({
                override: [eduScriptCompletions],
                closeOnBlur: false,
                activateOnTyping: true
            }),
            
            // Linting
            lintGutter(),
            eduScriptLinter(text => {
                const parser = new EduScriptParser();
                return parser.parse(text, authorEmail);
            }),
            
            // Keymaps
            keymap.of([
                ...defaultKeymap,
                ...completionKeymap,
                ...searchKeymap,
                indentWithTab
            ]),
            
            // Update listener
            EditorView.updateListener.of(update => {
                if (update.docChanged) {
                    const script = update.state.doc.toString();
                    handleParse(script);
                }
            }),
            
            // Theme
            EditorView.theme({
                '&': {
                    fontSize: '14px',
                    fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace'
                },
                '.cm-content': {
                    padding: '16px',
                    minHeight: '400px'
                },
                '.cm-focused': {
                    outline: 'none'
                },
                '.cm-editor': {
                    borderRadius: '8px'
                },
                '.cm-scroller': {
                    overflow: 'auto'
                },
                '.cm-line': {
                    padding: '2px 0'
                },
                // Syntax highlighting
                '.tok-keyword': {
                    color: '#7c3aed',
                    fontWeight: 'bold'
                },
                '.tok-keyword.global': {
                    color: '#059669',
                    fontWeight: 'bold'
                },
                '.tok-decorator': {
                    color: '#0891b2'
                },
                '.tok-string': {
                    color: '#dc2626'
                },
                '.tok-string.answer': {
                    color: '#ea580c',
                    fontWeight: 'bold'
                },
                '.tok-string.selection': {
                    color: '#059669',
                    fontWeight: 'bold'
                },
                '.tok-operator.match': {
                    color: '#7c3aed',
                    fontWeight: 'bold'
                },
                '.tok-operator.order': {
                    color: '#0891b2',
                    fontWeight: 'bold'
                },
                '.tok-annotation.correct': {
                    color: '#059669',
                    fontWeight: 'bold'
                },
                '.tok-comment': {
                    color: '#6b7280',
                    fontStyle: 'italic'
                },
                '.tok-number': {
                    color: '#0891b2'
                },
                '.tok-keyword.boolean': {
                    color: '#7c3aed'
                },
                '.tok-bracket': {
                    color: '#4b5563',
                    fontWeight: 'bold'
                }
            })
        ];

        const state = EditorState.create({
            doc: initialScript || defaultScript,
            extensions
        });

        const view = new EditorView({
            state,
            parent: editorRef.current
        });

        viewRef.current = view;

        // Initial parse
        handleParse(initialScript || defaultScript);

        return () => {
            view.destroy();
        };
    }, []); // Remove dependencies to prevent re-creation

    const handleSaveAll = async () => {
        if (parseResult?.errors.length === 0 && parseResult.exercises.length > 0 && onSaveAll) {
            setSaving(true);
            try {
                await onSaveAll();
                if (viewRef.current) {
                    const state = EditorState.create({
                        doc: '',
                        extensions: viewRef.current.state.extensions
                    });
                    viewRef.current.setState(state);
                }
            } finally {
                setSaving(false);
            }
        } else {
            toast.error('Please fix errors before saving');
        }
    };

    const insertTemplate = (template: Template) => {
        if (!viewRef.current) return;

        const view = viewRef.current;
        const pos = view.state.selection.main.head;
        
        view.dispatch({
            changes: {
                from: pos,
                insert: '\n\n' + template.content + '\n'
            },
            selection: { anchor: pos + template.content.length + 3 }
        });

        setShowTemplates(false);
        setSelectedTemplate('');
    };

    return (
        <div className="eduscript-editor-container">
            <div className="eduscript-toolbar">
                <div className="eduscript-toolbar-left">
                    <button 
                        onClick={() => setShowTemplates(!showTemplates)} 
                        className={showTemplates ? 'active' : ''}
                        title="Show template library"
                    >
                        <i className="fas fa-layer-group"></i>
                        <span>Templates</span>
                    </button>
                    <div className="toolbar-separator"></div>
                    <button 
                        onClick={() => setShowPreview(!showPreview)} 
                        className={showPreview ? 'active' : ''}
                        title="Toggle preview"
                    >
                        <i className="fas fa-eye"></i>
                        <span>Preview</span>
                    </button>
                    <div className="toolbar-separator"></div>
                    <span className="toolbar-hint">
                        <i className="fas fa-info-circle"></i>
                        {initialScript ? 'Edit mode: 1 exercise' : 'Max 3 exercises'}
                    </span>
                </div>
                <div className="eduscript-toolbar-right">
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

            <div className="eduscript-content">
                {/* Template Library */}
                {showTemplates && (
                    <div className="eduscript-templates">
                        <div className="templates-header">
                            <h3>
                                <i className="fas fa-layer-group"></i>
                                Template Library
                            </h3>
                            <button 
                                onClick={() => setShowTemplates(false)}
                                className="close-templates"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="templates-content">
                            {templates.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="template-category">
                                    <h4>
                                        <i className={category.icon}></i>
                                        {category.name}
                                    </h4>
                                    <div className="template-list">
                                        {category.templates.map((template, templateIndex) => (
                                            <div 
                                                key={templateIndex}
                                                className={`template-item ${selectedTemplate === `${categoryIndex}-${templateIndex}` ? 'selected' : ''}`}
                                                onClick={() => {
                                                    const key = `${categoryIndex}-${templateIndex}`;
                                                    if (selectedTemplate === key) {
                                                        insertTemplate(template);
                                                    } else {
                                                        setSelectedTemplate(key);
                                                    }
                                                }}
                                            >
                                                <div className="template-header">
                                                    <span className="template-name">{template.name}</span>
                                                    <span className="template-action">
                                                        {selectedTemplate === `${categoryIndex}-${templateIndex}` ? 
                                                            'Click to Insert' : 'Click to Preview'
                                                        }
                                                    </span>
                                                </div>
                                                <p className="template-description">{template.description}</p>
                                                {selectedTemplate === `${categoryIndex}-${templateIndex}` && (
                                                    <div className="template-preview">
                                                        <pre><code>{template.content}</code></pre>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                insertTemplate(template);
                                                            }}
                                                            className="insert-button"
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                            Insert Template
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="eduscript-editor-wrapper">
                    <div ref={editorRef} className="eduscript-codemirror-editor" />
                </div>

                {showPreview && (
                    <div className="eduscript-preview">
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
                                        <li>Click <strong>Templates</strong> for comprehensive examples</li>
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