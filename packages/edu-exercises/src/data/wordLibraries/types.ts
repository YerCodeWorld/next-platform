// Word library types based on the structure defined in libs.md

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Word {
  id: string;
  text: string;
  category: string;
  level: CEFRLevel;
  tags: string[];
}

export interface WordLibrary {
  theme: string;
  words: Word[];
}

export interface FillOptions {
  category?: string;
  level?: CEFRLevel;
  tags?: string[];
}

export interface LibraryFilters {
  category?: string;
  level?: CEFRLevel;
  tag?: string;
}