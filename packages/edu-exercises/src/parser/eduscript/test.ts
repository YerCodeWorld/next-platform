// Simple test for EduScript parser

import { EduScriptParser } from './parser';

// Test script based on the showcase examples
const testScript = `
{
    @metadata(
        type = fill blank
        title = Basic Fill Blank Exercise
        instructions = Complete the missing words
        difficulty = A1
    )

    @config(
        variation = original
        limit = 5
    )

    She *is* my *little|younger* sister.
    We *are not* your friends.              @ins(negative be)
    *When* was the party?                   @ins(WH word for time)
    I would love to eat all those *apples*  @img(apple.jpg)
}

{
    @metadata(
        type = multiple choice
        title = Animals Quiz
        instructions = Select the correct animals
    )

    @config(
        variation = original
        limit = 3
    )

    @var animals = @fill('pets', 3)
    
    Which animal makes a good pet? = @fill('wild_animals', 2) | [@var(animals)]
    Select sea animals = @fill('land_animals', 3) | [@fill('sea_animals', 2)]
}
`;

export function testEduScriptParser(): void {
  console.log('Testing EduScript Parser...');
  
  const parser = new EduScriptParser();
  const result = parser.parse(testScript, 'test@example.com');
  
  console.log('Parse Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Parser test passed');
    console.log(`Parsed ${result.exercises.length} exercises`);
  } else {
    console.log('❌ Parser test failed');
    console.log('Errors:', result.errors);
  }
}