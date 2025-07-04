import { Word, WordLibrary, LibraryFilters, CEFRLevel } from './types';

// Import all library JSON files
import foodLibrary from './libraries/food.json';
import animalsLibrary from './libraries/animals.json';
import countriesLibrary from './libraries/countries.json';
import colorsLibrary from './libraries/colors.json';
import professionsLibrary from './libraries/professions.json';
import adjectivesLibrary from './libraries/adjectives.json';

// Map of all available libraries
const libraries: Record<string, WordLibrary> = {
  food: foodLibrary as WordLibrary,
  animals: animalsLibrary as WordLibrary,
  countries: countriesLibrary as WordLibrary,
  colors: colorsLibrary as WordLibrary,
  professions: professionsLibrary as WordLibrary,
  adjectives: adjectivesLibrary as WordLibrary,
};

// Category aliases for more flexible queries
const categoryAliases: Record<string, string> = {
  // Food aliases
  'fruits': 'fruits',
  'fruit': 'fruits',
  'vegetables': 'vegetables',
  'vegetable': 'vegetables',
  'junk': 'junk',
  'junk_food': 'junk',
  'fast_food': 'junk',
  'meat': 'meat',
  'seafood': 'seafood',
  'grains': 'grains',
  'grain': 'grains',
  
  // Animal aliases
  'pets': 'pets',
  'pet': 'pets',
  'wild_animals': 'wild_animals',
  'wild': 'wild_animals',
  'sea_animals': 'sea_animals',
  'sea': 'sea_animals',
  'marine': 'sea_animals',
  'birds': 'birds',
  'bird': 'birds',
  'reptiles': 'reptiles',
  'reptile': 'reptiles',
  'mammals': 'mammals',
  'mammal': 'mammals',
  
  // Country aliases
  'asian_countries': 'asian_countries',
  'asia': 'asian_countries',
  'american_countries': 'american_countries',
  'americas': 'american_countries',
  'european_countries': 'european_countries',
  'europe': 'european_countries',
  'african_countries': 'african_countries',
  'africa': 'african_countries',
  
  // Color aliases
  'basic_colors': 'basic_colors',
  'basic': 'basic_colors',
  'advanced_colors': 'advanced_colors',
  'advanced': 'advanced_colors',
  'colors': 'basic_colors', // Default to basic
  
  // Profession aliases
  'education': 'education',
  'healthcare': 'healthcare',
  'health': 'healthcare',
  'medical': 'healthcare',
  'technology': 'technology',
  'tech': 'technology',
  'food_service': 'food_service',
  'restaurant': 'food_service',
  'legal': 'legal',
  'law': 'legal',
  'public_service': 'public_service',
  'public': 'public_service',
  'transportation': 'transportation',
  'transport': 'transportation',
  'creative': 'creative',
  'art': 'creative',
  'research': 'research',
  'media': 'media',
  'design': 'design',
  
  // Adjective aliases
  'emotions': 'emotions',
  'emotion': 'emotions',
  'size': 'size',
  'temperature': 'temperature',
  'temp': 'temperature',
  'appearance': 'appearance',
  'looks': 'appearance',
  'speed': 'speed',
  'mental': 'mental',
  'intelligence': 'mental',
  'difficulty': 'difficulty',
  'cost': 'cost',
  'price': 'cost',
};

/**
 * Get all words from all libraries
 */
function getAllWords(): Word[] {
  const allWords: Word[] = [];
  Object.values(libraries).forEach(library => {
    allWords.push(...library.words);
  });
  return allWords;
}

/**
 * Filter words based on provided filters
 */
function filterWords(words: Word[], filters: LibraryFilters): Word[] {
  let filtered = [...words];
  
  if (filters.category) {
    const normalizedCategory = categoryAliases[filters.category.toLowerCase()] || filters.category;
    filtered = filtered.filter(word => word.category === normalizedCategory);
  }
  
  if (filters.level) {
    filtered = filtered.filter(word => word.level === filters.level);
  }
  
  if (filters.tag) {
    const normalizedTag = filters.tag.toLowerCase();
    filtered = filtered.filter(word => 
      word.tags.some(tag => tag.toLowerCase() === normalizedTag)
    );
  }
  
  return filtered;
}

/**
 * Get a random selection of words
 */
function getRandomWords(words: Word[], amount: number): Word[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(amount, words.length));
}

/**
 * Main fill function - implements the @fill() functionality
 */
export function fill(
  libraryNameOrCategory: string, 
  amount: number = 1,
  filters: LibraryFilters = {}
): string[] {
  let words: Word[] = [];
  
  // Check if it's a library name first
  const library = libraries[libraryNameOrCategory.toLowerCase()];
  if (library) {
    words = library.words;
  } else {
    // Try as a category across all libraries
    words = getAllWords();
    filters.category = libraryNameOrCategory;
  }
  
  // Apply filters
  const filteredWords = filterWords(words, filters);
  
  if (filteredWords.length === 0) {
    throw new Error(`No words found for: ${libraryNameOrCategory} with filters: ${JSON.stringify(filters)}`);
  }
  
  // Get random selection
  const selectedWords = getRandomWords(filteredWords, amount);
  
  // Return just the text values
  return selectedWords.map(word => word.text);
}

/**
 * Check if a library or category exists
 */
export function libraryExists(name: string): boolean {
  // Check if it's a direct library name
  if (libraries[name.toLowerCase()]) {
    return true;
  }
  
  // Check if it's a valid category
  const normalizedCategory = categoryAliases[name.toLowerCase()];
  if (normalizedCategory) {
    // Check if any words exist in this category
    const words = getAllWords();
    return words.some(word => word.category === normalizedCategory);
  }
  
  return false;
}

/**
 * Get all available library names
 */
export function getLibraryNames(): string[] {
  return Object.keys(libraries);
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  Object.values(libraries).forEach(library => {
    library.words.forEach(word => {
      categories.add(word.category);
    });
  });
  return Array.from(categories);
}

/**
 * Get all available tags
 */
export function getTags(): string[] {
  const tags = new Set<string>();
  Object.values(libraries).forEach(library => {
    library.words.forEach(word => {
      word.tags.forEach(tag => tags.add(tag));
    });
  });
  return Array.from(tags);
}

// Export types for use in other modules
export type { Word, WordLibrary, LibraryFilters, CEFRLevel };