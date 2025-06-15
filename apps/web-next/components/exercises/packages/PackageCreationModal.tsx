'use client';

import React, { useState } from 'react';
import { useExercisePackagesApi } from '@repo/api-bridge';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';
import '../../../styles/exercises/modal.css';

interface PackageCreationModalProps {
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
}

const difficulties = [
  'BEGINNER',
  'ELEMENTARY', 
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'SUPER_ADVANCED'
];

const categories = [
  'GRAMMAR',
  'VOCABULARY',
  'LISTENING',
  'READING',
  'WRITING',
  'SPEAKING',
  'PRONUNCIATION',
  'GENERAL'
];

const labels = {
  en: {
    createPackage: 'Create Exercise Package',
    title: 'Package Title',
    titlePlaceholder: 'Enter package title...',
    description: 'Description',
    descriptionPlaceholder: 'Describe what this package covers...',
    difficulty: 'Difficulty Level',
    category: 'Category',
    tags: 'Tags',
    tagsPlaceholder: 'Enter tags separated by commas...',
    image: 'Cover Image URL',
    imagePlaceholder: 'https://example.com/image.jpg',
    cancel: 'Cancel',
    create: 'Create Package',
    creating: 'Creating...',
    // Difficulties
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate',
    UPPER_INTERMEDIATE: 'Upper Intermediate',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert',
    // Categories
    GRAMMAR: 'Grammar',
    VOCABULARY: 'Vocabulary',
    LISTENING: 'Listening',
    READING: 'Reading',
    WRITING: 'Writing',
    SPEAKING: 'Speaking',
    PRONUNCIATION: 'Pronunciation',
    GENERAL: 'General'
  },
  es: {
    createPackage: 'Crear Paquete de Ejercicios',
    title: 'Título del Paquete',
    titlePlaceholder: 'Ingresa el título del paquete...',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe qué cubre este paquete...',
    difficulty: 'Nivel de Dificultad',
    category: 'Categoría',
    tags: 'Etiquetas',
    tagsPlaceholder: 'Ingresa etiquetas separadas por comas...',
    image: 'URL de Imagen de Portada',
    imagePlaceholder: 'https://ejemplo.com/imagen.jpg',
    cancel: 'Cancelar',
    create: 'Crear Paquete',
    creating: 'Creando...',
    // Difficulties
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Intermedio Alto',
    ADVANCED: 'Avanzado',
    SUPER_ADVANCED: 'Experto',
    // Categories
    GRAMMAR: 'Gramática',
    VOCABULARY: 'Vocabulario',
    LISTENING: 'Comprensión Auditiva',
    READING: 'Lectura',
    WRITING: 'Escritura',
    SPEAKING: 'Conversación',
    PRONUNCIATION: 'Pronunciación',
    GENERAL: 'General'
  }
};

export default function PackageCreationModal({ 
  locale, 
  onClose, 
  onSuccess 
}: PackageCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'INTERMEDIATE' as const,
    category: 'GENERAL' as const,
    tags: '',
    image: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPackage } = useExercisePackagesApi();
  const t = labels[locale as 'en' | 'es'] || labels.en;

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = locale === 'es' ? 'El título es requerido' : 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = locale === 'es' ? 'El título debe tener al menos 3 caracteres' : 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = locale === 'es' ? 'La descripción es requerida' : 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = locale === 'es' ? 'La descripción debe tener al menos 10 caracteres' : 'Description must be at least 10 characters';
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = locale === 'es' ? 'URL de imagen inválida' : 'Invalid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createPackage({
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        category: formData.category,
        slug: generateSlug(formData.title),
        tags: tagsArray,
        image: formData.image.trim() || null,
        isPublic: true
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating package:', error);
      setErrors({ 
        submit: locale === 'es' 
          ? 'Error al crear el paquete. Inténtalo de nuevo.' 
          : 'Error creating package. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-lg">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 className="modal-title">{t.createPackage}</h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">{t.title} *</label>
              <input
                type="text"
                className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                placeholder={t.titlePlaceholder}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">{t.description} *</label>
              <textarea
                className={`form-input ${errors.description ? 'form-input-error' : ''}`}
                placeholder={t.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Difficulty and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">{t.difficulty}</label>
                <select
                  className="form-input"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  disabled={isSubmitting}
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {t[difficulty as keyof typeof t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.category}</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={isSubmitting}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {t[category as keyof typeof t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">{t.tags}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t.tagsPlaceholder}
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label className="form-label">{t.image}</label>
              <input
                type="url"
                className={`form-input ${errors.image ? 'form-input-error' : ''}`}
                placeholder={t.imagePlaceholder}
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                disabled={isSubmitting}
              />
              {errors.image && <div className="form-error">{errors.image}</div>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
                {errors.submit}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.creating : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}