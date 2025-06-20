'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSounds } from '../../utils/sounds';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Basic page transition variants (kept for potential future use)
// const pageVariants = {
//   initial: {
//     opacity: 0,
//     scale: 0.95,
//     rotateX: -15,
//     y: 50,
//   },
//   in: {
//     opacity: 1,
//     scale: 1,
//     rotateX: 0,
//     y: 0,
//   },
//   out: {
//     opacity: 0,
//     scale: 1.05,
//     rotateX: 15,
//     y: -50,
//   },
// };

// Dynamic transition configs for different animation types
const getTransitionConfig = (variantType: string) => {
  switch (variantType) {
    case 'bounce':
      return {
        type: "spring" as const,
        damping: 15,
        stiffness: 300,
        duration: 0.8,
      };
    case 'liquid':
      return {
        type: "spring" as const,
        damping: 25,
        stiffness: 200,
        duration: 0.7,
      };
    case 'cube':
      return {
        duration: 0.8,
        ease: "easeInOut" as const,
      };
    case 'slide':
      return {
        duration: 0.9,
        ease: "easeOut" as const,
      };
    default:
      return {
        duration: 0.6,
        ease: "easeInOut" as const,
      };
  }
};

// New exciting transition variants
const liquidMorphVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    borderRadius: '50%',
    rotateZ: -45,
    x: 200,
    y: -200,
  },
  in: {
    opacity: 1,
    scale: 1,
    borderRadius: '0%',
    rotateZ: 0,
    x: 0,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.8,
    borderRadius: '50%',
    rotateZ: 45,
    x: -200,
    y: 200,
  },
};

const cubeFlipVariants = {
  initial: {
    opacity: 0,
    rotateY: -180,
    rotateX: -90,
    scale: 0.5,
    z: -500,
  },
  in: {
    opacity: 1,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    z: 0,
  },
  out: {
    opacity: 0,
    rotateY: 180,
    rotateX: 90,
    scale: 0.5,
    z: -500,
  },
};

const bounceZoomVariants = {
  initial: {
    opacity: 0,
    scale: 3,
    rotateZ: 360,
    y: -200,
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateZ: 0,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.1,
    rotateZ: -360,
    y: 200,
  },
};

// Different transition variants for different page types
const exercisePageVariants = {
  initial: {
    opacity: 0,
    x: '100%',
    rotateY: -90,
    scale: 0.8,
  },
  in: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: '-100%',
    rotateY: 90,
    scale: 0.8,
  },
};

const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.3,
    rotateZ: -180,
    y: 100,
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateZ: 0,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.3,
    rotateZ: 180,
    y: -100,
  },
};

const slideUpVariants = {
  initial: {
    opacity: 0,
    y: '100vh',
    scale: 0.9,
    rotateX: 45,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
  },
  out: {
    opacity: 0,
    y: '-100vh',
    scale: 0.9,
    rotateX: -45,
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { playWhoosh } = useSounds();

  // Determine which transition variant and type to use based on the route
  const getPageConfig = () => {
    if (pathname.includes('/exercises/') && pathname.includes('/practice/')) {
      return { variants: cubeFlipVariants, type: 'cube' }; // 3D cube flip for exercise practice
    }
    if (pathname.includes('/exercises/') && !pathname.includes('/practice/')) {
      return { variants: liquidMorphVariants, type: 'liquid' }; // Liquid morph for exercise selection
    }
    if (pathname.includes('/login') || pathname.includes('/teachers')) {
      return { variants: slideUpVariants, type: 'slide' }; // Dramatic slide up for login/teachers
    }
    if (pathname.includes('/blog') || pathname.includes('/activities')) {
      return { variants: bounceZoomVariants, type: 'bounce' }; // Bouncy zoom for content pages
    }
    if (pathname === '/en' || pathname === '/es' || pathname === '/') {
      return { variants: modalVariants, type: 'default' }; // Spinning entrance for homepage
    }
    return { variants: exercisePageVariants, type: 'default' }; // Side slide with rotation for other pages
  };

  // Play transition sound when pathname changes
  useEffect(() => {
    playWhoosh('in');
  }, [pathname, playWhoosh]);

  const pageConfig = getPageConfig();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        playWhoosh('out');
        window.scrollTo(0, 0);
      }}
    >
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageConfig.variants}
        transition={getTransitionConfig(pageConfig.type)}
        style={{
          width: '100%',
          minHeight: '100vh',
          transformPerspective: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Reusable motion components for common UI elements
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionCard = motion.div;

// Pre-configured animation variants for UI elements
export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  hover: {
    scale: 1.02,
    y: -5,
  },
  tap: {
    scale: 0.98,
  },
};

export const buttonVariants = {
  rest: {
    scale: 1,
    backgroundColor: 'var(--button-bg, #3b82f6)',
  },
  hover: {
    scale: 1.05,
    backgroundColor: 'var(--button-hover-bg, #2563eb)',
  },
  tap: {
    scale: 0.95,
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Loading spinner component
export function LoadingSpinner() {
  return (
    <motion.div
      className="flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

// Fade in/out transition wrapper
export function FadeTransition({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Slide in from direction
export function SlideTransition({ 
  children, 
  direction = 'up',
  delay = 0,
}: { 
  children: React.ReactNode; 
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}) {
  const directionVariants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directionVariants[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      exit={{ 
        opacity: 0, 
        ...directionVariants[direction] 
      }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Scale transition
export function ScaleTransition({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}