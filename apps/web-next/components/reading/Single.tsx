'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { TiptapRenderer } from '@repo/edu-editor';
import { PostTocNext } from './PostTocNext';
import PostReadingProgressNext from './PostReadingProgressNext';
import { PostHeader, DynamicHeader } from './ContentHeaders';
import { 
  getPostBySlug, 
  getDynamicBySlug
} from '@/lib/data';

import { Dynamic as DynamicData, Post as PostData} from "@repo/api-bridge";

interface SingleProps {
  contentType: 'dynamic' | 'post';
  slug: string;
  locale: string;
}

type ColorType = '#A47BB9' | '#E08D79' | '#5C9EAD' | '#D46BA3' | '#779ECB' | '#8859A3';

// Helper functions to safely access content properties
const getContentForToc = (content: PostData | DynamicData, contentType: string): string => {
  if (!content) return '';
  return contentType === 'post' ? (content as PostData).content : (content as DynamicData).content;
};

const getMainContent = (content: PostData | DynamicData, contentType: string): string => {
  if (!content) return '';
  return contentType === 'post' ? (content as PostData).content : (content as DynamicData).content;
};

const Single: React.FC<SingleProps> = ({ contentType, slug, locale }) => {
  const [content, setContent] = useState<PostData | DynamicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressColor = '#5D33F6';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let fetchedContent: PostData | DynamicData | null = null;
        
        if (contentType === 'dynamic') {
          fetchedContent = await getDynamicBySlug(slug);
          if (fetchedContent) {
            setContent(fetchedContent);
            setLoading(false);
          } else {
            setError('Dynamic content not found');
            setLoading(false);
          }
        } else {
          fetchedContent = await getPostBySlug(slug);
          if (fetchedContent) {
            setContent(fetchedContent);
            setLoading(false);
          } else {
            setError('Post not found');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, slug]);

  if (loading) {
    return (
      <div className="notebook-container">
        <div className="notebook-page loading">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta"></div>
          </div>
          <div className="skeleton-content">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-line" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="notebook-container">
        <div className="notebook-page error">
          <div className="error-content">
            <h1>{locale === 'es' ? 'Contenido no encontrado' : 'Content not found'}</h1>
            <p>{error || (locale === 'es' ? 'El contenido que buscas no existe.' : 'The content you are looking for does not exist.')}</p>
            <Link href={`/${locale}/${contentType === 'dynamic' ? 'activities' : 'blog'}`} className="back-link">
              {locale === 'es' ? '← Volver' : '← Go back'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDynamic = contentType === 'dynamic';
  const pageTitle = isDynamic 
    ? (locale === 'es' ? 'Actividad Educativa' : 'Educational Activity')
    : (locale === 'es' ? 'Artículo del Blog' : 'Blog Article');

  return (
    <>
      <PostReadingProgressNext color={progressColor as ColorType} />
      
      <div className="notebook-container">
        {/* Navigation Header */}
        <header className="notebook-header">
          <div className="nav-wrapper">
            <Link href={`/${locale}/${isDynamic ? 'activities' : 'blog'}`} className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" />
              </svg>
              <span>{locale === 'es' ? 'Volver' : 'Back'}</span>
            </Link>
            
            <div className="page-type-badge">
              {pageTitle}
            </div>
          </div>
        </header>

        <div className="notebook-content">
          {/* Table of Contents */}
          <PostTocNext 
            content={getContentForToc(content, contentType)}
            locale={locale} 
          />

          {/* Main Notebook Page */}
          <article className="notebook-page" ref={contentRef}>
            {/* Notebook Rings */}
            <div className="notebook-rings">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ring-hole"></div>
              ))}
            </div>

            {/* Content Header - Type-safe */}
            {contentType === 'post' ? (
              <PostHeader post={content as PostData} locale={locale} />
            ) : (
              <DynamicHeader dynamic={content as DynamicData} locale={locale} />
            )}

            {/* Main Content */}
            <div className="prose-wrapper">
              <TiptapRenderer>
                {getMainContent(content, contentType)}
              </TiptapRenderer>
            </div>

            {/* Footer */}
            <footer className="content-footer">
              <div className="footer-divider"></div>
              <div className="share-section">
                <span>{locale === 'es' ? 'Compartir este contenido:' : 'Share this content:'}</span>
                <div className="share-buttons">
                  <button className="share-button" aria-label="Share on Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </button>
                  <button className="share-button" aria-label="Share on Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </button>
                  <button className="share-button" aria-label="Copy link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>

      <style jsx>{`
        .notebook-container {
          min-height: 100vh;

          background-image: 
            linear-gradient(90deg, transparent 79px, #e74c3c 79px, #e74c3c 81px, transparent 81px),
            linear-gradient(#eee .1em, transparent .1em);
          background-size: 100% 1.5em;
          padding: 2rem 0;
        }

        .notebook-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .nav-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .back-button:hover {
          color: #111827;
          background: #f3f4f6;
        }

        .page-type-badge {
          background: #5D33F6;
          color: white;
          padding: 0.375rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .notebook-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 3rem;
          position: relative;
        }

        .notebook-page {
          flex: 1;
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06),
            inset 0 0 0 1px rgba(0, 0, 0, 0.02);
          border-radius: 3px;
          padding: 4rem 5rem 4rem 7rem;
          position: relative;
          min-height: 800px;
        }

        .notebook-rings {
          position: absolute;
          top: 0;
          left: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          padding: 2rem 0;
        }

        .ring-hole {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #f8f9fa;
          border: 2px solid #e5e7eb;
          box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
        }

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

        .prose-wrapper {
          font-family: 'Georgia', serif;
          color: #374151;
          line-height: 1.8;
        }

        .prose-wrapper :global(h1),
        .prose-wrapper :global(h2),
        .prose-wrapper :global(h3),
        .prose-wrapper :global(h4),
        .prose-wrapper :global(h5),
        .prose-wrapper :global(h6) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          color: #111827;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .prose-wrapper :global(h2) {
          font-size: 1.875rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .prose-wrapper :global(h3) {
          font-size: 1.5rem;
        }

        .prose-wrapper :global(p) {
          margin-bottom: 1.5rem;
        }

        .prose-wrapper :global(a) {
          color: #5D33F6;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
          transition: all 0.2s;
        }

        .prose-wrapper :global(a:hover) {
          color: #4c1d95;
          text-decoration-thickness: 2px;
        }

        .prose-wrapper :global(ul),
        .prose-wrapper :global(ol) {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .prose-wrapper :global(ul) {
          list-style-type: disc;
        }

        .prose-wrapper :global(ol) {
          list-style-type: decimal;
        }

        .prose-wrapper :global(li) {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }

        .prose-wrapper :global(li::marker) {
          color: #9ca3af;
        }

        .prose-wrapper :global(blockquote) {
          border-left: 4px solid #5D33F6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4b5563;
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0 8px 8px 0;
        }

        .prose-wrapper :global(code) {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: 'Consolas', 'Monaco', monospace;
          color: #e11d48;
        }

        .prose-wrapper :global(pre) {
          background: #1f2937;
          color: #e5e7eb;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .prose-wrapper :global(pre code) {
          background: transparent;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }

        .prose-wrapper :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          font-size: 0.875rem;
        }

        .prose-wrapper :global(th) {
          background: #f9fafb;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .prose-wrapper :global(td) {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .prose-wrapper :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .prose-wrapper :global(hr) {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 3rem 0;
        }

        .prose-wrapper :global(strong) {
          font-weight: 600;
          color: #111827;
        }

        .prose-wrapper :global(em) {
          font-style: italic;
        }

        .content-footer {
          margin-top: 4rem;
        }

        .footer-divider {
          height: 2px;
          background: #f3f4f6;
          margin-bottom: 2rem;
        }

        .share-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .share-section > span {
          color: #6b7280;
          font-weight: 500;
        }

        .share-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .share-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .share-button:hover {
          background: #f3f4f6;
          color: #111827;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Loading State */
        .notebook-page.loading {
          padding: 4rem;
        }

        .skeleton-header {
          margin-bottom: 3rem;
        }

        .skeleton-title {
          height: 2.5rem;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 1rem;
          width: 70%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-meta {
          height: 1rem;
          background: #f3f4f6;
          border-radius: 6px;
          width: 40%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-content {
          space-y: 1rem;
        }

        .skeleton-line {
          height: 1rem;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 1rem;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Error State */
        .notebook-page.error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .error-content {
          text-align: center;
        }

        .error-content h1 {
          font-size: 2rem;
          color: #111827;
          margin-bottom: 1rem;
        }

        .error-content p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .back-link {
          color: #5D33F6;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .back-link:hover {
          color: #4c1d95;
          transform: translateX(-4px);
        }

        /* Mobile Styles */
        @media (max-width: 1024px) {
          .notebook-content {
            gap: 2rem;
          }

          .notebook-page {
            padding: 3rem 3rem 3rem 5rem;
          }

          .notebook-rings {
            left: 20px;
          }

          .ring-hole {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 768px) {
          .notebook-container {
            padding: 1rem 0;
            background-size: 100% 1.2em;
          }

          .nav-wrapper {
            padding: 1rem;
          }

          .notebook-content {
            padding: 0 1rem;
            gap: 1rem;
            flex-direction: column;
          }

          .notebook-page {
            padding: 2rem 1.5rem 2rem 3rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            max-width: 100%;
            overflow-x: hidden;
          }

          .notebook-rings {
            left: 10px;
            padding: 1rem 0;
          }

          .ring-hole {
            width: 15px;
            height: 15px;
          }

          .prose-wrapper {
            font-size: 1rem;
            max-width: 100%;
            overflow-x: hidden;
          }

          .prose-wrapper :global(h2) {
            font-size: 1.5rem;
            word-wrap: break-word;
          }

          .prose-wrapper :global(h3) {
            font-size: 1.25rem;
            word-wrap: break-word;
          }

          .prose-wrapper :global(p) {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .prose-wrapper :global(table) {
            font-size: 0.75rem;
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

          .prose-wrapper :global(pre) {
            font-size: 0.75rem;
            overflow-x: auto;
          }

          .share-section {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .notebook-container {
            padding: 0.5rem 0;
            background-image: 
              linear-gradient(90deg, transparent 60px, #e74c3c 60px, #e74c3c 62px, transparent 62px),
              linear-gradient(#eee .1em, transparent .1em);
            background-size: 100% 1.1em;
          }

          .notebook-content {
            padding: 0 0.5rem;
          }

          .notebook-page {
            padding: 1.5rem 1rem 1.5rem 2.5rem;
            min-height: auto;
          }

          .notebook-rings {
            left: 5px;
            padding: 0.5rem 0;
          }

          .ring-hole {
            width: 12px;
            height: 12px;
          }

          .page-type-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
          }

          .prose-wrapper {
            font-size: 0.9375rem;
            line-height: 1.6;
          }

          .prose-wrapper :global(h2) {
            font-size: 1.375rem;
          }

          .prose-wrapper :global(h3) {
            font-size: 1.125rem;
          }

          .prose-wrapper :global(blockquote) {
            padding: 1rem;
            font-size: 0.9375rem;
          }

          .prose-wrapper :global(ul),
          .prose-wrapper :global(ol) {
            padding-left: 1.5rem;
          }

          .prose-wrapper :global(li) {
            margin-bottom: 0.375rem;
          }

          .content-footer {
            margin-top: 2rem;
          }
        }

        /* Print Styles */
        @media print {
          .notebook-header,
          .notebook-rings,
          .share-section {
            display: none;
          }

          .notebook-container {
            background: white;
          }

          .notebook-page {
            box-shadow: none;
            padding: 0;
            max-width: 100%;
          }

          .prose-wrapper {
            font-size: 11pt;
            line-height: 1.5;
          }
        }
      `}</style>
    </>
  );
};

export default Single;