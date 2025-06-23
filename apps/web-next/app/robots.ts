import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://eduguiders.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '*/edit/',
          '*/new/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}