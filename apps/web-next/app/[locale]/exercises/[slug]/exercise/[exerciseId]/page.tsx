import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getExerciseById, getExercisePackageBySlug, getPackageExercises } from '@/lib/api-server';
import ExercisePractice from '@/components/exercises/practice/ExercisePractice';
// Error boundary temporarily removed for build
import type { Metadata } from 'next';

interface ExercisePageProps {
  params: Promise<{
    locale: string;
    slug: string;
    exerciseId: string;
  }>;
}

export async function generateMetadata({ params }: ExercisePageProps): Promise<Metadata> {
  const { slug, exerciseId } = await params;
  
  try {
    const [exercisePackage, exercise] = await Promise.all([
      getExercisePackageBySlug(slug),
      getExerciseById(exerciseId)
    ]);
    
    return {
      title: `${exercise.title} - ${exercisePackage.title} | EduExercises`,
      description: exercise.instructions || `Complete the ${exercise.title} exercise in ${exercisePackage.title} package.`,
      keywords: `exercise, ${exercise.type.toLowerCase()}, ${exercise.difficulty.toLowerCase()}, ${exercise.category.toLowerCase()}, learning`,
      robots: 'noindex, nofollow', // Don't index individual exercise pages
    };
  } catch {
    return {
      title: 'Exercise Not Found | EduExercises',
      description: 'The requested exercise could not be found.',
    };
  }
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { locale, slug, exerciseId } = await params;
  const userData = await getCurrentUser();

  let exercise;
  let exercisePackage;
  let exercises;

  try {
    // Fetch exercise, package data, and all exercises for navigation
    [exercise, exercisePackage, exercises] = await Promise.all([
      getExerciseById(exerciseId),
      getExercisePackageBySlug(slug),
      getPackageExercises(await getExercisePackageBySlug(slug).then(pkg => pkg.id))
    ]);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ExercisePractice
          exercises={exercises}
          currentExerciseId={exerciseId}
          packageInfo={{
            id: exercisePackage.id,
            title: exercisePackage.title,
            slug: exercisePackage.slug,
          }}
          userData={userData}
          locale={locale}
        />
      </div>
  );
}