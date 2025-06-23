import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { getAllExercisePackages } from '@/lib/api-server';
import { ExercisePackageBreadcrumb } from '@/components/exercises/ExercisePackageBreadcrumb';
import ExercisePackagesGridWrapper from '@/components/exercises/ExercisePackagesGridWrapper';
import ExerciseStatsWrapper from '@/components/exercises/ExerciseStatsWrapper';
import { getTranslations } from 'next-intl/server';
import { generateSEOMetadata } from '@/lib/seo-utils';

// Import the SCSS styling system
import '@repo/components/globals.scss';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'es'
    ? 'EduEjercicios - Ejercicios Interactivos de Inglés'
    : 'EduExercises - Interactive English Exercises';
  
  const description = locale === 'es'
    ? 'Practica inglés con ejercicios interactivos diseñados por educadores expertos. Mejora tu gramática, vocabulario y comprensión con actividades gamificadas.'
    : 'Practice English with interactive exercises designed by expert educators. Improve your grammar, vocabulary, and comprehension with gamified activities.';

  return generateSEOMetadata({
    title,
    description,
    contentType: 'exercises',
    locale,
    canonical: `/${locale}/exercises`,
  });
}

export default async function ExercisesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [userData, t] = await Promise.all([
    getCurrentUser(),
    getTranslations('exercises')
  ]);

  // Extract translation values to pass to client component
  const translations = {
    pageTitle: t('pageTitle'),
    hero: {
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
      searchPlaceholder: t('hero.searchPlaceholder')
    },
    categories: {
      all: t('hero.categories.all')
    },
    card: {
      startNow: t('card.startNow')
    },
    empty: {
      title: t('empty.title'),
      subtitle: t('empty.subtitle')
    }
  };
  
  // Fetch real data from populated database
  let packages;
  try {
    packages = await getAllExercisePackages();
  } catch (error) {
    console.error('Failed to fetch exercise packages:', error);
    packages = [];
  }

  return (
    <div className="exercise-packages__container">
      {/* Custom Game-Oriented Breadcrumb */}
      <ExercisePackageBreadcrumb 
        title={translations.pageTitle}
        subtitle={translations.hero.subtitle}
        items={[
          { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
          { label: translations.hero.title }
        ]}
        locale={locale}
      />
      
      {/* Filters & Search */}
      <ExercisePackagesGridWrapper 
        packages={packages} 
        locale={locale}
        userData={userData}
        translations={translations}
      />
      
      {/* Statistics */}
      <ExerciseStatsWrapper packages={packages} />
    </div>
  );
}