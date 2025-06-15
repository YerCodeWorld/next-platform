import React from 'react';
import Image from 'next/image';
import { Post as PostData, Dynamic as DynamicData } from "@repo/api-bridge";

interface PostHeaderProps {
  post: PostData;
  locale: string;
}

interface DynamicHeaderProps {
  dynamic: DynamicData;
  locale: string;
}

// Utility function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export const PostHeader: React.FC<PostHeaderProps> = ({ post, locale }) => {
  const readingTime = calculateReadingTime(post.content);

  return (
    <>
      <header className="content-header">
        <h1 className="content-title">{post.title}</h1>
        
        {post.summary && (
          <p className="content-summary">{post.summary}</p>
        )}

        <div className="content-meta">
          <div className="author-info">
            {post.user?.picture && (
              <Image 
                src={post.user.picture}
                alt={post.user.name || 'Author'} 
                className="author-avatar"
                width={48}
                height={48}
              />
            )}
            <div className="author-details">
              <span className="author-name">{post.user?.name || 'Anonymous'}</span>
              <time className="publish-date">
                {new Date(post.createdAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          <div className="reading-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{readingTime} {locale === 'es' ? 'min de lectura' : 'min read'}</span>
          </div>
        </div>
      </header>

      <style jsx>{`
        .content-header {
          margin-bottom: 3rem;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 2rem;
        }

        .content-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 1rem 0;
          line-height: 1.2;
          font-family: 'Georgia', serif;
        }

        .content-summary {
          font-size: 1.25rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
        }

        .content-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #f3f4f6;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          color: #111827;
        }

        .publish-date {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .reading-time {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .content-title {
            font-size: 1.875rem;
          }

          .content-summary {
            font-size: 1.125rem;
          }

          .content-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({ dynamic, locale }) => {
  const getDifficultyLabel = (difficulty: string) => {
    if (locale === 'es') {
      switch (difficulty) {
        case 'BEGINNER': return 'Principiante';
        case 'INTERMEDIATE': return 'Intermedio';
        case 'ADVANCED': return 'Avanzado';
        default: return difficulty;
      }
    }
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    if (locale === 'es') {
      switch (ageGroup) {
        case 'KIDS': return 'Niños';
        case 'TEENS': return 'Adolescentes';
        case 'ADULTS': return 'Adultos';
        case 'ALL_AGES': return 'Todas las edades';
        default: return ageGroup;
      }
    }
    switch (ageGroup) {
      case 'ALL_AGES': return 'All ages';
      default: return ageGroup.charAt(0) + ageGroup.slice(1).toLowerCase();
    }
  };

  const getDynamicTypeLabel = (type: string) => {
    if (locale === 'es') {
      switch (type) {
        case 'READING': return 'Lectura';
        case 'CONVERSATION': return 'Conversación';
        case 'TEACHING_STRATEGY': return 'Estrategia de Enseñanza';
        case 'GRAMMAR': return 'Gramática';
        case 'VOCABULARY': return 'Vocabulario';
        case 'GAME': return 'Juego';
        case 'COMPETITION': return 'Competencia';
        case 'GENERAL': return 'General';
        default: return type;
      }
    }
    switch (type) {
      case 'TEACHING_STRATEGY': return 'Teaching Strategy';
      default: return type.charAt(0) + type.slice(1).toLowerCase();
    }
  };

  return (
    <>
      <header className="content-header">
        {/* Dynamic Type Tags */}
        <div className="tags-container">
          <span className="tag primary-tag">
            {getDynamicTypeLabel(dynamic.dynamicType)}
          </span>
          <span className="tag secondary-tag">
            {getDifficultyLabel(dynamic.difficulty)}
          </span>
          <span className="tag secondary-tag">
            {getAgeGroupLabel(dynamic.ageGroup)}
          </span>
        </div>

        <h1 className="content-title">{dynamic.title}</h1>
        
        {dynamic.objective && (
          <p className="content-objective">{dynamic.objective}</p>
        )}

        <div className="content-meta">
          <div className="author-info">
            {dynamic.user?.picture && (
              <Image 
                src={dynamic.user.picture}
                alt={dynamic.user.name || 'Author'} 
                className="author-avatar"
                width={48}
                height={48}
              />
            )}
            <div className="author-details">
              <span className="author-name">{dynamic.user?.name || 'Anonymous'}</span>
              <time className="publish-date">
                {new Date(dynamic.createdAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          <div className="dynamic-info">
            <div className="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{dynamic.duration} {locale === 'es' ? 'min' : 'min'}</span>
            </div>
            <div className="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>
                {dynamic.minStudents}
                {dynamic.maxStudents ? `-${dynamic.maxStudents}` : '+'} 
                {' '}{locale === 'es' ? 'estudiantes' : 'students'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Dynamic Details */}
        {dynamic.materialsNeeded && (
          <div className="materials-section">
            <h3 className="materials-title">
              {locale === 'es' ? 'Materiales necesarios:' : 'Materials needed:'}
            </h3>
            <p className="materials-content">{dynamic.materialsNeeded}</p>
          </div>
        )}
      </header>

      <style jsx>{`
        .content-header {
          margin-bottom: 3rem;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 2rem;
        }

        .tags-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .tag {
          background: #f3f4f6;
          color: #4b5563;
          padding: 0.25rem 0.75rem;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tag:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .primary-tag {
          background: #5D33F6 !important;
          color: white !important;
        }

        .secondary-tag {
          background: #e5e7eb !important;
          color: #374151 !important;
        }

        .content-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 1rem 0;
          line-height: 1.2;
          font-family: 'Georgia', serif;
        }

        .content-objective {
          font-size: 1.125rem;
          color: #4b5563;
          margin: 0 0 1.5rem 0;
          line-height: 1.6;
          font-style: italic;
          padding: 1rem;
          background: #f9fafb;
          border-left: 4px solid #5D33F6;
          border-radius: 0 8px 8px 0;
        }

        .content-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #f3f4f6;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          color: #111827;
        }

        .publish-date {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .dynamic-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #6b7280;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .materials-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .materials-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .materials-content {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        @media (max-width: 768px) {
          .content-title {
            font-size: 1.875rem;
          }

          .content-objective {
            font-size: 1rem;
            padding: 0.75rem;
          }

          .content-meta {
            flex-direction: column;
            align-items: flex-start;
          }

          .dynamic-info {
            gap: 0.75rem;
            flex-direction: column;
            align-items: flex-start;
          }

          .info-item {
            font-size: 0.8125rem;
          }

          .materials-section {
            margin-top: 1rem;
            padding: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .tags-container {
            gap: 0.375rem;
            margin-bottom: 0.75rem;
          }

          .tag {
            font-size: 0.8125rem;
            padding: 0.1875rem 0.5rem;
          }

          .content-title {
            font-size: 1.5rem;
            line-height: 1.3;
          }

          .content-objective {
            font-size: 0.9375rem;
            padding: 0.625rem;
          }
        }
      `}</style>
    </>
  );
};