// Test script for Categorize exercise parser
import { EduScriptParser } from '../parser/eduscript/parser';
import { initializeExerciseRegistry } from '../exercises';

// Initialize registry
initializeExerciseRegistry();

const testScripts = {
  original: `
{
  @metadata(
    type = categorize
    title = Geography Quiz
    instructions = Drag countries to their correct continents
  )
  
  @config(
    variation = original
  )
  
  ASIA = China | Japan | @fill('asian_countries', 3)
  EUROPE = UK | France | Germany @hint("Western European countries")
  AFRICA = Egypt | Nigeria | @fill('african_countries', 2)
}`,

  ordering: `
{
  @metadata(
    type = categorize  
    title = Fix the Categories
    instructions = Some items are in the wrong categories. Move them to the correct ones.
  )
  
  @config(
    variation = ordering
  )
  
  FRUITS = apple | carrot | banana | orange
  VEGETABLES = broccoli | grape | lettuce | tomato
  DAIRY = milk | cheese | bread | yogurt
}`,

  lake: `
{
  @metadata(
    type = categorize
    title = Planet Selection
    instructions = Select all the planets from the list
  )
  
  @config(
    variation = lake
  )
  
  // Select all planets in our solar system
  = Earth | Mars | Venus | Jupiter
  Sun | Moon | Asteroid | Saturn | Mercury
}`
};

console.log('Testing Categorize Exercise Parser\n');

const parser = new EduScriptParser();

// Test each variation
for (const [variation, script] of Object.entries(testScripts)) {
  console.log(`\n=== Testing ${variation} variation ===`);
  
  try {
    const result = parser.parse(script, 'test@example.com');
    
    if (result.success && result.exercises.length > 0) {
      const exercise = result.exercises[0];
      console.log('✅ Parse successful!');
      console.log('Title:', exercise.title);
      console.log('Type:', exercise.type);
      console.log('Content:', JSON.stringify(exercise.content, null, 2));
    } else {
      console.log('❌ Parse failed!');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.log('❌ Exception:', error);
  }
}

// Test detection
console.log('\n=== Testing Detection ===');
const testLines = [
  ['FRUITS = apple | banana', 'VEGETABLES = carrot'],
  ['= Earth | Mars | Venus', 'Sun | Moon'],
  ['COLD = Coat | Scarf | Gloves', 'HOT = Shorts | Sandals']
];

import { categorizeExercise } from '../exercises/categorize';

testLines.forEach((lines, index) => {
  const isMatch = categorizeExercise.detectPattern(lines);
  const content = categorizeExercise.parseContent(lines);
  console.log(`Test ${index + 1}: Match=${isMatch}, Variation=${content.variation}`);
});