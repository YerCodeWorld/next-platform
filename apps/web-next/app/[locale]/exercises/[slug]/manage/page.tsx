// app/[locale]/exercises/[slug]/manage/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getExercisePackageBySlug, getPackageExercises, getAllExercises } from '@/lib/api-server';
import { Breadcrumb } from '@repo/components';
import { ExercisePackageManager } from '@/components/exercises/ExercisePackageManager';
import type { Metadata } from 'next';

interface ManageExercisePackagePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ManageExercisePackagePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  try {
    const exercisePackage = await getExercisePackageBySlug(slug);
    
    return {
      title: `Manage ${exercisePackage.title} | EduExercises`,
      description: `Manage exercises and settings for ${exercisePackage.title} package.`,
      robots: 'noindex, nofollow', // Don't index management pages
    };
  } catch {
    return {
      title: 'Manage Exercise Package | EduExercises',
      description: 'Manage exercise package settings and content.',
    };
  }
}

export default async function ManageExercisePackagePage({ params }: ManageExercisePackagePageProps) {
  const { locale, slug } = await params;
  const userData = await getCurrentUser();

  let exercisePackage;
  let packageExercises;
  let allExercises;

  try {
    // Fetch package data
    exercisePackage = await getExercisePackageBySlug(slug);
    packageExercises = await getPackageExercises(exercisePackage.id);
    allExercises = await getAllExercises(); // We'll need to implement this
  } catch (error) {
    console.error('Error fetching exercise package:', error);
    notFound();
  }

  // Check if user can manage this package
  const canManage = userData && (
    userData.role === 'ADMIN' || 
    (userData.role === 'TEACHER' && userData.email === exercisePackage.authorEmail)
  );

  if (!canManage) {
    redirect(`/${locale}/exercises/${slug}`);
  }

  const breadcrumbItems = [
    { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
    { label: 'Exercises', href: `/${locale}/exercises` },
    { label: exercisePackage.title, href: `/${locale}/exercises/${slug}` },
    { label: locale === 'es' ? 'Gestionar' : 'Manage' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={breadcrumbItems}
          title="EduExercises"
        />

        {/* Page Header */}
        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'es' ? 'Gestionar Paquete' : 'Manage Package'}
          </h1>
          <p className="text-gray-600">
            {exercisePackage.title}
          </p>
        </div>

        {/* Management Interface */}
        <ExercisePackageManager
          exercisePackage={exercisePackage}
          packageExercises={packageExercises}
          allExercises={allExercises}
          locale={locale}
          userData={userData}
        />
      </div>
    </div>
  );
}