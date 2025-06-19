'use client';
import React, { useState } from 'react';
import { Exercise, ExercisePackage, User } from '@repo/api-bridge';
import { MultipleChoiceDisplay } from './displays/MultipleChoiceDisplay';
import { FillBlanksDisplay } from './displays/FillBlanksDisplay';
import { OrderingDisplay } from './displays/OrderingDisplay';
import { MatchingDisplay } from './displays/MatchingDisplay';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ExercisePracticeDisplayProps {
  exercise: Exercise;
  package: ExercisePackage;
  locale: string;
  userData?: User | null;
}

export default function ExercisePracticeDisplay({
  exercise,
  package: pkg,
  locale,
  userData
}: ExercisePracticeDisplayProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = (correct: boolean) => {
    setIsCompleted(true);
    
    if (correct) {
      toast.success(locale === 'es' ? '¡Correcto! ¡Bien hecho! 🎉' : 'Correct! Well done! 🎉');
    } else {
      toast.error(locale === 'es' ? 'No del todo correcto. ¡Inténtalo de nuevo!' : 'Not quite right. Try again!');
    }
  };

  const handleGoBack = () => {
    router.push(`/${locale}/exercises/${pkg.slug}`);
  };

  const renderExerciseDisplay = () => {
    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceDisplay
            exercise={exercise}
            package={pkg}
            locale={locale}
            userData={userData}
            onComplete={handleComplete}
          />
        );
      case 'FILL_BLANK':
        return (
          <FillBlanksDisplay
            exercise={exercise}
            package={pkg}
            locale={locale}
            userData={userData}
            onComplete={handleComplete}
          />
        );
      case 'ORDERING':
        return (
          <OrderingDisplay
            exercise={exercise}
            package={pkg}
            locale={locale}
            userData={userData}
            onComplete={handleComplete}
          />
        );
      case 'MATCHING':
        return (
          <MatchingDisplay
            exercise={exercise}
            package={pkg}
            locale={locale}
            userData={userData}
            onComplete={handleComplete}
          />
        );
      default:
        return (
          <div className="exercise-practice-error">
            <h2>{locale === 'es' ? 'Error' : 'Error'}</h2>
            <p>
              {locale === 'es' 
                ? 'Tipo de ejercicio desconocido.' 
                : 'Unknown exercise type.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="exercise-practice-container">
      {/* Header with back button */}
      <div className="exercise-practice-header">
        <button 
          className="back-button"
          onClick={handleGoBack}
          aria-label={locale === 'es' ? 'Volver' : 'Go back'}
        >
          <ArrowLeft className="back-icon" />
          <span>{locale === 'es' ? 'Volver' : 'Back'}</span>
        </button>
        
        <div className="exercise-info">
          <h1 className="exercise-title">{exercise.title}</h1>
          <div className="exercise-meta">
            <span className="package-name">{pkg.title}</span>
            <span className="difficulty">{exercise.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Exercise content */}
      <div className="exercise-practice-content">
        {renderExerciseDisplay()}
        
        {/* Completion indicator */}
        {isCompleted && (
          <div className="exercise-completion-badge">
            <span>🎉 {locale === 'es' ? 'Ejercicio completado!' : 'Exercise completed!'}</span>
          </div>
        )}
      </div>
    </div>
  );
}