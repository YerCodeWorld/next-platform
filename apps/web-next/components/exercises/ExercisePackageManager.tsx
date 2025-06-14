// components/exercises/ExercisePackageManager.tsx
'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import { useExercisePackagesApi } from '@repo/api-bridge';
import type { ExercisePackage, PackageExercise } from '@repo/api-bridge';

interface Exercise {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  category: string;
  instructions?: string;
  isPublished: boolean;
}

interface ExercisePackageManagerProps {
  exercisePackage: ExercisePackage;
  packageExercises: PackageExercise[];
  allExercises: Exercise[];
  locale: string;
  userData: {
    id: string;
    email: string;
    role: string;
  };
}

export function ExercisePackageManager({
  exercisePackage,
  packageExercises,
  allExercises,
  locale
}: ExercisePackageManagerProps) {
  const { addExerciseToPackage, removeExerciseFromPackage, updatePackage, loading, error } = useExercisePackagesApi();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [packageInfo, setPackageInfo] = useState({
    title: exercisePackage.title,
    description: exercisePackage.description,
    category: exercisePackage.category,
    isPublished: exercisePackage.isPublished,
  });

  // Get IDs of exercises already in package
  const packageExerciseIds = new Set(packageExercises.map(ex => ex.id));

  // Filter available exercises (not in package yet)
  const availableExercises = allExercises.filter(ex => 
    !packageExerciseIds.has(ex.id) &&
    ex.isPublished &&
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedType === '' || ex.type === selectedType) &&
    (selectedDifficulty === '' || ex.difficulty === selectedDifficulty)
  );

  const exerciseTypes = [...new Set(allExercises.map(ex => ex.type))];
  const difficulties = [...new Set(allExercises.map(ex => ex.difficulty))];

  const handleAddExercise = async (exerciseId: string) => {
    try {
      await addExerciseToPackage(exercisePackage.id, exerciseId);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error('Failed to add exercise:', err);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!confirm(locale === 'es' ? '¿Eliminar este ejercicio del paquete?' : 'Remove this exercise from the package?')) {
      return;
    }
    
    try {
      await removeExerciseFromPackage(exercisePackage.id, exerciseId);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error('Failed to remove exercise:', err);
    }
  };

  const handleUpdatePackage = async () => {
    try {
      await updatePackage(exercisePackage.id, packageInfo);
      alert(locale === 'es' ? 'Paquete actualizado exitosamente' : 'Package updated successfully');
    } catch (err) {
      console.error('Failed to update package:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      FILL_BLANK: { en: 'Fill in the Blank', es: 'Llenar Espacios' },
      MULTIPLE_CHOICE: { en: 'Multiple Choice', es: 'Opción Múltiple' },
      MATCHING: { en: 'Matching', es: 'Emparejar' },
      ORDERING: { en: 'Ordering', es: 'Ordenar' },
    };
    return labels[type]?.[locale] || type;
  };

  const getDifficultyLabel = (difficulty: string) => {
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

  return (
    <div className="space-y-8">
      {/* Package Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {locale === 'es' ? 'Configuración del Paquete' : 'Package Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'es' ? 'Título' : 'Title'}
            </label>
            <input
              type="text"
              value={packageInfo.title}
              onChange={(e) => setPackageInfo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'es' ? 'Categoría' : 'Category'}
            </label>
            <input
              type="text"
              value={packageInfo.category}
              onChange={(e) => setPackageInfo(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'es' ? 'Descripción' : 'Description'}
          </label>
          <textarea
            value={packageInfo.description}
            onChange={(e) => setPackageInfo(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={packageInfo.isPublished}
              onChange={(e) => setPackageInfo(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {locale === 'es' ? 'Publicado' : 'Published'}
            </span>
          </label>

          <button
            onClick={handleUpdatePackage}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {locale === 'es' ? 'Guardar' : 'Save'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Current Exercises */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {locale === 'es' ? 'Ejercicios en el Paquete' : 'Exercises in Package'} ({packageExercises.length})
        </h2>
        
        {packageExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {locale === 'es' 
              ? 'No hay ejercicios en este paquete aún.'
              : 'No exercises in this package yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {packageExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {getTypeLabel(exercise.type)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveExercise(exercise.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={locale === 'es' ? 'Eliminar ejercicio' : 'Remove exercise'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Exercises */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {locale === 'es' ? 'Agregar Ejercicios' : 'Add Exercises'}
        </h2>
        
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={locale === 'es' ? 'Buscar ejercicios...' : 'Search exercises...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {locale === 'es' ? 'Filtros' : 'Filters'}
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Tipo' : 'Type'}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{locale === 'es' ? 'Todos los tipos' : 'All types'}</option>
                  {exerciseTypes.map(type => (
                    <option key={type} value={type}>{getTypeLabel(type)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Dificultad' : 'Difficulty'}
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{locale === 'es' ? 'Todas las dificultades' : 'All difficulties'}</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{getDifficultyLabel(difficulty)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Available Exercises */}
        <div className="space-y-4">
          {availableExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {locale === 'es' 
                ? 'No se encontraron ejercicios disponibles.'
                : 'No available exercises found.'}
            </div>
          ) : (
            availableExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {getTypeLabel(exercise.type)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {exercise.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddExercise(exercise.id)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {locale === 'es' ? 'Agregar' : 'Add'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}