import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import type { Metadata } from 'next';

interface CreateExercisePackagePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CreateExercisePackagePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const title = locale === 'es' ? 'Crear Paquete de Ejercicios | EduExercises' : 'Create Exercise Package | EduExercises';
  const description = locale === 'es' 
    ? 'Crea un nuevo paquete de ejercicios educativos para compartir conocimiento con estudiantes.'
    : 'Create a new educational exercise package to share knowledge with students.';

  return {
    title,
    description,
    robots: 'noindex, nofollow', // Don't index creation pages
  };
}

export default async function CreateExercisePackagePage({ params }: CreateExercisePackagePageProps) {
  const { locale } = await params;
  const userData = await getCurrentUser();

  // Check if user can create packages
  if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'TEACHER')) {
    redirect(`/${locale}/exercises`);
  }

  // Redirect to main exercises page where they can use the creation modal
  redirect(`/${locale}/exercises?create=true`);
}