'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useSounds } from '../../../utils/sounds';
import { staggerContainer, staggerItem } from '../../../components/motion/PageTransition';
import { useParams } from 'next/navigation';

interface Game {
  id: string;
  image: string;
  route: string;
}

export default function EduGamesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { playClick, playHover, playWhoosh } = useSounds();

  // Define the games based on the available images
  const games: Game[] = [
    {
      id: 'word-catch',
      image: '/images/custom/word_catch_game.png',
      route: `/${locale}/games/word-catch`
    },
    {
      id: 'word-search',
      image: '/images/custom/word_search_game.png',
      route: `/${locale}/games/word-search`
    },
    {
      id: 'crossword',
      image: '/images/custom/cross_word_game.png',
      route: `/${locale}/games/crossword`
    },
    {
      id: 'board-game',
      image: '/images/custom/board_game.png',
      route: `/${locale}/games/board-game`
    }
  ];

  return (
    <div className="edugames-page">
      <div className="edugames-container">
        {/* Hero Section */}
        <motion.div 
          className="edugames-hero"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.h1 
            className="edugames-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('games.title') || 'EduGames'}
          </motion.h1>
          <motion.p 
            className="edugames-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t('games.subtitle') || 'Learn while playing with our collection of educational games designed to make learning fun and engaging!'}
          </motion.p>
        </motion.div>

        {/* Games Showcase Grid */}
        <motion.div 
          className="edugames-showcase"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              className="edugames-showcase__item"
              variants={staggerItem}
              custom={index}
            >
              <Link 
                href={game.route}
                className="edugames-showcase__link"
                onClick={() => {
                  playClick();
                  playWhoosh('out');
                }}
                onMouseEnter={() => playHover()}
              >
                <motion.div
                  className="edugames-showcase__glass"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: -5,
                    z: 50,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {/* Glass effects layers */}
                  <div className="edugames-showcase__glass-layer" />
                  <div className="edugames-showcase__shimmer" />
                  
                  {/* Main Image */}
                  <div className="edugames-showcase__image-wrapper">
                    <Image
                      src={game.image}
                      alt={`Game ${index + 1}`}
                      width={400}
                      height={600}
                      className="edugames-showcase__image"
                      priority={true}
                      quality={100}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  
                  {/* Hover overlay effects */}
                  <div className="edugames-showcase__overlay">
                    <div className="edugames-showcase__glow" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}