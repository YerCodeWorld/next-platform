'use client';

import { usePathname } from 'next/navigation';
import CreateBlogButton from '../blog/CreateBlogButton';

interface User {
  id: string;
  name: string;
  role: string;
}

interface PageFloatingButtonProps {
  locale: string;
  user: User | null;
}

export default function PageFloatingButton({ locale, user }: PageFloatingButtonProps) {
  const pathname = usePathname();
  
  // Remove locale prefix to get clean path
  const cleanPath = pathname.replace(/^\/[a-z]{2}/, '') || '/';
  
  // Define which pages should show which button
  const pageConfig = {
    '/blog': { type: 'blog' as const, show: true },
    '/activities': { type: 'dynamic' as const, show: true },
  };
  
  const config = pageConfig[cleanPath as keyof typeof pageConfig];
  
  // Don't render if no config for this page or user not authorized
  if (!config?.show || !user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return null;
  }
  
  return (
    <CreateBlogButton 
      locale={locale} 
      user={user} 
      type={config.type} 
    />
  );
}