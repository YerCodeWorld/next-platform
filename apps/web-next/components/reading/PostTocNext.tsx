'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface PostTocNextProps {
  content: string;
  locale: string;
}

export const PostTocNext: React.FC<PostTocNextProps> = ({ content, locale }) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle mounting for SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll lock when mobile modal is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Extract headings from rendered content
  useEffect(() => {
    if (!content) return;

    const extractHeadingsFromDOM = () => {
      // Wait for content to be rendered
      setTimeout(() => {
        const container = document.querySelector('.prose-wrapper');
        if (!container) return;

        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocItems: TocItem[] = [];

        headings.forEach((heading, index) => {
          const text = heading.textContent?.trim() || '';
          if (!text) return;

          // Generate or get existing ID
          let id = heading.id;
          if (!id) {
            id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .trim() || `heading-${index}`;
            
            // Ensure unique ID
            let uniqueId = id;
            let counter = 1;
            while (document.getElementById(uniqueId)) {
              uniqueId = `${id}-${counter}`;
              counter++;
            }
            
            heading.id = uniqueId;
            id = uniqueId;
          }

          const level = parseInt(heading.tagName.charAt(1));
          
          // Only include h2, h3, h4 for TOC
          if (level >= 2 && level <= 4) {
            tocItems.push({
              id,
              text,
              level
            });
          }
        });

        setItems(tocItems);
      }, 500); // Give time for TiptapRenderer to render
    };

    extractHeadingsFromDOM();
  }, [content]);

  // Set up intersection observer for active heading
  useEffect(() => {
    if (items.length === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    // Observe all heading elements
    const headingElements = items
      .map(item => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setIsMobileOpen(false);
    }
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (items.length === 0) {
    return null;
  }

  // Mobile modal portal
  const mobileModal = isMobileOpen && mounted ? createPortal(
    <>
      {/* Mobile Overlay */}
      <div 
        className="toc-overlay visible"
        onClick={() => setIsMobileOpen(false)}
      />
      
      {/* Mobile TOC Modal */}
      <aside className="post-toc mobile-open">
        <div className="toc-card">
          <div className="toc-header">
            <svg className="toc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <h3 className="toc-title">
              {locale === 'es' ? 'Contenido' : 'Contents'}
            </h3>
          </div>
          
          <nav className="toc-nav">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`toc-link level-${item.level} ${activeId === item.id ? 'active' : ''}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>,
    document.body
  ) : null;

  return (
    <>
      {/* Desktop TOC */}
      <aside className="post-toc">
        <div className="toc-card">
          <div className="toc-header">
            <svg className="toc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <h3 className="toc-title">
              {locale === 'es' ? 'Contenido' : 'Contents'}
            </h3>
          </div>
          
          <nav className="toc-nav">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`toc-link level-${item.level} ${activeId === item.id ? 'active' : ''}`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="toc-mobile-toggle"
        onClick={toggleMobile}
        aria-label={locale === 'es' ? 'Mostrar tabla de contenidos' : 'Show table of contents'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="12" y2="18"></line>
        </svg>
      </button>

      {/* Mobile Modal Portal */}
      {mobileModal}

      <style jsx>{`
        .post-toc {
          position: sticky;
          top: 120px;
          max-height: calc(100vh - 140px);
          overflow-y: auto;
          width: 260px;
          flex-shrink: 0;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        .post-toc::-webkit-scrollbar {
          width: 4px;
        }

        .post-toc::-webkit-scrollbar-track {
          background: transparent;
        }

        .post-toc::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 2px;
        }

        .post-toc::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        .toc-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #f3f4f6;
          position: relative;
          overflow: hidden;
        }

        .toc-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #5D33F6 0%, #7c3aed 100%);
        }

        .toc-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f9fafb;
        }

        .toc-icon {
          width: 20px;
          height: 20px;
          color: #5D33F6;
        }

        .toc-title {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
        }

        .toc-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toc-link {
          display: block;
          padding: 8px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
          transition: all 0.15s ease;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .toc-link:hover {
          color: #111827;
          background: #f9fafb;
          transform: translateX(2px);
        }

        .toc-link.active {
          color: #5D33F6;
          background: #f3f0ff;
          font-weight: 600;
        }

        .toc-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #5D33F6;
          border-radius: 0 2px 2px 0;
        }

        .toc-link.level-2 {
          padding-left: 12px;
          font-size: 14px;
        }

        .toc-link.level-3 {
          padding-left: 28px;
          font-size: 13px;
        }

        .toc-link.level-4 {
          padding-left: 44px;
          font-size: 12px;
          color: #9ca3af;
        }

        /* Mobile toggle button */
        .toc-mobile-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 52px;
          height: 52px;
          background: #5D33F6;
          color: white;
          border: none;
          border-radius: 50%;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          z-index: 1001;
          transition: all 0.2s ease;
          display: none;
        }

        /* Show button on mobile and tablet */
        @media (max-width: 1024px) {
          .toc-mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .toc-mobile-toggle:hover {
          background: #4c1d95;
          transform: scale(1.05);
          box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .toc-mobile-toggle:active {
          transform: scale(0.95);
        }

        .toc-mobile-toggle svg {
          width: 24px;
          height: 24px;
        }

        @media (max-width: 1024px) {
          .post-toc {
            position: fixed;
            top: 0;
            right: 0;
            width: 320px;
            height: 100vh;
            max-height: 100vh;
            background: white;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
          }

          .post-toc.mobile-open {
            transform: translateX(0);
          }

          .toc-card {
            height: 100%;
            border-radius: 0;
            box-shadow: none;
            border: none;
            border-left: 1px solid #e5e7eb;
            padding-top: 24px;
          }

          .toc-card::before {
            border-radius: 0;
          }
        }

        /* Mobile overlay */
        .toc-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .toc-overlay.visible {
          display: block;
          opacity: 1;
        }

        @media (max-width: 768px) {
          .post-toc {
            width: 100%;
            max-width: 100%;
          }

          .toc-mobile-toggle {
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
          }

          .toc-mobile-toggle svg {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </>
  );
};