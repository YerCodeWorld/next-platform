'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { useExercisePackagesApi, CreateExercisePackagePayload, UpdateExercisePackagePayload, ExercisePackage } from '@repo/api-bridge';
import { User } from '@/types';

interface ExercisePackageFormProps {
  onClose?: () => void;
  locale: string;
  userData?: User | null;
  packageToEdit?: ExercisePackage;
  isModal?: boolean;
}

export function ExercisePackageForm({ 
  onClose, 
  locale, 
  packageToEdit,
  isModal = true
}: ExercisePackageFormProps) {
  const { createPackage, updatePackage } = useExercisePackagesApi();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: packageToEdit?.title || '',
    description: packageToEdit?.description || '',
    slug: packageToEdit?.slug || '',
    category: packageToEdit?.category || 'GENERAL',
    image: packageToEdit?.image || '',
    metaTitle: packageToEdit?.metaTitle || '',
    metaDescription: packageToEdit?.metaDescription || '',
    maxExercises: packageToEdit?.maxExercises || 30,
    isPublished: packageToEdit?.isPublished || false,
    featured: packageToEdit?.featured || false,
  });

  // Handle mounting for SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (packageToEdit) {
        const updateData: UpdateExercisePackagePayload = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image: formData.image || undefined,
          metaTitle: formData.metaTitle || undefined,
          metaDescription: formData.metaDescription || undefined,
          maxExercises: formData.maxExercises,
          isPublished: formData.isPublished,
          featured: formData.featured,
        };
        await updatePackage(packageToEdit.id, updateData);
      } else {
        const createData: CreateExercisePackagePayload = {
          title: formData.title,
          description: formData.description,
          slug: formData.slug,
          category: formData.category,
          image: formData.image || undefined,
          metaTitle: formData.metaTitle || undefined,
          metaDescription: formData.metaDescription || undefined,
          maxExercises: formData.maxExercises,
          isPublished: formData.isPublished,
          featured: formData.featured,
        };
        await createPackage(createData);
      }
      
      if (onClose) {
        onClose();
      }
      
      if (isModal) {
        // Reload page to show new package
        window.location.reload();
      } else {
        // Redirect to exercises page for non-modal usage
        window.location.href = `/${locale}/exercises`;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const categories = [
    'GENERAL',
    'GRAMMAR',
    'VOCABULARY',
    'READING',
    'WRITING',
    'LISTENING',
    'SPEAKING',
    'CONVERSATION'
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL: locale === 'es' ? 'General' : 'General',
      GRAMMAR: locale === 'es' ? 'Gramática' : 'Grammar',
      VOCABULARY: locale === 'es' ? 'Vocabulario' : 'Vocabulary',
      READING: locale === 'es' ? 'Lectura' : 'Reading',
      WRITING: locale === 'es' ? 'Escritura' : 'Writing',
      LISTENING: locale === 'es' ? 'Escucha' : 'Listening',
      SPEAKING: locale === 'es' ? 'Habla' : 'Speaking',
      CONVERSATION: locale === 'es' ? 'Conversación' : 'Conversation',
    };
    return labels[category] || category;
  };

  const formContent = (

        <form onSubmit={handleSubmit} className="exercise-package-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <h3>{locale === 'es' ? 'Información Básica' : 'Basic Information'}</h3>
            
            <div className="form-group">
              <label htmlFor="title">
                {locale === 'es' ? 'Título' : 'Title'} *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!packageToEdit) {
                    setFormData(prev => ({ 
                      ...prev, 
                      slug: generateSlug(e.target.value) 
                    }));
                  }
                }}
                required
                placeholder={locale === 'es' ? 'Ej: Gramática Básica' : 'Ex: Basic Grammar'}
              />
            </div>

            {!packageToEdit && (
              <div className="form-group">
                <label htmlFor="slug">
                  {locale === 'es' ? 'Slug (URL)' : 'Slug (URL)'} *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="basic-grammar"
                  pattern="[a-z0-9-]+"
                />
                <small>{locale === 'es' ? 'Solo letras minúsculas, números y guiones' : 'Only lowercase letters, numbers and hyphens'}</small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">
                {locale === 'es' ? 'Descripción' : 'Description'} *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder={locale === 'es' 
                  ? 'Describe el contenido del paquete...' 
                  : 'Describe the package content...'
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                {locale === 'es' ? 'Categoría' : 'Category'} *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="maxExercises">
                {locale === 'es' ? 'Máximo de Ejercicios' : 'Maximum Exercises'}
              </label>
              <input
                id="maxExercises"
                type="number"
                value={formData.maxExercises}
                onChange={(e) => setFormData({ ...formData, maxExercises: parseInt(e.target.value) || 30 })}
                min={1}
                max={100}
              />
            </div>
          </div>

          {/* Media */}
          <div className="form-section">
            <h3>{locale === 'es' ? 'Multimedia' : 'Media'}</h3>
            
            <div className="form-group">
              <label htmlFor="image">
                {locale === 'es' ? 'URL de Imagen' : 'Image URL'}
              </label>
              <input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.png"
              />
              <small>{locale === 'es' ? 'Opcional: URL de la imagen de portada' : 'Optional: Cover image URL'}</small>
            </div>
          </div>

          {/* SEO */}
          <div className="form-section">
            <h3>{locale === 'es' ? 'SEO y Metadatos' : 'SEO & Metadata'}</h3>
            
            <div className="form-group">
              <label htmlFor="metaTitle">
                {locale === 'es' ? 'Meta Título' : 'Meta Title'}
              </label>
              <input
                id="metaTitle"
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder={locale === 'es' 
                  ? 'Título para motores de búsqueda' 
                  : 'Title for search engines'
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="metaDescription">
                {locale === 'es' ? 'Meta Descripción' : 'Meta Description'}
              </label>
              <textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={2}
                placeholder={locale === 'es' 
                  ? 'Descripción para motores de búsqueda' 
                  : 'Description for search engines'
                }
              />
            </div>
          </div>

          {/* Publishing Options */}
          <div className="form-section">
            <h3>{locale === 'es' ? 'Opciones de Publicación' : 'Publishing Options'}</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <span>{locale === 'es' ? 'Publicar paquete' : 'Publish package'}</span>
              </label>
              <small>{locale === 'es' 
                ? 'El paquete será visible para los estudiantes' 
                : 'Package will be visible to students'
              }</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>{locale === 'es' ? 'Paquete destacado' : 'Featured package'}</span>
              </label>
              <small>{locale === 'es' 
                ? 'Se mostrará en la sección de destacados' 
                : 'Will be shown in featured section'
              }</small>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose || (() => window.history.back())}
              className="btn btn--secondary"
              disabled={loading}
            >
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  {locale === 'es' ? 'Guardando...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="icon" />
                  {packageToEdit 
                    ? (locale === 'es' ? 'Actualizar Paquete' : 'Update Package')
                    : (locale === 'es' ? 'Crear Paquete' : 'Create Package')
                  }
                </>
              )}
            </button>
          </div>
        </form>
  );

  if (isModal) {
    if (!mounted) return null;

    const modal = (
      <div className="exercise-package-form-modal">
        <div className="exercise-package-form-modal__overlay" />
        <div className="exercise-package-form-modal__content">
          <div className="exercise-package-form-modal__header">
            <h2 className="title">
              {packageToEdit 
                ? (locale === 'es' ? 'Editar Paquete de Ejercicios' : 'Edit Exercise Package')
                : (locale === 'es' ? 'Crear Paquete de Ejercicios' : 'Create Exercise Package')
              }
            </h2>
            <button
              onClick={onClose}
              className="close-btn"
              aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
            >
              <X className="icon" />
            </button>
          </div>

          {formContent}
        </div>
      </div>
    );

    return createPortal(modal, document.body);
  }

  return (
    <div className="exercise-package-form-page">
      <div className="exercise-package-form-page__header">
        <h1 className="title">
          {packageToEdit 
            ? (locale === 'es' ? 'Editar Paquete de Ejercicios' : 'Edit Exercise Package')
            : (locale === 'es' ? 'Crear Paquete de Ejercicios' : 'Create Exercise Package')
          }
        </h1>
      </div>
      {formContent}
    </div>
  );
}