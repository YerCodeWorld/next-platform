// apps/web-next/components/home/TilesWrapper.tsx
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import "./../../styles/home/tiles.css";
// import Image from 'next/image';

// Import images - we'll need to move these or reference them properly
const teach = '/images/teaching.jpg';
const compete = '/images/compete.jpg';
const discuss = '/images/discussion.jpg';
const play = '/images/games.jpg';
const course = '/images/courses.jpg';
const blog = '/images/articles.png';

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
    const tilesRef = useRef<HTMLElement>(null);
    const t = translations;

    const tilesData: TileItem[] = [
        {
            id: 'teachers',
            title: t.tiles.tile1.title,
            description: t.tiles.tile1.subtitle,
            image: teach,
            link: `/${locale}/teachers`,
            color: '#8d82c4',
        },
        {
            id: 'games',
            title: t.tiles.tile4.title,
            description: t.tiles.tile4.subtitle,
            image: play,
            link: `/${locale}/exercises`,
            color: '#e7b788',
        },
        {
            id: 'articles',
            title: t.tiles.tile3.title,
            description: t.tiles.tile3.subtitle,
            image: blog,
            link: `/${locale}/blog`,
            color: '#6fc3df',
        },
        {
            id: 'courses',
            title: t.tiles.tile2.title,
            description: t.tiles.tile2.subtitle,
            image: course,
            link: `/${locale}/construction/courses`,
            color: '#ec8d81',
        },
        {
            id: 'compete',
            title: t.tiles.tile5.title,
            description: t.tiles.tile5.subtitle,
            image: compete,
            link: `/${locale}/construction/match`,
            color: '#8ea9e8',
        },
        {
            id: 'discussion',
            title: t.tiles.tile6.title,
            description: t.tiles.tile6.subtitle,
            image: discuss,
            link: `/${locale}/construction/discussion`,
            color: '#87c5a4',
        },
    ];

    return (
        <section id="explore" className="tiles-section" ref={tilesRef}>
            <div className="section-header">
                <h2>{t.title}</h2>
                <p>{t.subtitle}</p>
            </div>

            <div className="tiles-container">
                {tilesData.map((tile) => (
                    <Link href={tile.link} key={tile.id}>
                        <article
                            className="tile-article"
                            style={{
                                backgroundImage: `url(${tile.image})`,
                            }}
                            data-color={tile.color}
                        >
                            <span className="tile-background" style={{ backgroundColor: tile.color }}></span>
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