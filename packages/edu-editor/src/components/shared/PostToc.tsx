// packages/edu-editor/src/components/shared/PostToc.tsx - Fixed version
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TocItem {
  id: string;
  text: string;
  level: number;
  node: Element;
}

const PostToc = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from content
  useEffect(() => {
    const updateTocItems = () => {
      const container = document.querySelector('.article-content');
      if (!container) return;

      const headings = container.querySelectorAll('h2, h3, h4');
      const tocItems: TocItem[] = [];

      headings.forEach((heading) => {
        let id = heading.id;
        if (!id) {
          // Generate ID if it doesn't exist
          const text = heading.textContent || '';
          id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .trim();

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

        tocItems.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName[1] as string),
          node: heading
        });
      });

      setItems(tocItems);
    };

    // Initial update
    updateTocItems();

    // Watch for content changes
    const container = document.querySelector('.article-content');
    if (container) {
      const observer = new MutationObserver(updateTocItems);
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => observer.disconnect();
    }
  }, []);

  // Intersection observer for active heading
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '0px 0px -75% 0px',
          threshold: 0.1
        }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  // Handle TOC item click
  const handleTocClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll to element
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Update URL hash
      router.push(`${pathName}#${id}`);
      setActiveId(id);
    }
  };

  // Handle initial hash on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveId(hash);
        }
      }, 100);
    }
  }, []);

  if (!items.length) return null;

  return (
      <div className="post-toc-container">
        <div className="post-toc">
          <h3 className="toc-title">On This Page</h3>
          <nav className="toc-nav">
            <ul className="toc-list">
              {items.map((item) => (
                  <li
                      key={item.id}
                      className={`toc-item toc-level-${item.level}`}
                      style={{
                        paddingLeft: `${(item.level - 2) * 0.75}rem`,
                      }}
                  >
                    <button
                        onClick={handleTocClick(item.id)}
                        className={`toc-link ${activeId === item.id ? 'active' : ''}`}
                        type="button"
                    >
                      {item.text}
                    </button>
                  </li>
              ))}
            </ul>
          </nav>
        </div>

        <style>{`
        .post-toc-container {
          position: sticky;
          top: 7rem;
          max-height: calc(100vh - 4rem);
          overflow-y: auto;
          width: 250px;
          flex-shrink: 0;
        }

        .post-toc {
          background: var(--rte-bg, #fff);
          border: 1px solid var(--rte-border, #e2e8f0);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .toc-title {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--rte-fg, #1f2328);
          margin: 0 0 1rem 0;
          border-bottom: 1px solid var(--rte-border, #e2e8f0);
          padding-bottom: 0.5rem;
        }

        .toc-nav {
          max-height: 400px;
          overflow-y: auto;
        }

        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .toc-item {
          margin-bottom: 0.25rem;
        }

        .toc-link {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.375rem 0.5rem;
          border: none;
          background: none;
          color: var(--rte-muted-fg, #6b7280);
          font-size: 0.875rem;
          line-height: 1.4;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .toc-link:hover {
          color: var(--rte-primary, #2563eb);
          background-color: var(--rte-accent, #f8fafc);
        }

        .toc-link.active {
          color: var(--rte-primary, #2563eb);
          background-color: var(--rte-accent, #f0f7ff);
          font-weight: 500;
        }

        .toc-level-3 .toc-link {
          font-size: 0.8125rem;
          opacity: 0.9;
        }

        .toc-level-4 .toc-link {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        /* Dark mode */
        .dark .post-toc {
          background: var(--rte-bg, #0d1117);
          border-color: var(--rte-border, #3d444d);
        }

        .dark .toc-title {
          color: var(--rte-fg, #f0f6fc);
          border-color: var(--rte-border, #3d444d);
        }

        .dark .toc-link {
          color: var(--rte-muted-fg, #8b949e);
        }

        .dark .toc-link:hover {
          color: var(--rte-primary, #58a6ff);
          background-color: var(--rte-accent, #161b22);
        }

        .dark .toc-link.active {
          color: var(--rte-primary, #58a6ff);
          background-color: var(--rte-accent, #0d419d33);
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .post-toc-container {
            display: none;
          }
        }

        /* Scrollbar styling */
        .toc-nav::-webkit-scrollbar {
          width: 4px;
        }

        .toc-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .toc-nav::-webkit-scrollbar-thumb {
          background: var(--rte-border, #e2e8f0);
          border-radius: 2px;
        }

        .toc-nav::-webkit-scrollbar-thumb:hover {
          background: var(--rte-muted-fg, #6b7280);
        }
      `}</style>
      </div>
  );
};

export default PostToc;