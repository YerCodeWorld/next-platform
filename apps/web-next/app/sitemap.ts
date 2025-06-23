import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eduguiders.com';
  
  // Static pages for both locales
  const staticPages = [
    '',
    '/blog',
    '/teachers',
    '/activities',
    '/exercises',
  ];

  const locales = ['en', 'es'];
  
  const staticRoutes: MetadataRoute.Sitemap = [];
  
  // Generate routes for each locale
  locales.forEach(locale => {
    staticPages.forEach(page => {
      staticRoutes.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    });
  });

  // TODO: Add dynamic routes for blog posts, teacher profiles, activities, etc.
  // This would require fetching data from your database
  
  return staticRoutes;
}