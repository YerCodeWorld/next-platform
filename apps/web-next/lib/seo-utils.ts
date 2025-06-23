// lib/seo-utils.ts
import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  contentType?: 'blog' | 'teacher' | 'teachers' | 'activity' | 'activities' | 'exercise' | 'exercises' | 'home' | 'default';
  locale?: string;
  canonical?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Get the appropriate Open Graph image based on content type and custom image
 */
export const getOpenGraphImage = (contentType: string = 'default', customImage?: string): string => {
  if (customImage) {
    // Return custom image if provided (e.g., teacher profile image, blog cover)
    return customImage;
  }
  
  const imageMap: Record<string, string> = {
    'blog': '/images/blog-og.jpg',
    'teacher': '/images/teachers-og.jpg',
    'teachers': '/images/teachers-og.jpg',
    'activity': '/images/dynamics-og.jpg',
    'activities': '/images/dynamics-og.jpg',
    'exercise': '/images/exercises-og.jpg',
    'exercises': '/images/exercises-og.jpg',
    'home': '/images/home-og.jpg',
    'default': '/images/default-og.jpg'
  };
  
  return imageMap[contentType] || imageMap.default;
};

/**
 * Generate comprehensive metadata for pages
 */
export const generateSEOMetadata = (config: SEOConfig): Metadata => {
  const {
    title,
    description,
    image,
    contentType = 'default',
    locale = 'en',
    canonical,
    publishedTime,
    modifiedTime,
    authors
  } = config;

  const ogImage = getOpenGraphImage(contentType, image);
  const isArticle = contentType === 'blog' || contentType === 'activity';

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      type: isArticle ? 'article' : 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      siteName: 'EduGuiders',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // Add article-specific metadata
  if (isArticle && metadata.openGraph && publishedTime) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata.openGraph as any).publishedTime = publishedTime;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata.openGraph as any).modifiedTime = modifiedTime;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata.openGraph as any).authors = authors;
  }

  // Add canonical URL
  if (canonical) {
    metadata.alternates = {
      canonical,
      languages: {
        'en': canonical.replace(/^\/[a-z]{2}\//, '/en/'),
        'es': canonical.replace(/^\/[a-z]{2}\//, '/es/'),
      },
    };
  }

  return metadata;
};

/**
 * Generate structured data (JSON-LD) for organization
 */
export const generateOrganizationStructuredData = (locale: string = 'en') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EduGuiders',
    alternateName: locale === 'es' ? 'EduGuías' : 'EduGuiders',
    url: 'https://eduguiders.com',
    logo: 'https://eduguiders.com/images/logo/logo.png',
    description: locale === 'es' 
      ? 'Plataforma educativa que conecta estudiantes con profesores expertos de inglés'
      : 'Educational platform connecting students with expert English teachers',
    sameAs: [
      'https://instagram.com/eduguiders',
      'https://tiktok.com/@eduguiders'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish']
    }
  };
};

/**
 * Generate structured data for teacher profiles
 */
export const generateTeacherStructuredData = (teacher: {
  name: string;
  bio?: string;
  image?: string;
  email?: string;
  yearsExperience?: number;
  specializations?: string[];
  teachingLanguages?: string[];
}, locale: string = 'en') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    description: teacher.bio,
    image: teacher.image,
    email: teacher.email,
    jobTitle: locale === 'es' ? 'Profesor de Inglés' : 'English Teacher',
    worksFor: {
      '@type': 'Organization',
      name: 'EduGuiders'
    },
    knowsLanguage: teacher.teachingLanguages?.map(lang => ({
      '@type': 'Language',
      name: lang
    })),
    expertise: teacher.specializations
  };
};

/**
 * Generate structured data for educational content
 */
export const generateEducationalContentStructuredData = (content: {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  category?: string;
}, contentType: 'Course' | 'Article' | 'LearningResource' = 'Article', locale: string = 'en') => {
  return {
    '@context': 'https://schema.org',
    '@type': contentType,
    name: content.title,
    description: content.description,
    author: content.author ? {
      '@type': 'Person',
      name: content.author
    } : undefined,
    datePublished: content.datePublished,
    dateModified: content.dateModified,
    image: content.image,
    inLanguage: locale === 'es' ? 'es' : 'en',
    about: {
      '@type': 'Thing',
      name: locale === 'es' ? 'Educación en Inglés' : 'English Education'
    },
    publisher: {
      '@type': 'Organization',
      name: 'EduGuiders'
    }
  };
};