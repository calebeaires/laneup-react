import { useNavigate, useLocation } from "react-router";
import { ROUTES, type RoutePaths } from "./routes";

/**
 * Custom hook for type-safe navigation with React Router v7
 */
export const useAppNavigate = () => {
  const navigate = useNavigate();

  const navigateTo = (
    path: RoutePaths,
    options?: {
      replace?: boolean;
      state?: unknown;
      preventScrollReset?: boolean;
      relative?: "route" | "path";
    },
  ) => {
    navigate(path, options);
  };

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return {
    navigateTo,
    goBack,
    goForward,
    navigate, // Expose the raw navigate for advanced usage
  };
};

/**
 * Custom hook to get current route information
 */
export const useCurrentRoute = () => {
  const location = useLocation();

  const isActive = (path: RoutePaths): boolean => {
    return location.pathname === path;
  };

  const isPartialMatch = (path: RoutePaths): boolean => {
    return location.pathname.startsWith(path);
  };

  return {
    pathname: location.pathname as RoutePaths,
    search: location.search,
    hash: location.hash,
    state: location.state,
    key: location.key,
    isActive,
    isPartialMatch,
  };
};

/**
 * Navigation utilities
 */
export const navigation = {
  /**
   * Get all available routes
   */
  getRoutes: () => Object.values(ROUTES),

  /**
   * Check if a path is valid
   */
  isValidRoute: (path: string): path is RoutePaths => {
    return Object.values(ROUTES).includes(path as RoutePaths);
  },

  /**
   * Get route by key
   */
  getRoute: (key: keyof typeof ROUTES): RoutePaths => {
    return ROUTES[key];
  },

  /**
   * Build URL with query parameters
   */
  buildUrl: (
    path: RoutePaths,
    params?: Record<string, string | number | boolean>,
  ): string => {
    if (!params) return path;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  },

  /**
   * Parse query parameters from current URL
   */
  parseSearchParams: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  },
};

/**
 * Navigation menu items for UI components
 */
export const navigationItems = [
  {
    label: "Home",
    path: ROUTES.HOME,
    icon: "🏠",
  },
  {
    label: "About",
    path: ROUTES.ABOUT,
    icon: "ℹ️",
  },
  {
    label: "Connect",
    path: ROUTES.CONNECT,
    icon: "🔗",
  },
] as const;

export type NavigationItem = (typeof navigationItems)[number];
