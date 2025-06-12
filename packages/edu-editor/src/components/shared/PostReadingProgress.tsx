// packages/edu-editor/src/components/shared/PostReadingProgress.tsx - Fixed version
import { useEffect, useState } from "react";

type colors = '#A47BB9' | "#E08D79" | "#5C9EAD" | "#D46BA3" | "#779ECB" | "#8859A3"

interface ReadingProgressProps {
    color?: colors;
    containerSelector?: string;
}

const PostReadingProgress: React.FC<ReadingProgressProps> = ({
                                                                 color = '#A47BB9',
                                                                 containerSelector = '.article-content'
                                                             }) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const calculateProgress = () => {
            // const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const containerHeight = container.scrollHeight;

            // Get the scroll position relative to the container
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const containerTop = container.getBoundingClientRect().top + scrollTop;

            // Calculate how much of the container has been scrolled through
            const scrolled = Math.max(0, scrollTop - containerTop);
            const scrollable = Math.max(0, containerHeight - viewportHeight);

            if (scrollable === 0) {
                setProgress(0);
                return;
            }

            const progressPercentage = Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
            setProgress(progressPercentage);
        };

        const handleScroll = () => {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const isContainerVisible = rect.top < window.innerHeight && rect.bottom > 0;

            setIsVisible(isContainerVisible);

            if (isContainerVisible) {
                calculateProgress();
            }
        };

        // Initial calculation
        handleScroll();

        // Intersection Observer to detect when container enters viewport
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { rootMargin: '0px 0px -90% 0px', threshold: 0 }
        );

        observer.observe(container);

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [containerSelector]);

    if (!isVisible) return null;

    return (
        <>
            <div
                className="reading-progress-bar"
                style={{
                    '--progress-color': color,
                    '--progress-width': `${progress}%`
                } as React.CSSProperties}
            />

            <style>{`
        .reading-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 14px;
          background: rgba(0, 0, 0, 0.1);
          z-index: 9999;
          pointer-events: none;
        }

        .reading-progress-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--progress-width, 0%);
          background: var(--progress-color, #2563eb);
          transition: width 0.1s ease-out;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
        }

        /* Dark mode support */
        .dark .reading-progress-bar {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Animation for smooth progress */
        @media (prefers-reduced-motion: no-preference) {
          .reading-progress-bar::before {
            transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }

        /* Hide on very small screens to save space */
        @media (max-width: 480px) {
          .reading-progress-bar {
            height: 3px;
          }
        }
      `}</style>
        </>
    );
};

export default PostReadingProgress;