// components/exercises/CreateExercisePackageForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { useExercisePackagesApi } from '@repo/api-bridge';
import type { CreateExercisePackagePayload } from '@repo/api-bridge';
import { getCategoryLabel } from './utils/exerciseLabels';
import '@/styles/exercises/createForm.css';

interface CreateExercisePackageFormProps {
  locale: string;
  userData: {
    id: string;
    email: string;
    role: string;
  };
}

const CATEGORIES = [
  'GRAMMAR', 'VOCABULARY', 'READING', 'WRITING',
  'LISTENING', 'SPEAKING', 'CONVERSATION', 'GENERAL'
];


export function CreateExercisePackageForm({ locale, userData }: CreateExercisePackageFormProps) {
  const router = useRouter();
  const { createPackage, loading, error } = useExercisePackagesApi();
  
  const [formData, setFormData] = useState<CreateExercisePackagePayload>({
    title: '',
    description: '',
    slug: '',
    category: 'GENERAL',
    image: '',
    isPublished: false,
  });

  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
    
    // Auto-generate slug if it's empty or was auto-generated
    if (!formData.slug || isGeneratingSlug) {
      setIsGeneratingSlug(true);
      const newSlug = generateSlug(title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleSlugChange = (slug: string) => {
    setIsGeneratingSlug(false);
    setFormData(prev => ({ ...prev, slug: generateSlug(slug) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    try {
      // Ensure slug is set before submitting
      const payloadData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title)
      };
      
      const createdPackage = await createPackage(payloadData);
      
      // Redirect to the newly created package
      router.push(`/${locale}/exercises/${createdPackage.slug}`);
    } catch (err) {
      console.error('Failed to create package:', err);
    }
  };



  return (
    <div className="create-form-container">
      <form onSubmit={handleSubmit} className="create-form">
        {/* Main Form Card */}
        <div className="form-card">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              {locale === 'es' ? 'Título del Paquete' : 'Package Title'} *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={locale === 'es' ? 'Ej: Matemáticas Básicas' : 'e.g. Basic Mathematics'}
              className="form-input"
              required
            />
          </div>

          {/* Slug */}
          <div className="form-group">
            <label htmlFor="slug" className="form-label">
              {locale === 'es' ? 'URL Amigable (Slug)' : 'URL Slug'}
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={locale === 'es' ? 'matematicas-basicas' : 'basic-mathematics'}
              className="form-input"
            />
            <p className="form-help-text">
              {locale === 'es' 
                ? 'Se genera automáticamente del título. Usado en la URL del paquete.'
                : 'Auto-generated from title. Used in the package URL.'}
            </p>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {locale === 'es' ? 'Descripción' : 'Description'} *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={locale === 'es' 
                ? 'Describe qué aprenderán los estudiantes con este paquete...'
                : 'Describe what students will learn from this package...'}
              rows={4}
              className="form-textarea"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              {locale === 'es' ? 'Categoría' : 'Category'}
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="form-select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category, locale)}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label htmlFor="coverImage" className="form-label">
              {locale === 'es' ? 'Imagen de Portada (URL)' : 'Cover Image (URL)'}
            </label>
            <div className="image-input-group">
              <input
                type="url"
                id="coverImage"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="image-input"
              />
              <button
                type="button"
                className="upload-button"
                title={locale === 'es' ? 'Subir imagen' : 'Upload image'}
              >
                <Upload className="icon" />
              </button>
            </div>
            <p className="form-help-text">
              {locale === 'es' 
                ? 'Opcional. Proporciona una URL de imagen o súbela.'
                : 'Optional. Provide an image URL or upload one.'}
            </p>
          </div>

          {/* Published Status */}
          <div className="checkbox-group">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="checkbox-input"
              />
              <span className="checkbox-label">
                {locale === 'es' ? 'Publicar inmediatamente' : 'Publish immediately'}
              </span>
            </label>
            <p className="form-help-text" style={{ marginLeft: '28px' }}>
              {locale === 'es' 
                ? 'Si no está marcado, el paquete se guardará como borrador.'
                : 'If unchecked, the package will be saved as a draft.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p className="error-text">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <Link
            href={`/${locale}/exercises`}
            className="back-link"
          >
            <ArrowLeft className="icon" />
            {locale === 'es' ? 'Volver' : 'Back'}
          </Link>

          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim()}
            className={`submit-button ${loading ? 'form-loading' : ''}`}
          >
            <Save className="icon" />
            {loading 
              ? (locale === 'es' ? 'Creando...' : 'Creating...') 
              : (locale === 'es' ? 'Crear Paquete' : 'Create Package')
            }
          </button>
        </div>
      </form>
    </div>
  );
}