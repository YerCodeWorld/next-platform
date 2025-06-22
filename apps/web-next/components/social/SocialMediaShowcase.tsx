'use client';

import React, { useEffect } from 'react';

interface SocialMediaShowcaseProps {
  locale: string;
}

const SocialMediaShowcase: React.FC<SocialMediaShowcaseProps> = ({ locale }) => {
  useEffect(() => {
    // Load TikTok embed script
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="social-media-showcase">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2 className="section-title">
            {locale === 'es' ? '¡Síguenos en Redes Sociales!' : 'Follow Us on Social Media!'}
          </h2>
          <p className="section-description">
            {locale === 'es' 
              ? 'Descubre contenido educativo exclusivo y tips para maestros en nuestras redes sociales'
              : 'Discover exclusive educational content and teaching tips on our social media channels'
            }
          </p>
        </div>

        <div className="posts-grid">
          {/* Instagram Post */}
          <div className="post-card instagram-card">
            <div className="card-background instagram-gradient"></div>
            <div className="platform-tag instagram-tag">
              <svg className="platform-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </div>
            <div className="embed-wrapper">
              <iframe
                src="https://www.instagram.com/p/DLDDjQnuXhJ/embed"
                allow="encrypted-media"
                scrolling="no"
                loading="lazy"
                className="social-iframe"
                title="Instagram post"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="card-footer instagram-footer">
              <span className="follow-text">
                {locale === 'es' ? 'Síguenos en Instagram' : 'Follow us on Instagram'}
              </span>
            </div>
          </div>

          {/* TikTok Post */}
          <div className="post-card tiktok-card">
            <div className="card-background tiktok-gradient"></div>
            <div className="platform-tag tiktok-tag">
              <svg className="platform-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              TikTok
            </div>
            <div className="embed-wrapper">
              <blockquote 
                className="tiktok-embed"
                cite="https://www.tiktok.com/@eduguiders/photo/7518461262624345350"
                data-video-id="7518461262624345350"
                style={{ maxWidth: '100%', minWidth: '100%' }}
              >
                <section className="loading-tiktok">
                  <div className="loading-spinner"></div>
                  <span>Loading TikTok...</span>
                </section>
              </blockquote>
            </div>
            <div className="card-footer tiktok-footer">
              <span className="follow-text">
                {locale === 'es' ? 'Síguenos en TikTok' : 'Follow us on TikTok'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .social-media-showcase {
          padding: 4rem 0;
          position: relative;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .section-description {
          font-size: 1.125rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .post-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          border: 3px solid transparent;
          background-clip: padding-box;
        }

        .post-card::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 28px;
          background: linear-gradient(45deg, transparent, transparent);
          z-index: -1;
          animation: borderRotate 3s linear infinite;
          filter: blur(0.5px);
        }

        .instagram-card::before {
          background: linear-gradient(45deg, 
            #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5, 
            #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
          background-size: 200% 200%;
        }

        .tiktok-card::before {
          background: linear-gradient(45deg, 
            #69C9D0, #EE1D52, #000000, #69C9D0, #EE1D52, 
            #000000, #69C9D0, #EE1D52, #000000);
          background-size: 200% 200%;
        }

        .post-card::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 27px;
          z-index: -1;
          animation: borderRotate 4s linear infinite reverse;
          opacity: 0.7;
        }

        .instagram-card::after {
          background: linear-gradient(135deg, 
            #ff9a8b, #fecfef, #fecfef, #ff9a8b, #fecfef, 
            #a8edea, #fed6e3, #ffd1dc, #ffeaa7);
          background-size: 300% 300%;
        }

        .tiktok-card::after {
          background: linear-gradient(135deg, 
            #69C9D0, #4facfe, #00f2fe, #EE1D52, #ff416c, 
            #000000, #434343, #69C9D0);
          background-size: 300% 300%;
        }

        @keyframes borderRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .post-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15);
        }

        .instagram-card:hover {
          box-shadow: 
            0 32px 80px rgba(0, 0, 0, 0.15),
            0 0 50px rgba(225, 48, 108, 0.3),
            0 0 100px rgba(225, 48, 108, 0.1);
        }

        .tiktok-card:hover {
          box-shadow: 
            0 32px 80px rgba(0, 0, 0, 0.15),
            0 0 50px rgba(105, 201, 208, 0.3),
            0 0 100px rgba(105, 201, 208, 0.1);
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          z-index: 1;
          border-radius: 24px 24px 0 0;
          animation: gradientShift 6s ease-in-out infinite;
        }

        .instagram-gradient {
          background: linear-gradient(90deg, 
            #feda75 0%, #fa7e1e 20%, #d62976 40%, 
            #962fbf 60%, #4f5bd5 80%, #feda75 100%);
          background-size: 200% 100%;
          box-shadow: 0 4px 15px rgba(225, 48, 108, 0.4);
        }

        .tiktok-gradient {
          background: linear-gradient(90deg, 
            #69C9D0 0%, #EE1D52 30%, #000000 50%, 
            #69C9D0 70%, #EE1D52 90%, #000000 100%);
          background-size: 200% 100%;
          box-shadow: 0 4px 15px rgba(105, 201, 208, 0.4);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .platform-tag {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 20px;
          z-index: 10;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .instagram-tag {
          background: rgba(225, 48, 108, 0.95);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          font-weight: 800;
        }

        .tiktok-tag {
          background: rgba(0, 0, 0, 0.95);
          color: #ffffff;
          border: 1px solid rgba(105, 201, 208, 0.4);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          font-weight: 800;
        }

        .platform-icon {
          width: 16px;
          height: 16px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .embed-wrapper {
          width: 100%;
          aspect-ratio: 9 / 16;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-top: 6px;
        }

        .social-iframe,
        .tiktok-embed {
          width: 100% !important;
          max-width: 100% !important;
          height: 100% !important;
          border: none;
          border-radius: 0;
        }

        .loading-tiktok {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: white;
          height: 100%;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #69C9D0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .card-footer {
          padding: 1.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .card-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
        }

        .instagram-footer {
          background: linear-gradient(135deg, 
            #ffeef7 0%, #fff0f8 25%, #fce7f3 50%, 
            #fdf2f8 75%, #ffeef7 100%);
          border-top: 2px solid rgba(225, 48, 108, 0.1);
          position: relative;
        }

        .instagram-footer::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
          animation: gradientShift 4s ease-in-out infinite;
          background-size: 200% 100%;
        }

        .tiktok-footer {
          background: linear-gradient(135deg, 
            #f0f9ff 0%, #e0f2fe 25%, #e6fffa 50%, 
            #f0fdfa 75%, #f0f9ff 100%);
          border-top: 2px solid rgba(105, 201, 208, 0.2);
          position: relative;
        }

        .tiktok-footer::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            #69C9D0, #EE1D52, #000000, #69C9D0);
          animation: gradientShift 4s ease-in-out infinite reverse;
          background-size: 200% 100%;
        }

        .follow-text {
          font-weight: 700;
          font-size: 0.95rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .follow-text::before,
        .follow-text::after {
          content: '';
          width: 30px;
          height: 2px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .social-media-showcase {
            padding: 3rem 0;
          }

          .section-title {
            font-size: 2rem;
          }

          .section-description {
            font-size: 1rem;
          }

          .posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            max-width: 400px;
          }

          .platform-tag {
            font-size: 0.75rem;
            padding: 0.4rem 0.8rem;
          }

          .platform-icon {
            width: 14px;
            height: 14px;
          }

          .embed-wrapper {
            aspect-ratio: 9 / 16;
          }
        }

        @media (max-width: 480px) {
          .posts-grid {
            max-width: 350px;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .card-footer {
            padding: 1rem;
          }

          .follow-text {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </section>
  );
};

export default SocialMediaShowcase;