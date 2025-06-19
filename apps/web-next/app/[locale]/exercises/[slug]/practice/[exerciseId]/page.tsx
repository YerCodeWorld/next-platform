import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getExercisePackageBySlug, getExerciseById } from '@/lib/api-server';
import ExercisePracticeDisplay from '@/components/exercises/ExercisePracticeDisplay';

export default async function ExercisePracticePage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string; exerciseId: string }> 
}) {
  const { locale, slug, exerciseId } = await params;
  const userData = await getCurrentUser();
  
  // Fetch the package and exercise data
  let packageData;
  let exerciseData;
  
  try {
    packageData = await getExercisePackageBySlug(slug);
    if (!packageData) {
      notFound();
    }
    
    // Fetch the specific exercise
    exerciseData = await getExerciseById(exerciseId);
    if (!exerciseData) {
      notFound();
    }
  } catch (error) {
    console.error('Failed to fetch package or exercise:', error);
    notFound();
  }

  return (
    <div className="exercise-practice-page">
      <ExercisePracticeDisplay 
        exercise={exerciseData}
        package={packageData}
        locale={locale}
        userData={userData}
      />
    </div>
  );
}