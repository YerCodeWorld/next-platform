'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, ArrowLeft } from 'lucide-react';
import { ExercisePackage, PackageExercise, User, ExerciseDifficulty, useExercisePackagesApi, UserProgress } from '@repo/api-bridge';
import { ExerciseBuilderModal } from './ExerciseBuilderModal';
import { ExerciseDifficultyModal } from './ExerciseDifficultyModal';
import { useRouter } from 'next/navigation';
import { useSounds } from '../../utils/sounds';

interface ExerciseLevelsDisplayProps {
  package: ExercisePackage;
  exercises: PackageExercise[];
  locale: string;
  userData?: User | null;
}

interface LevelData {
  key: string;
  title: string;
  color: string;
  exercises: PackageExercise[];
  info: string;
}

const DIFFICULTY_LEVELS = [
  { key: 'BEGINNER', title: 'Beginner', color: '#00bf63' },
  { key: 'UPPER_BEGINNER', title: 'Upper Beginner', color: '#aed768' },
  { key: 'INTERMEDIATE', title: 'Intermediate', color: '#f8a8c5' },
  { key: 'UPPER_INTERMEDIATE', title: 'Upper Intermediate', color: '#ffde59' },
  { key: 'ADVANCED', title: 'Advanced', color: '#ff914d' },
  { key: 'SUPER_ADVANCED', title: 'Super Advanced', color: '#ff3131' },
];

const MESSAGES = {
  en: [
    "Keep practicing daily!",
    "Try one more exercise.",
    "Consistency is key.",
    "Small steps lead to big gains.",
    "Practice makes perfect!",
    "Challenge yourself today.",
    "Review yesterday's mistakes.",
    "Stay focused and keep going.",
    "You're improving every day!",
    "Don't give up—try again!"
  ],
  es: [
    "¡Practica diariamente!",
    "Intenta un ejercicio más.",
    "La constancia es clave.",
    "Pequeños pasos llevan a grandes logros.",
    "¡La práctica hace al maestro!",
    "Desafíate hoy.",
    "Revisa los errores de ayer.",
    "Mantente enfocado y continúa.",
    "¡Mejoras cada día!",
    "¡No te rindas, inténtalo de nuevo!"
  ]
};

export default function ExerciseLevelsDisplay({ 
  package: pkg,
  exercises,
  locale,
  userData
}: ExerciseLevelsDisplayProps) {
  const [speechMessage, setSpeechMessage] = useState(locale === 'es' ? '¡Bienvenido!' : 'Welcome!');
  const [focusedLevel, setFocusedLevel] = useState<string | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | undefined>(undefined);
  const [exerciseData, setExerciseData] = useState(exercises);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficultyForModal, setSelectedDifficultyForModal] = useState<ExerciseDifficulty | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const animationTimeouts = useRef<NodeJS.Timeout[]>([]);
  
  const exercisePackagesApi = useExercisePackagesApi();
  const router = useRouter();
  const { initializeSounds, playClick, playHover, playNavigation } = useSounds();

  // Group exercises by difficulty
  const exercisesByDifficulty = exerciseData.reduce((acc, exercise) => {
    const difficulty = exercise.difficulty || 'BEGINNER';
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(exercise);
    return acc;
  }, {} as Record<string, PackageExercise[]>);

  // Create level data with exercises
  const levelData: LevelData[] = DIFFICULTY_LEVELS.map(level => ({
    ...level,
    title: locale === 'es' ? translateLevel(level.title) : level.title,
    exercises: exercisesByDifficulty[level.key] || [],
    info: locale === 'es' 
      ? `Información del nivel ${translateLevel(level.title)}...`
      : `${level.title} level info...`
  }));

  // Initialize sounds on mount
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // Fetch user progress on component mount and when user changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProgress = async () => {
      if (userData && userData.email && pkg.id) {
        try {
          const progress = await exercisePackagesApi.getUserProgress(pkg.id, userData.email);
          if (isMounted) {
            setUserProgress(progress);
          }
        } catch (error) {
          console.error('Error fetching user progress:', error);
          if (isMounted) {
            setUserProgress(null);
          }
          // Don't block the UI if API is unavailable
        }
      } else if (isMounted) {
        setUserProgress(null);
      }
    };

    fetchUserProgress();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg.id, userData?.email]); // Only depend on stable primitive values, exercisePackagesApi would cause infinite loops

  // Cycle through messages
  useEffect(() => {
    const messages = locale === 'es' ? MESSAGES.es : MESSAGES.en;
    
    const cycleMessages = () => {
      const idx = Math.floor(Math.random() * messages.length);
      setSpeechMessage('');
      
      setTimeout(() => {
        setSpeechMessage(messages[idx]);
      }, 300);
    };

    const interval = setInterval(cycleMessages, 10000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [locale]);

  // Cleanup animation timeouts
  useEffect(() => {
    const timeouts = animationTimeouts.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  function translateLevel(level: string): string {
    const translations: Record<string, string> = {
      'Beginner': 'Principiante',
      'Upper Beginner': 'Principiante Superior',
      'Intermediate': 'Intermedio',
      'Upper Intermediate': 'Intermedio Superior',
      'Advanced': 'Avanzado',
      'Super Advanced': 'Super Avanzado'
    };
    return translations[level] || level;
  }

  // Calculate completion count for a difficulty level
  const getCompletionCount = (exercises: PackageExercise[]): number => {
    if (!userProgress || !userProgress.completedExercises || !Array.isArray(userProgress.completedExercises)) {
      return 0;
    }
    
    return exercises.filter(exercise => 
      userProgress.completedExercises.includes(exercise.id)
    ).length;
  };

  const handleCardClick = (levelKey: string) => {
    playClick();
    setFocusedLevel(levelKey);
    setSelectedDifficultyForModal(levelKey as ExerciseDifficulty);
    setShowDifficultyModal(true);
  };

  const handleStartClick = (levelKey: string) => {
    playClick();
    setSelectedDifficultyForModal(levelKey as ExerciseDifficulty);
    setShowDifficultyModal(true);
  };

  const handleInfoClick = (e: React.MouseEvent, info: string) => {
    e.stopPropagation();
    alert(info);
  };

  const handleMainPlusClick = () => {
    setSelectedDifficulty(undefined);
    setShowExerciseModal(true);
  };

  const handleLevelPlusClick = (e: React.MouseEvent, difficulty: ExerciseDifficulty) => {
    e.stopPropagation();
    setSelectedDifficulty(difficulty);
    setShowExerciseModal(true);
  };

  const refreshExercises = async () => {
    try {
      const updatedExercises = await exercisePackagesApi.getPackageExercises(pkg.id);
      setExerciseData(updatedExercises);
    } catch (error) {
      console.error('Error refreshing exercises:', error);
    }
  };

  const handleExerciseCreated = async () => {
    console.log('Exercise created/updated successfully!');
    await refreshExercises();
  };

  const handleBackToPackages = () => {
    playNavigation();
    router.push(`/${locale}/exercises`);
  };

  return (
    <div className="exercise-levels">
      <div className="exercise-levels__container">
        {/* Character with Speech Bubble */}
        <div className="character-container">
          <Image
            src="/images/chars/char-isabel-talking.png"
            alt="Isabel character"
            width={100}
            height={100}
            className="char-img"
          />
          <div className="speech-bubble">
            {speechMessage}
          </div>
        </div>

        {/* Header */}
        <div className="header-wrapper">
          <div className="header-bg"></div>
          <div className="header">{pkg.title.toUpperCase()}</div>
        </div>

        {/* Back to Packages Button */}
        <button 
          className="back-to-packages-btn"
          onClick={handleBackToPackages}
          title={locale === 'es' ? 'Volver a paquetes' : 'Back to packages'}
        >
          <ArrowLeft />
          <span>{locale === 'es' ? 'VOLVER A PAQUETES' : 'BACK TO PACKAGES'}</span>
        </button>

        {/* Level Cards Grid */}
        <div className="cards">
          {levelData.map((level, index) => (
            <LevelCard
              key={level.key}
              level={level}
              locale={locale}
              userData={userData}
              isFocused={focusedLevel === level.key}
              onClick={() => handleCardClick(level.key)}
              onInfoClick={(e) => handleInfoClick(e, level.info)}
              onPlusClick={(e) => handleLevelPlusClick(e, level.key as ExerciseDifficulty)}
              onStartClick={() => handleStartClick(level.key)}
              onHover={() => playHover()}
              animationDelay={index * 200}
              getCompletionCount={getCompletionCount}
            />
          ))}
        </div>

        {/* Main Floating Plus Button */}
        {userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER') && (
          <button 
            className="main-plus-btn"
            onClick={handleMainPlusClick}
            title={locale === 'es' ? 'Crear nuevo ejercicio' : 'Create new exercise'}
          >
            <Plus />
          </button>
        )}

        {/* Exercise Builder Modal */}
        <ExerciseBuilderModal
          isOpen={showExerciseModal}
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedDifficulty(undefined);
          }}
          package={pkg}
          difficulty={selectedDifficulty}
          locale={locale}
          userData={userData}
          onExerciseCreated={handleExerciseCreated}
        />

        {/* Exercise Difficulty Modal */}
        {selectedDifficultyForModal && (
          <ExerciseDifficultyModal
            isOpen={showDifficultyModal}
            onClose={() => {
              setShowDifficultyModal(false);
              setSelectedDifficultyForModal(null);
            }}
            package={pkg}
            difficulty={selectedDifficultyForModal}
            exercises={exercisesByDifficulty[selectedDifficultyForModal] || []}
            locale={locale}
            userData={userData}
            onExerciseUpdated={handleExerciseCreated}
          />
        )}
      </div>
    </div>
  );
}

interface LevelCardProps {
  level: LevelData;
  locale: string;
  userData?: User | null;
  isFocused: boolean;
  onClick: () => void;
  onInfoClick: (e: React.MouseEvent) => void;
  onPlusClick: (e: React.MouseEvent) => void;
  onStartClick: () => void;
  onHover: () => void;
  animationDelay: number;
  getCompletionCount: (exercises: PackageExercise[]) => number;
}

function LevelCard({ 
  level, 
  locale, 
  userData,
  isFocused, 
  onClick, 
  onInfoClick,
  onPlusClick,
  onStartClick,
  onHover,
  animationDelay,
  getCompletionCount
}: LevelCardProps) {
  const cardBgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Spinning animation
  useEffect(() => {
    const scheduleSpin = () => {
      const delay = 5000 + Math.random() * 10000;
      
      const timeout = setTimeout(() => {
        if (!cardRef.current || !cardBgRef.current) return;
        
        const cardRect = cardRef.current.getBoundingClientRect();
        const diameter = Math.min(cardRect.width, cardRect.height);
        const offset = 10;
        const newTop = offset + (cardRect.height - diameter) / 2;
        const newLeft = offset + (cardRect.width - diameter) / 2;

        const bg = cardBgRef.current;
        bg.style.width = `${diameter}px`;
        bg.style.height = `${diameter}px`;
        bg.style.top = `${newTop}px`;
        bg.style.left = `${newLeft}px`;
        bg.style.borderRadius = '50%';
        bg.classList.add('spin');

        const handleAnimationEnd = () => {
          bg.classList.remove('spin');
          bg.style.width = '';
          bg.style.height = '';
          bg.style.top = '10px';
          bg.style.left = '10px';
          bg.style.borderRadius = '12px';
          bg.removeEventListener('animationend', handleAnimationEnd);
          scheduleSpin();
        };

        bg.addEventListener('animationend', handleAnimationEnd);
      }, delay);

      return timeout;
    };

    const initialTimeout = setTimeout(scheduleSpin, 1000 + animationDelay);
    
    return () => {
      clearTimeout(initialTimeout);
    };
  }, [animationDelay]);

  const completedCount = getCompletionCount(level.exercises);
  const progress = `${completedCount}/${level.exercises.length}`;
  const actionText = locale === 'es' ? 'Empezar' : 'Start';

  return (
    <div 
      className={`card-wrapper ${level.key.toLowerCase().replace('_', '-')} ${isFocused ? 'focused' : ''}`}
      style={{ '--color': level.color } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div 
        ref={cardBgRef}
        className="card-bg" 
        style={{ background: level.color }}
      />
      
      <div ref={cardRef} className="card">
        <div className="card-title">{level.title}</div>
        
        {/* Plus Button for Admins/Teachers */}
        {userData && (userData.role === 'ADMIN' || userData.role === 'TEACHER') && (
          <button 
            className="level-plus-btn"
            onClick={onPlusClick}
            title={locale === 'es' ? `Crear ejercicio ${level.title}` : `Create ${level.title} exercise`}
          >
            <Plus />
          </button>
        )}
        
        <div 
          className="info-btn"
          title={locale === 'es' ? 'Click para información' : 'Click for info'}
          onClick={onInfoClick}
        >
          i
        </div>

        <div className="pill-level">
          {locale === 'es' ? 'Nivel' : 'Level'}
        </div>

        <hr className="decor-line" />

        <div className="progress-text">{progress}</div>

        <button 
          className="pill-action"
          onClick={(e) => {
            e.stopPropagation();
            onStartClick();
          }}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}