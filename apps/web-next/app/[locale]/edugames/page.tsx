'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSounds } from '../../../utils/sounds';
import { useParams } from 'next/navigation';

export default function EduGamesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { playClick } = useSounds();

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
            {t('games.title') || 'Games Coming Soon'}
          </motion.h1>
          <motion.p 
            className="edugames-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t('games.subtitle') || 'Games have been temporarily disabled. Please check out our interactive exercises instead!'}
          </motion.p>
        </motion.div>

        {/* Redirect to Exercises */}
        <motion.div 
          className="edugames-redirect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link 
            href={`/${locale}/exercises`}
            className="edugames-redirect-button"
            onClick={() => playClick()}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="redirect-content"
            >
              <h3>Try Our Interactive Exercises</h3>
              <p>Engage with our comprehensive exercise system featuring fill-in-the-blanks, matching, multiple choice, and more!</p>
              <span className="redirect-arrow">→</span>
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}