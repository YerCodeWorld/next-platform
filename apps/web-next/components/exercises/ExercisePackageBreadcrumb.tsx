'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ChevronRight, BookOpen, Star } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ExercisePackageBreadcrumbProps {
  title: string;
  subtitle: string;
  items: BreadcrumbItem[];
  locale: string;
}

export function ExercisePackageBreadcrumb({ 
  subtitle, 
  items, 
  locale 
}: ExercisePackageBreadcrumbProps) {
  return (
    <div className="exercise-breadcrumb">
      {/* Floating Elements */}
      <div className="exercise-breadcrumb__decorations">
        <div className="floating-shape floating-shape--1">
          <Image src="/images/shapes/shape1.png" alt="Planet" width={60} height={60} />
        </div>
        <div className="floating-shape floating-shape--2">
          <Image src="/images/shapes/shape3.png" alt="Notebook" width={50} height={50} />
        </div>
        <div className="floating-shape floating-shape--3">
          <Image src="/images/shapes/shape5.png" alt="Ruler" width={45} height={45} />
        </div>
        <div className="floating-shape floating-shape--4">
          <Image src="/images/shapes/shape7.png" alt="Shape" width={40} height={40} />
        </div>
        <div className="floating-shape floating-shape--5">
          <Image src="/images/shapes/shape9.png" alt="Shape" width={55} height={55} />
        </div>
      </div>

      {/* Main Content */}
      <div className="exercise-breadcrumb__content">
        {/* Navigation Trail */}
        <nav className="exercise-breadcrumb__nav" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            {items.map((item, index) => (
              <li key={index} className="breadcrumb-item">
                {item.href ? (
                  <Link href={item.href} className="breadcrumb-link">
                    {index === 0 && <Home className="home-icon" />}
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">
                    <BookOpen className="current-icon" />
                    {item.label}
                  </span>
                )}
                {index < items.length - 1 && (
                  <ChevronRight className="breadcrumb-separator" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="exercise-breadcrumb__hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-decoration">🎮</span>
              {locale === 'es' ? 'EduPráctica' : 'EduExercises'}
              <span className="title-decoration">🎯</span>
            </h1>
            <p className="hero-subtitle">{subtitle}</p>
            
            {/* Achievement Badges */}
            <div className="achievement-badges">
              <div className="badge badge--beginner">
                <Star className="badge-icon" />
                <span>{locale === 'es' ? 'Principiante' : 'Beginner'}</span>
              </div>
              <div className="badge badge--intermediate">
                <Star className="badge-icon" />
                <span>{locale === 'es' ? 'Intermedio' : 'Intermediate'}</span>
              </div>
              <div className="badge badge--advanced">
                <Star className="badge-icon" />
                <span>{locale === 'es' ? 'Avanzado' : 'Advanced'}</span>
              </div>
            </div>
          </div>

          {/* Notebook Paper Background */}
          <div className="notebook-paper">
            <div className="paper-holes">
              <div className="hole"></div>
              <div className="hole"></div>
              <div className="hole"></div>
              <div className="hole"></div>
            </div>
            <div className="red-margin-line"></div>
            <div className="blue-lines"></div>
          </div>
        </div>
      </div>
    </div>
  );
}