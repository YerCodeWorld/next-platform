// apps/web-next/components/home/TilesWrapper.tsx - FIXED
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import "./../../styles/home/tiles.css";

interface TileItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    color: string;
}

interface TilesProps {
    translations: {
        title: string;
        subtitle: string;
        explore: string;
        tiles: {
            [key: string]: {
                title: string;
                subtitle: string;
            };
        };
    };
    locale: string;
}

const Tiles: React.FC<TilesProps> = ({ translations, locale }) => {
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const t = translations;

    const tilesData: TileItem[] = [
        {
            id: 'teachers',
            title: t.tiles.tile1.title,
            description: t.tiles.tile1.subtitle,
            image: '/images/teaching.jpg',
            link: `/${locale}/teachers`,
            color: '#8d82c4',
        },
        {
            id: 'games',
            title: t.tiles.tile4.title,
            description: t.tiles.tile4.subtitle,
            image: '/images/games.jpg',
            link: `/${locale}/exercises`,
            color: '#e7b788',
        },
        {
            id: 'articles',
            title: t.tiles.tile3.title,
            description: t.tiles.tile3.subtitle,
            image: '/images/articles.png',
            link: `/${locale}/blog`,
            color: '#6fc3df',
        },
        {
            id: 'courses',
            title: t.tiles.tile2.title,
            description: t.tiles.tile2.subtitle,
            image: '/images/courses.jpg',
            link: `/${locale}/construction/courses`,
            color: '#ec8d81',
        },
        {
            id: 'compete',
            title: t.tiles.tile5.title,
            description: t.tiles.tile5.subtitle,
            image: '/images/compete.jpg',
            link: `/${locale}/construction/match`,
            color: '#8ea9e8',
        },
        {
            id: 'discussion',
            title: t.tiles.tile6.title,
            description: t.tiles.tile6.subtitle,
            image: '/images/discussion.jpg',
            link: `/${locale}/construction/discussion`,
            color: '#87c5a4',
        },
    ];

    // Preload images to prevent blank tiles during scroll
    useEffect(() => {
        const preloadImages = async () => {
            const imagePromises = tilesData.map((tile) => {
                return new Promise<void>((resolve) => {
                    const img = new window.Image();
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if image fails
                    img.src = tile.image;
                });
            });

            await Promise.all(imagePromises);
            setImagesLoaded(true);
        };

        preloadImages();
    }, []);

    return (
        <section id="explore" className="tiles-section">
        <div className="section-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
        </div>

        <div className="tiles-container">
        {tilesData.map((tile) => (
            <Link href={tile.link} key={tile.id}>
            <article className="tile-article" data-color={tile.color}>
            {/* Use Next.js Image instead of background-image */}
            <div className="tile-image-container">
            <Image
            src={tile.image}
            alt={tile.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={tile.id === 'teachers'} // Priority load first tile
            quality={85}
            />
            </div>

            {/* Color overlay */}
            <span
            className="tile-background"
            style={{ backgroundColor: tile.color }}
            />

            <div className="tile-content">
            <header>
            <h3>{tile.title}</h3>
            <p>{tile.description}</p>
            </header>
            <div className="tile-link" aria-label={`Learn more about ${tile.title}`}>
            <span className="link-text">{t.explore}</span>
            <span className="link-icon" aria-hidden="true">→</span>
            </div>
            </div>
            </article>
            </Link>
        ))}
        </div>
        </section>
    );
};

export default Tiles;
