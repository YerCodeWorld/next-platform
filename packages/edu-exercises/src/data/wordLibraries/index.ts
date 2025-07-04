// Main export file for word libraries
export {
  fill,
  libraryExists,
  getLibraryNames,
  getCategories,
  getTags,
  type Word,
  type WordLibrary,
  type LibraryFilters,
  type CEFRLevel
} from './loader';

// Re-export types from types.ts
export type { FillOptions } from './types';