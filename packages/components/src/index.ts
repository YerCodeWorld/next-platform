// packages/components/src/index.ts

export { default as Header } from "./components/Header";
export { default as Footer } from "./components/Footer";
export { default as Menu } from "./components/Menu";
export { default as Banner } from "./components/BannerTwo";
export { default as Statistics } from "./components/StatisticsOne";
export { default as Testimonials } from "./components/Testimonies";
export { default as SectionsCardsTwo } from "./components/SectionsCardsTwo";
export { default as Marquee } from "./components/sub/Marquee";
export { default as BlogShowCase } from "./components/PostsShowCase";
export { default as Breadcrumb } from "./components/global/BreadCrumb";
export { default as BlogGrid } from "./components/blog/BlogGrid";
export { default as DynamicsGrid } from "./components/activities/DynamicsGrid";
// Temporarily commented out to fix React version conflict
export { default as TeacherCard } from "./components/TeacherCard";
export { default as TeachersGrid } from "./components/TeachersGrid";
export { default as TeacherComments } from "./components/TeacherComments";

// Re-export hooks that are still needed
export { useIsInView } from "./hooks/useIsInView";
export {
    themeColors,
    convertColorPreference,
    getPageColorFromHex,
    setColor,
    useThemeManager,
    applyTheme,
    getThemeByValue
} from "./hooks/useThemeManager";

// Export types for better TypeScript support
export type { StatItem } from "./components/StatisticsOne";
export type { TeacherProfile } from "@repo/api-bridge";

import "../assets/css/global.css";
import "../assets/css/teacherProfile.css";
import "../assets/css/teacherDiscovery.css";