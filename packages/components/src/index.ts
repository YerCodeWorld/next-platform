// packages/components/src/index.ts

export { default as Header } from "./components/Header";
export { default as Footer } from "./components/Footer";
export { default as Menu } from "./components/Menu";
export { default as Banner } from "./components/BannerTwo";
export { default as Statistics } from "./components/StatisticsOne";
export { default as Testimonials } from "./components/Testimonies";
export { default as SectionsCardsTwo } from "./components/SectionsCardsTwo";
export { default as Marquee } from "./components/min/Marquee";
export { default as BlogShowCase } from "./components/PostsShowCase";
export { default as Breadcrumb } from "./components/global/BreadCrumb";
export { default as BlogGrid } from "./components/blog/BlogGrid";
export { default as DynamicsGrid } from "./components/activities/DynamicsGrid";
export { default as TeachersGrid } from "./components/teachers/TeachersGrid";

// Site components
export { default as GeneralInfoOne } from "./components/site/GeneralInfoOne";
export { default as GeneralInfoFour } from "./components/site/GeneralInfoFour";
export { default as GeneralInfoThree } from "./components/site/GeneralInfoThree";
export { default as GeneralInforTwo } from "./components/site/GeneralInforTwo";
export { default as MissionAndValues } from "./components/site/MissionAndValues";
export { default as SiteContact } from "./components/site/SiteContact";

export * from "./components/profile"
// export { default as TeacherComments } from "./components/teachers/TeacherComments";

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