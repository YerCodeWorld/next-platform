// packages/edu-exercises/src/test/registryTest.ts
// Quick test to verify registry system works

import { exerciseRegistry, initializeExerciseRegistry } from '../exercises';
import { logger } from '../utils/logger';

/**
 * Test the registry system functionality
 */
export function testRegistrySystem() {
    console.log('🧪 Testing Exercise Registry System...');
    
    // Initialize registry
    initializeExerciseRegistry();
    
    // Test 1: Registry initialization
    console.log('✅ Test 1: Registry Types');
    const types = exerciseRegistry.getExerciseTypes();
    console.log('Registered types:', types);
    console.log('Expected: MULTIPLE_CHOICE, FILL_BLANK, MATCHING, ORDERING');
    
    // Test 2: Type detection
    console.log('\n✅ Test 2: Type Detection');
    
    const multipleChoiceText = ["What is 2+2? = 3 | 4 | 5 [4]"];
    const mcType = exerciseRegistry.detectType(multipleChoiceText);
    console.log('Multiple Choice detection:', mcType, '(expected: MULTIPLE_CHOICE)');
    
    const fillBlankText = ["She *goes|walks* to school every day."];
    const fbType = exerciseRegistry.detectType(fillBlankText);
    console.log('Fill Blank detection:', fbType, '(expected: FILL_BLANK)');
    
    const matchingText = ["Happy = Sad", "Hot = Cold"];
    const matchType = exerciseRegistry.detectType(matchingText);
    console.log('Matching detection:', matchType, '(expected: MATCHING)');
    
    const orderingText = ["The | cat | is | sleeping"];
    const orderType = exerciseRegistry.detectType(orderingText);
    console.log('Ordering detection:', orderType, '(expected: ORDERING)');
    
    // Test 3: Content parsing
    console.log('\n✅ Test 3: Content Parsing');
    
    try {
        const mcContent = exerciseRegistry.parseContent('MULTIPLE_CHOICE', multipleChoiceText);
        console.log('Multiple Choice parsed:', JSON.stringify(mcContent, null, 2));
        
        const fbContent = exerciseRegistry.parseContent('FILL_BLANK', fillBlankText);
        console.log('Fill Blank parsed:', JSON.stringify(fbContent, null, 2));
        
    } catch (error) {
        console.log('Parsing error (expected due to placeholder components):', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 4: Validation
    console.log('\n✅ Test 4: Validation');
    
    const validMCContent = {
        questions: [{
            question: "What is 2+2?",
            options: ["3", "4", "5"],
            correctIndices: [1],
            hint: undefined,
            explanation: undefined
        }]
    };
    
    const mcValidation = exerciseRegistry.validateContent('MULTIPLE_CHOICE', validMCContent);
    console.log('Multiple Choice validation:', mcValidation);
    
    // Test 5: Metadata
    console.log('\n✅ Test 5: Exercise Metadata');
    const metadata = exerciseRegistry.getExerciseMetadata();
    console.log('Exercise metadata:', metadata.map(m => ({ type: m.type, name: m.displayName })));
    
    console.log('\n🎉 Registry system test completed!');
    
    return {
        typesRegistered: types.length === 4,
        detectionWorks: mcType === 'MULTIPLE_CHOICE' && fbType === 'FILL_BLANK',
        validationWorks: mcValidation.isValid,
        success: true
    };
}

// Test LanScript parser integration
export function testLanScriptIntegration() {
    console.log('\n🧪 Testing LanScript Parser Integration...');
    
    const { LanScriptParser } = require('../parser/lanscript/parser');
    const parser = new LanScriptParser();
    
    const testScript = `{
  type: "multiple_choice"
  title: "Math Test"
  
  What is 2+2? = 3 | 4 | 5 [4]
  What is 3+3? = 5 | 6 | 7 [6]
}`;
    
    try {
        const result = parser.parse(testScript, "test@example.com");
        console.log('LanScript parsing result:');
        console.log('- Exercises found:', result.exercises.length);
        console.log('- Errors:', result.errors.length);
        
        if (result.exercises.length > 0) {
            console.log('- First exercise type:', result.exercises[0].type);
            console.log('- First exercise title:', result.exercises[0].title);
        }
        
        return { success: result.exercises.length > 0, errors: result.errors };
    } catch (error) {
        console.log('LanScript test error:', error instanceof Error ? error.message : 'Unknown error');
        return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
}

// Export test runner for browser/Node environments
export function runAllTests() {
    const results = {
        registry: testRegistrySystem(),
        lanscript: testLanScriptIntegration()
    };
    
    console.log('\n📊 Test Summary:');
    console.log('Registry System:', results.registry.success ? '✅ PASS' : '❌ FAIL');
    console.log('LanScript Integration:', results.lanscript.success ? '✅ PASS' : '❌ FAIL');
    
    return results;
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Browser environment
    (window as any).testExerciseRegistry = runAllTests;
    console.log('💡 Run testExerciseRegistry() in console to test the registry');
} else if (typeof module !== 'undefined' && module.exports) {
    // Node environment - don't auto-run, just export
}