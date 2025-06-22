'use client';

import Link from 'next/link';
import './CreateBlogButton.css';

interface User {
  id: string;
  name: string;
  role: string;
}

interface CreateBlogButtonProps {
  locale: string;
  user: User | null;
  type?: 'blog' | 'dynamic';
}

export default function CreateBlogButton({ locale, user, type = 'blog' }: CreateBlogButtonProps) {
  // Only show button for ADMIN or TEACHER users
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return null;
  }

  const href = type === 'blog' ? `/${locale}/blog/new` : `/${locale}/activities/new`;
  const ariaLabel = type === 'blog' 
    ? (locale === 'es' ? 'Crear nuevo artículo' : 'Create new article')
    : (locale === 'es' ? 'Crear nueva actividad' : 'Create new activity');

  return (
    <Link
      href={href}
      className="create-blog-button"
      aria-label={ariaLabel}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </Link>
  );
}