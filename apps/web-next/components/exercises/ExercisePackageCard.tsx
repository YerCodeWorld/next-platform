'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Edit, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ExercisePackage } from '@repo/api-bridge';

interface ExercisePackageCardProps {
  package: ExercisePackage;
  locale: string;
  isLoggedIn: boolean;
  canEdit?: boolean;
  completionRate?: number;
}

export function ExercisePackageCard({ 
  package: pkg,
  locale, 
  isLoggedIn,
  canEdit,
  completionRate = 0
}: ExercisePackageCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  // Get category CSS class for the card background
  const getCategoryClass = (category: string) => {
    const classes: Record<string, string> = {
      GRAMMAR: 'notebook-card--grammar',
      VOCABULARY: 'notebook-card--vocabulary', 
      READING: 'notebook-card--reading',
      WRITING: 'notebook-card--writing',
      LISTENING: 'notebook-card--listening',
      SPEAKING: 'notebook-card--speaking',
      CONVERSATION: 'notebook-card--conversation',
      GENERAL: 'notebook-card--general',
    };
    return classes[category] || 'notebook-card--general';
  };

  // Get the package color based on its position (matching nth-child colors)
  const getPackageColor = () => {
    const colors = [
      '#FFE5E5', // Pastel Pink
      '#E5F3FF', // Pastel Blue
      '#E5FFE5', // Pastel Green
      '#FFF5E5', // Pastel Orange
      '#F5E5FF', // Pastel Purple
      '#FFFFE5', // Pastel Yellow
      '#E5FFF5', // Pastel Teal
      '#FFE5F5', // Pastel Rose
    ];
    // Use a simple hash of the package ID to get a consistent color
    const hash = pkg.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Character image clicked, showTooltip:', !showTooltip);
    setShowTooltip(!showTooltip);
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotesModal(true);
  };

  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.character-image') && !target.closest('.tooltip')) {
        setShowTooltip(false);
      }
    };
    
    if (showTooltip) {
      document.addEventListener('click', handleDocumentClick, { capture: true });
      return () => {
        document.removeEventListener('click', handleDocumentClick, { capture: true });
      };
    }
  }, [showTooltip]);

  return (
    <div className="notebook-card-container">
      {/* 3D Background Shadow */}
      <div className={`notebook-card-background ${getCategoryClass(pkg.category)}`} />
      
      {/* Main Card */}
      <div className="notebook-card">
        {/* Red line for notebook effect */}
        <div className="notebook-line" />
        
        {/* Top Header Section with Package Image */}
        <div 
          className="notebook-card__header"
          style={{
            backgroundImage: pkg.image ? `url(${pkg.image})` : undefined
          }}
        >
          {canEdit && (
            <button
              className="edit-btn"
              aria-label={locale === 'es' ? 'Editar paquete' : 'Edit package'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('openEditPackageModal', { detail: pkg }));
              }}
            >
              <Edit className="edit-icon" />
            </button>
          )}
          
          {/* Package Image */}
          {pkg.image && (
            <div className="package-image">
              <Image
                src={pkg.image}
                alt={pkg.title}
                width={60}
                height={40}
                className="package-img"
              />
            </div>
          )}
          
          <button className="notes-icon" onClick={handleNotesClick} aria-label={locale === 'es' ? 'Ver notas' : 'View notes'}>
            <BookOpen className="notebook-icon" />
          </button>
        </div>

        {/* Title with line breaks for long text */}
        <div className="notebook-card__title">
          {pkg.title.length > 25 ? (
            <>
              {pkg.title.split(' ').reduce((acc: string[], word: string, index: number) => {
                if (index === 0) return [word];
                const lastLine = acc[acc.length - 1];
                if (lastLine && lastLine.length + word.length + 1 <= 25) {
                  acc[acc.length - 1] = lastLine + ' ' + word;
                } else {
                  acc.push(word);
                }
                return acc;
              }, []).map((line: string, index: number) => (
                <div key={index} className="title-line">{line}</div>
              ))}
            </>
          ) : (
            pkg.title
          )}
        </div>

        {/* Exercise Count */}
        <div className="notebook-card__exercises">
          <span>{locale === 'es' ? 'Ejercicios' : 'Exercises'}</span>
          <span className="exercise-count">{pkg.exerciseCount || 0}</span>
        </div>

        {/* Progress Section with Character */}
        <div className="notebook-card__progress-section">
          <div className="character-image" onClick={handleImageClick}>
            <Image
              src="/images/chars/char-isabel-talking.png"
              alt="Isabel character"
              width={80}
              height={80}
              className="character-img"
            />
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="tooltip">
                {pkg.description || (locale === 'es' 
                  ? 'Este paquete te ayudará a mejorar tus habilidades en inglés!' 
                  : 'This package will help you improve your English skills!')}
              </div>
            )}
          </div>

          {/* Progress Label and Bar or Login Button */}
          {isLoggedIn ? (
            <>
              <div className="progress-label">
                {locale === 'es' ? 'Progreso' : 'Progress'}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    '--progress-width': `${completionRate}%`,
                    animationDelay: '0.5s'
                  } as React.CSSProperties}
                />
              </div>
            </>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="login-btn"
            >
              {locale === 'es' ? 'Iniciar Sesión' : 'Log In'}
            </Link>
          )}
        </div>

        {/* Play Button */}
        <Link
          href={`/${locale}/exercises/${pkg.slug}`}
          className="notebook-card__play-button"
        >
          <div className="play-icon" />
        </Link>
      </div>

      {/* Modal Portal */}
      <NotesModal 
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        package={pkg}
        locale={locale}
        accentColor={getPackageColor()}
      />
    </div>
  );
}

// Notes Modal Component with Portal
interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: ExercisePackage;
  locale: string;
  accentColor: string;
}

function NotesModal({ isOpen, onClose, package: pkg, locale, accentColor }: NotesModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modal = (
    <div className="package-notes-modal">
      <div className="package-notes-modal__backdrop" onClick={onClose} />
      <div 
        className="package-notes-modal__content"
        style={{
          '--modal-accent-color': accentColor
        } as React.CSSProperties}
      >
        <div className="package-notes-modal__header">
          <h3 className="package-notes-modal__title">
            <BookOpen className="icon" />
            {locale === 'es' ? 'Notas del Paquete' : 'Package Notes'}
          </h3>
          <button
            className="package-notes-modal__close"
            onClick={onClose}
            aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <X />
          </button>
        </div>
        
        <div className="package-notes-modal__body">
          <h4 className="package-title">{pkg.title}</h4>
          
          {/* Placeholder for notes content */}
          <div className="package-notes-placeholder">
            <div className="placeholder-icon">📝</div>
            <p className="placeholder-text">
              {locale === 'es' 
                ? 'Este paquete aún no tiene notas.' 
                : 'This package has no notes yet.'}
            </p>
            <p className="placeholder-subtext">
              {locale === 'es' 
                ? 'Las notas del profesor aparecerán aquí para ayudarte con los ejercicios.' 
                : 'Teacher notes will appear here to help you with the exercises.'}
            </p>
          </div>
          
          {/* Future: Tiptap rendered content will go here */}
        </div>
      </div>
    </div>
  );

  // Render to body using portal
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}