// app/[locale]/exercises/create/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Breadcrumb } from '@repo/components';
import { CreateExercisePackageForm } from '@/components/exercises/CreateExercisePackageForm';
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

  const breadcrumbItems = [
    { label: locale === 'es' ? 'Inicio' : 'Home', href: `/${locale}` },
    { label: 'Exercises', href: `/${locale}/exercises` },
    { label: locale === 'es' ? 'Crear Paquete' : 'Create Package' },
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
            {locale === 'es' ? 'Crear Nuevo Paquete de Ejercicios' : 'Create New Exercise Package'}
          </h1>
          <p className="text-gray-600">
            {locale === 'es' 
              ? 'Configura los detalles básicos de tu paquete. Podrás agregar ejercicios después de crearlo.'
              : 'Set up the basic details of your package. You can add exercises after creating it.'}
          </p>
        </div>

        {/* Create Form */}
        <CreateExercisePackageForm 
          locale={locale}
          userData={userData}
        />
      </div>
    </div>
  );
}