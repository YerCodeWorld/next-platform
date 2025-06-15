import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getExercisePackageBySlug } from '@/lib/api-server';
import type { Metadata } from 'next';

interface ManageExercisePackagePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ManageExercisePackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  
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

  try {
    // Fetch package data
    exercisePackage = await getExercisePackageBySlug(slug);
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

  // Redirect to package detail page where they can manage through the new UI
  redirect(`/${locale}/exercises/${slug}?manage=true`);
}