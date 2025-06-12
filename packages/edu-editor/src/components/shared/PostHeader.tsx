// packages/edu-editor/src/components/shared/PostHeader.tsx - Updated with real data
import { LuCalendarDays, LuClock, LuUser } from "react-icons/lu";

interface PostHeaderProps {
  title: string;
  cover: string;
  author: string;
  createdAt: string;
  readingTime: number;
  authorAvatar?: string;
}

const PostHeader = ({
                      title,
                      author,
                      cover,
                      createdAt,
                      readingTime,
                      authorAvatar
                    }: PostHeaderProps) => {

  return (
      <div className="post-header">
        <div className="post-header-content">

          {/* Post Title */}
          <h1 className="post-title">
            {title}
          </h1>

          {/* Author and Meta Information */}
          <div className="post-meta">
            <div className="author-info">
              {authorAvatar ? (
                  <img
                      src={authorAvatar}
                      alt={author}
                      className="author-avatar"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        e.currentTarget.src = '/images/default-avatar.png';
                      }}
                  />
              ) : (
                  <div className="author-avatar-placeholder">
                    <LuUser size={24} />
                  </div>
              )}

              <div className="author-details">
                <div className="author-name">
                  By <strong>{author}</strong>
                </div>

                <div className="post-metadata">
                  <div className="meta-item">
                    <LuCalendarDays size={16} />
                    <span>{createdAt}</span>
                  </div>

                  <div className="meta-separator">•</div>

                  <div className="meta-item">
                    <LuClock size={16} />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {cover && (
              <div className="post-cover">
                <img
                    src={cover}
                    alt={title}
                    className="cover-image"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                />
              </div>
          )}
        </div>

        <style>{`
        .post-header {
          margin-bottom: 2rem;
        }

        .post-header-content {
          max-width: 45rem;
          margin: 0 auto;
        }

        .post-title {
          font-size: 2.5rem;
          line-height: 1.2;
          font-weight: 700;
          color: var(--rte-fg);
          margin-bottom: 1.5rem;
          word-wrap: break-word;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--rte-border);
        }

        .author-avatar-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--rte-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--rte-muted-fg);
          border: 2px solid var(--rte-border);
        }

        .author-details {
          flex: 1;
        }

        .author-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--rte-fg);
          margin-bottom: 0.5rem;
        }

        .post-metadata {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--rte-muted-fg);
          font-size: 0.875rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-separator {
          color: var(--rte-muted-fg);
          opacity: 0.6;
        }

        .post-cover {
          margin-top: 2rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cover-image {
          width: 100%;
          height: auto;
          display: block;
          max-height: 400px;
          object-fit: cover;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .post-title {
            font-size: 2rem;
          }
          
          .post-header-content {
            padding: 0 1rem;
          }
          
          .author-info {
            gap: 0.75rem;
          }
          
          .author-avatar,
          .author-avatar-placeholder {
            width: 40px;
            height: 40px;
          }
          
          .author-name {
            font-size: 0.9rem;
          }
          
          .post-metadata {
            font-size: 0.8rem;
            gap: 0.5rem;
          }
        }

        /* Dark mode support */
        .dark .post-title {
          color: var(--rte-fg);
        }
        
        .dark .author-name {
          color: var(--rte-fg);
        }
        
        .dark .post-metadata {
          color: var(--rte-muted-fg);
        }
        
        .dark .author-avatar,
        .dark .author-avatar-placeholder {
          border-color: var(--rte-border);
        }
        
        .dark .author-avatar-placeholder {
          background-color: var(--rte-muted);
          color: var(--rte-muted-fg);
        }
      `}</style>
      </div>
  );
};

export default PostHeader;