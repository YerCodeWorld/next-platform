import { getCurrentUser } from '@/lib/auth';
import { getAllExercisePackages } from '@/lib/api-server';
import { ExercisePackageBreadcrumb } from '@/components/exercises/ExercisePackageBreadcrumb';
import ExercisePackagesGridWrapper from '@/components/exercises/ExercisePackagesGridWrapper';
import ExerciseStatsWrapper from '@/components/exercises/ExerciseStatsWrapper';

// Import the SCSS styling system
import '@repo/components/globals.scss';

export default async function ExercisesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const userData = await getCurrentUser();
  
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
        title="EduExercises / EduPráctica"
        subtitle="Practice English with Interactive Exercise Packages"
        items={[
          { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
          { label: locale === 'es' ? 'Ejercicios' : 'Exercises' }
        ]}
        locale={locale}
      />
      
      {/* Filters & Search */}
      <ExercisePackagesGridWrapper 
        packages={packages} 
        locale={locale}
        userData={userData}
      />
      
      {/* Statistics */}
      <ExerciseStatsWrapper packages={packages} />
    </div>
  );
}