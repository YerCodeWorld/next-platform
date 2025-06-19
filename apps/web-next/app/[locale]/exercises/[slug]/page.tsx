import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getExercisePackageBySlug, getPackageExercises } from '@/lib/api-server';
import ExerciseLevelsDisplay from '@/components/exercises/ExerciseLevelsDisplay';

export default async function ExercisePackagePage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;
  const userData = await getCurrentUser();
  // Fetch the package data
  let packageData;
  let exercises;
  
  try {
    packageData = await getExercisePackageBySlug(slug);
    if (!packageData) {
      notFound();
    }
    
    // Fetch exercises for this package
    exercises = await getPackageExercises(packageData.id);
  } catch (error) {
    console.error('Failed to fetch package or exercises:', error);
    notFound();
  }

  return (
    <div className="exercise-levels-page">
      <ExerciseLevelsDisplay 
        package={packageData}
        exercises={exercises}
        locale={locale}
        userData={userData}
      />
    </div>
  );
}