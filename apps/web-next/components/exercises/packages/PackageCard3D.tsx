'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExercisePackage } from '@repo/db';
import { User } from '@/lib/auth';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/cards-3d.css';

interface PackageCard3DProps {
  package: ExercisePackage;
  userData?: User | null;
  locale: string;
  progress?: {
    completedExercises: string[];
    totalExercises: number;
    completionRate: number;
  };
}

const difficultyColors = {
  BEGINNER: 'beginner',
  ELEMENTARY: 'elementary', 
  INTERMEDIATE: 'intermediate',
  UPPER_INTERMEDIATE: 'upper-intermediate',
  ADVANCED: 'advanced',
  SUPER_ADVANCED: 'super-advanced'
};

const difficultyLabels = {
  en: {
    BEGINNER: 'Beginner',
    ELEMENTARY: 'Elementary',
    INTERMEDIATE: 'Intermediate', 
    UPPER_INTERMEDIATE: 'Upper Int.',
    ADVANCED: 'Advanced',
    SUPER_ADVANCED: 'Expert'
  },
  es: {
    BEGINNER: 'Principiante',
    ELEMENTARY: 'Elemental',
    INTERMEDIATE: 'Intermedio',
    UPPER_INTERMEDIATE: 'Inter. Alto',
    ADVANCED: 'Avanzado', 
    SUPER_ADVANCED: 'Experto'
  }
};

const categoryIcons = {
  GRAMMAR: '📚',
  VOCABULARY: '💬',
  LISTENING: '👂',
  READING: '📖',
  WRITING: '✍️',
  SPEAKING: '🗣️',
  PRONUNCIATION: '🔊',
  GENERAL: '🎯'
};

export default function PackageCard3D({ 
  package: pkg, 
  userData, 
  locale, 
  progress 
}: PackageCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const completionRate = progress?.completionRate || 0;
  const totalExercises = pkg.exerciseCount || 0;
  const completedCount = progress?.completedExercises?.length || 0;
  
  // Calculate SVG circle progress
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const difficultyLabel = difficultyLabels[locale as 'en' | 'es']?.[pkg.difficulty] || 
                         difficultyLabels.en[pkg.difficulty];
  
  const categoryIcon = categoryIcons[pkg.category as keyof typeof categoryIcons] || categoryIcons.GENERAL;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on link or button
    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const practiceText = locale === 'es' ? 'Practicar' : 'Practice';
  const exercisesText = locale === 'es' ? 'ejercicios' : 'exercises';
  const completedText = locale === 'es' ? 'Completado' : 'Completed';
  const startText = locale === 'es' ? 'Comenzar' : 'Start';

  return (
    <div className="card-3d-container">
      <div 
        className={`card-3d card-3d-float ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCardClick}
      >
        {/* Background Layers for 3D Effect */}
        <div className="card-3d-layer card-3d-bg-1" />
        <div className="card-3d-layer card-3d-bg-2" />
        
        {/* Main Card Content */}
        <div className="card-3d-content">
          {/* Difficulty Badge */}
          <div className={`card-3d-difficulty ${difficultyColors[pkg.difficulty]}`}>
            {difficultyLabel}
          </div>

          {/* Card Header */}
          <div className="card-3d-header">
            <div className="card-3d-category">
              {categoryIcon}
            </div>
            <h3 className="heading-4 mb-2">{pkg.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {pkg.description || `${totalExercises} ${exercisesText}`}
            </p>
          </div>

          {/* Card Body */}
          <div className="card-3d-body">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">
                  {completedCount}/{totalExercises}
                </span>
                <br />
                <span className="text-gray-500">{exercisesText}</span>
              </div>
              
              {/* Progress Ring */}
              <div className="card-3d-progress">
                <svg className="card-3d-progress-ring" viewBox="0 0 60 60">
                  <circle
                    className="card-3d-progress-circle card-3d-progress-circle-bg"
                    cx="30"
                    cy="30"
                    r={radius}
                  />
                  <circle
                    className="card-3d-progress-circle card-3d-progress-circle-fill"
                    cx="30"
                    cy="30"
                    r={radius}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="card-3d-progress-text">
                  {Math.round(completionRate)}%
                </div>
              </div>
            </div>

            {pkg.tags && pkg.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pkg.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="badge badge-primary text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {pkg.tags.length > 3 && (
                  <span className="badge badge-primary text-xs">
                    +{pkg.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="card-3d-footer">
            <div className="text-xs text-gray-500">
              {completionRate > 0 ? completedText : startText}
            </div>
            
            <Link 
              href={`/${locale}/exercises/${pkg.slug}`}
              className="btn btn-primary btn-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {practiceText}
            </Link>
          </div>

          {/* Hover Content Overlay */}
          <div className="card-3d-hover-content">
            <h4 className="text-xl font-semibold mb-3 text-center">{pkg.title}</h4>
            <p className="text-sm text-center mb-4 opacity-90">
              {pkg.description || `${totalExercises} ${exercisesText} • ${difficultyLabel}`}
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-xs opacity-75">{completedText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalExercises}</div>
                <div className="text-xs opacity-75">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                <div className="text-xs opacity-75">Progress</div>
              </div>
            </div>

            <Link 
              href={`/${locale}/exercises/${pkg.slug}`}
              className="btn btn-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              {practiceText} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}