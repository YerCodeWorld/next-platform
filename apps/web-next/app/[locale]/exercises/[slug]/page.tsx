import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllExercisePackages, getExercisePackageBySlug, getPackageExercises, getUserPackageProgress } from '@/lib/api-server';
import type { UserProgress } from '@repo/api-bridge';
import { Breadcrumb } from '@repo/components';
import ExercisePackageDetail from '@/components/exercises/package-detail/ExercisePackageDetail';
import type { Metadata } from 'next';

interface ExercisePackagePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ExercisePackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const exercisePackage = await getExercisePackageBySlug(slug);
    
    return {
      title: `${exercisePackage.title} - Exercise Package | EduExercises`,
      description: exercisePackage.description || `Complete the ${exercisePackage.title} exercise package with ${exercisePackage.exerciseCount} exercises.`,
      keywords: `exercises, ${exercisePackage.category.toLowerCase()}, learning, education`,
      openGraph: {
        title: `${exercisePackage.title} - Exercise Package`,
        description: exercisePackage.description || `Complete the ${exercisePackage.title} exercise package with ${exercisePackage.exerciseCount} exercises.`,
        images: exercisePackage.image ? [
          {
            url: exercisePackage.image,
            width: 1200,
            height: 630,
            alt: exercisePackage.title,
          }
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${exercisePackage.title} - Exercise Package`,
        description: exercisePackage.description || `Complete the ${exercisePackage.title} exercise package with ${exercisePackage.exerciseCount} exercises.`,
        images: exercisePackage.image ? [exercisePackage.image] : [],
      },
    };
  } catch {
    return {
      title: 'Exercise Package Not Found | EduExercises',
      description: 'The requested exercise package could not be found.',
    };
  }
}

export async function generateStaticParams() {
  try {
    const packages = await getAllExercisePackages();
    return packages.map((pkg) => ({
      slug: pkg.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for exercise packages:', error);
    return [];
  }
}

export default async function ExercisePackagePage({ params }: ExercisePackagePageProps) {
  const { locale, slug } = await params;
  const userData = await getCurrentUser();

  let exercisePackage;
  let exercises;
  let userProgress: UserProgress | null = null;

  try {
    // Fetch package data
    exercisePackage = await getExercisePackageBySlug(slug);
    exercises = await getPackageExercises(exercisePackage.id);

    // If user is logged in, fetch their progress
    if (userData) {
      try {
        userProgress = await getUserPackageProgress(exercisePackage.id, userData.email);
      } catch (error) {
        console.error('Error fetching user progress:', error);
        // Continue without progress data - set default progress
        userProgress = {
          userId: userData.id,
          packageId: exercisePackage.id,
          completedExercises: [],
          totalExercises: exercises.length,
          completionRate: 0,
          lastAccessedAt: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error('Error fetching exercise package:', error);
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: `/${locale}` },
    { label: 'Exercises', href: `/${locale}/exercises` },
    { label: exercisePackage.title, href: `/${locale}/exercises/${exercisePackage.slug}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={breadcrumbItems}
          title="EduExercises"
        />

        {/* Package Detail Component */}
        <ExercisePackageDetail
          package={exercisePackage}
          exercises={exercises}
          userData={userData}
          userProgress={userProgress}
          locale={locale}
        />
      </div>
    </div>
  );
}