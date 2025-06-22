'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TiptapRenderer } from '@repo/edu-editor';
import { PostTocNext } from './PostTocNext';
import PostReadingProgressNext from './PostReadingProgressNext';
import { PostHeader, DynamicHeader } from './ContentHeaders';
import { Dynamic as DynamicData, Post as PostData } from "@repo/api-bridge";

interface ReadingModalProps {
  content: PostData | DynamicData;
  contentType: 'dynamic' | 'post';
  locale: string;
  isOpen: boolean;
  onClose: () => void;
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

const ReadingModal: React.FC<ReadingModalProps> = ({ 
  content, 
  contentType, 
  locale, 
  isOpen, 
  onClose 
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressColor = '#5D33F6';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const isDynamic = contentType === 'dynamic';
  const pageTitle = isDynamic 
    ? (locale === 'es' ? 'Actividad Educativa' : 'Educational Activity')
    : (locale === 'es' ? 'Artículo del Blog' : 'Blog Article');

  const modal = (
    <div className="reading-modal-overlay" onClick={onClose} ref={modalRef}>
      <div className="reading-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Progress Bar */}
        <PostReadingProgressNext color={progressColor as ColorType} />
        
        {/* Modal Header */}
        <header className="reading-modal-header">
          <div className="modal-nav-wrapper">
            <button onClick={onClose} className="modal-close-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" />
              </svg>
              <span>{locale === 'es' ? 'Cerrar' : 'Close'}</span>
            </button>
            
            <div className="modal-page-type-badge">
              {pageTitle}
            </div>

            <button onClick={onClose} className="modal-close-x">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* Modal Content */}
        <div className="reading-modal-content">
          {/* Table of Contents - Mobile Optimized */}
          <PostTocNext 
            content={getContentForToc(content, contentType)}
            locale={locale} 
          />

          {/* Main Content */}
          <article className="reading-modal-article" ref={contentRef}>
            {/* Content Header */}
            {contentType === 'post' ? (
              <PostHeader post={content as PostData} locale={locale} />
            ) : (
              <DynamicHeader dynamic={content as DynamicData} locale={locale} />
            )}

            {/* Main Content */}
            <div className="reading-prose-wrapper">
              <TiptapRenderer>
                {getMainContent(content, contentType)}
              </TiptapRenderer>
            </div>

            {/* Footer */}
            <footer className="reading-modal-footer">
              <div className="modal-footer-divider"></div>
              <div className="modal-share-section">
                <span>{locale === 'es' ? 'Compartir:' : 'Share:'}</span>
                <div className="modal-share-buttons">
                  <button className="modal-share-button" aria-label="Share on Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </button>
                  <button className="modal-share-button" aria-label="Share on Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </button>
                  <button className="modal-share-button" aria-label="Copy link">
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
        .reading-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: hidden;
        }

        .reading-modal-container {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          background: white;
          border-radius: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUpModal 0.3s ease-out;
        }

        @keyframes slideUpModal {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .reading-modal-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .modal-nav-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 100%;
        }

        .modal-close-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .modal-close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-page-type-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          flex: 1;
          margin: 0 1rem;
          max-width: 200px;
        }

        .modal-close-x {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-x:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .reading-modal-content {
          flex: 1;
          overflow-y: auto;
          position: relative;
          background: #f9fafb;
        }

        .reading-modal-article {
          max-width: 100%;
          margin: 0;
          padding: 1.5rem;
          background: white;
          margin: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .reading-prose-wrapper {
          margin: 2rem 0;
          line-height: 1.7;
          color: #374151;
        }

        .reading-prose-wrapper :global(h1),
        .reading-prose-wrapper :global(h2),
        .reading-prose-wrapper :global(h3),
        .reading-prose-wrapper :global(h4),
        .reading-prose-wrapper :global(h5),
        .reading-prose-wrapper :global(h6) {
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .reading-prose-wrapper :global(h1) { font-size: 2rem; }
        .reading-prose-wrapper :global(h2) { font-size: 1.75rem; }
        .reading-prose-wrapper :global(h3) { font-size: 1.5rem; }
        .reading-prose-wrapper :global(h4) { font-size: 1.25rem; }

        .reading-prose-wrapper :global(p) {
          margin-bottom: 1.5rem;
          text-align: justify;
        }

        .reading-prose-wrapper :global(ul),
        .reading-prose-wrapper :global(ol) {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        .reading-prose-wrapper :global(li) {
          margin-bottom: 0.5rem;
        }

        .reading-prose-wrapper :global(blockquote) {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .reading-prose-wrapper :global(code) {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
        }

        .reading-prose-wrapper :global(pre) {
          background: #1f2937;
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .reading-prose-wrapper :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }

        .reading-modal-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
          margin-top: 3rem;
        }

        .modal-footer-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin-bottom: 2rem;
        }

        .modal-share-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: center;
          text-align: center;
          flex-wrap: wrap;
        }

        .modal-share-section span {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .modal-share-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .modal-share-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-share-button:hover {
          background: #e5e7eb;
          color: #374151;
          transform: translateY(-2px);
        }

        /* Desktop styles */
        @media (min-width: 768px) {
          .reading-modal-overlay {
            padding: 2rem;
          }

          .reading-modal-container {
            width: 90%;
            height: 90%;
            max-width: 1200px;
            max-height: 90vh;
            border-radius: 16px;
            animation: scaleInModal 0.3s ease-out;
          }

          @keyframes scaleInModal {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .reading-modal-article {
            max-width: 800px;
            margin: 1rem auto;
            padding: 3rem;
          }

          .modal-page-type-badge {
            max-width: 300px;
          }
        }

        /* Large desktop */
        @media (min-width: 1024px) {
          .reading-modal-article {
            padding: 4rem;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .reading-modal-header {
            padding: 0.75rem;
          }

          .modal-nav-wrapper {
            gap: 0.5rem;
          }

          .modal-page-type-badge {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
            margin: 0 0.5rem;
          }

          .reading-modal-article {
            margin: 0.5rem;
            padding: 1rem;
          }

          .reading-prose-wrapper :global(h1) { font-size: 1.75rem; }
          .reading-prose-wrapper :global(h2) { font-size: 1.5rem; }
          .reading-prose-wrapper :global(h3) { font-size: 1.25rem; }
          .reading-prose-wrapper :global(h4) { font-size: 1.125rem; }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ReadingModal;