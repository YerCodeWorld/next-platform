'use client';

import Link from 'next/link';
import './CreateBlogButton.css';

interface CreateBlogButtonProps {
  locale: string;
}

export default function CreateBlogButton({ locale }: CreateBlogButtonProps) {
  return (
    <Link
      href={`/${locale}/blog/new`}
      className="create-blog-button"
      aria-label={locale === 'es' ? 'Crear nuevo artículo' : 'Create new article'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </Link>
  );
}