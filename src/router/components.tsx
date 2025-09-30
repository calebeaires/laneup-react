import { lazy } from "react";

// Lazy load components for better performance
export const Home = lazy(() => import("../pages/Home"));
export const About = lazy(() => import("../pages/About"));
export const Connect = lazy(() => import("../pages/connect/Connect"));

// Loading component
export const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);
