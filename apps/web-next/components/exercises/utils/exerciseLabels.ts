// Utility functions for exercise labels and styling
// Centralized to avoid duplication across components

export const getDifficultyLabel = (difficulty: string, locale: string) => {
    const labels: Record<string, { en: string; es: string }> = {
        BEGINNER: { en: 'Beginner', es: 'Principiante' },
        UPPER_BEGINNER: { en: 'Upper Beginner', es: 'Principiante Alto' },
        INTERMEDIATE: { en: 'Intermediate', es: 'Intermedio' },
        UPPER_INTERMEDIATE: { en: 'Upper Intermediate', es: 'Intermedio Alto' },
        ADVANCED: { en: 'Advanced', es: 'Avanzado' },
        SUPER_ADVANCED: { en: 'Super Advanced', es: 'Super Avanzado' },
    };
    return labels[difficulty]?.[locale] || difficulty;
};

export const getCategoryLabel = (category: string, locale: string) => {
    const labels: Record<string, { en: string; es: string }> = {
        GRAMMAR: { en: 'Grammar', es: 'Gramática' },
        VOCABULARY: { en: 'Vocabulary', es: 'Vocabulario' },
        READING: { en: 'Reading', es: 'Lectura' },
        WRITING: { en: 'Writing', es: 'Escritura' },
        LISTENING: { en: 'Listening', es: 'Escucha' },
        SPEAKING: { en: 'Speaking', es: 'Habla' },
        CONVERSATION: { en: 'Conversation', es: 'Conversación' },
        GENERAL: { en: 'General', es: 'General' },
    };
    return labels[category]?.[locale] || category;
};

// Tailwind difficulty color mappings
export const difficultyStyles = {
    BEGINNER: 'bg-emerald-500 text-white',
    UPPER_BEGINNER: 'bg-cyan-500 text-white', 
    INTERMEDIATE: 'bg-blue-500 text-white',
    UPPER_INTERMEDIATE: 'bg-violet-500 text-white',
    ADVANCED: 'bg-amber-500 text-white',
    SUPER_ADVANCED: 'bg-red-500 text-white'
};

// Tailwind category color mappings
export const categoryStyles = {
    GRAMMAR: 'bg-indigo-500 text-white',
    VOCABULARY: 'bg-purple-500 text-white',
    READING: 'bg-emerald-500 text-white',
    WRITING: 'bg-amber-500 text-white',
    LISTENING: 'bg-cyan-500 text-white',
    SPEAKING: 'bg-pink-500 text-white',
    CONVERSATION: 'bg-orange-500 text-white',
    GENERAL: 'bg-gray-500 text-white'
};

// Button styles for categories
export const categoryButtonStyles = {
    GRAMMAR: 'bg-indigo-600 hover:bg-indigo-700',
    VOCABULARY: 'bg-purple-600 hover:bg-purple-700',
    READING: 'bg-emerald-600 hover:bg-emerald-700',
    WRITING: 'bg-amber-600 hover:bg-amber-700',
    LISTENING: 'bg-cyan-600 hover:bg-cyan-700',
    SPEAKING: 'bg-pink-600 hover:bg-pink-700',
    CONVERSATION: 'bg-orange-600 hover:bg-orange-700',
    GENERAL: 'bg-gray-600 hover:bg-gray-700'
};

// Helper functions to get styles safely
export const getDifficultyStyle = (difficulty: string) => {
    return difficultyStyles[difficulty as keyof typeof difficultyStyles] || difficultyStyles.INTERMEDIATE;
};

export const getCategoryStyle = (category: string) => {
    return categoryStyles[category as keyof typeof categoryStyles] || categoryStyles.GENERAL;
};

export const getCategoryButtonStyle = (category: string) => {
    return categoryButtonStyles[category as keyof typeof categoryButtonStyles] || categoryButtonStyles.GENERAL;
};