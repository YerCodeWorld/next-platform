'use client';

import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Book, Award } from 'lucide-react';

interface ExerciseHeroSectionProps {
    title: string;
    subtitle: string;
    locale: string;
}

const categories = {
    en: ['All', 'Mathematics', 'Language', 'Science', 'History', 'Geography', 'Arts'],
    es: ['Todos', 'Matemáticas', 'Lenguaje', 'Ciencias', 'Historia', 'Geografía', 'Arte']
};

const difficulties = {
    en: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
    es: ['Todos los niveles', 'Principiante', 'Intermedio', 'Avanzado']
};

export default function ExerciseHeroSection({ title, subtitle, locale }: ExerciseHeroSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedDifficulty, setSelectedDifficulty] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const currentCategories = categories[locale as keyof typeof categories] || categories.en;
    const currentDifficulties = difficulties[locale as keyof typeof difficulties] || difficulties.en;

    return (
        <div className="relative mb-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                
                <div className="flex justify-center gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Book className="w-4 h-4" />
                        <span>500+ {locale === 'es' ? 'Ejercicios' : 'Exercises'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{locale === 'es' ? 'Progreso Trackeable' : 'Track Progress'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Award className="w-4 h-4" />
                        <span>{locale === 'es' ? 'Certificados' : 'Certificates'}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={locale === 'es' ? 'Buscar paquetes de ejercicios...' : 'Search exercise packages...'}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {locale === 'es' ? 'Categoría' : 'Category'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {currentCategories.map((category, index) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(index)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            selectedCategory === index
                                                ? 'bg-indigo-600 text-white shadow-lg transform -translate-y-0.5'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                {locale === 'es' ? 'Dificultad' : 'Difficulty'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {currentDifficulties.map((difficulty, index) => (
                                    <button
                                        key={difficulty}
                                        onClick={() => setSelectedDifficulty(index)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            selectedDifficulty === index
                                                ? 'bg-purple-600 text-white shadow-lg transform -translate-y-0.5'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {difficulty}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}