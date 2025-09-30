export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  TASKS: "/tasks",
  VIEWS: "/views",
  MODULES: "/modules",
  CYCLES: "/cycles",
  INBOX: "/inbox",
  PROJECT: "/project",
  WORKSPACE: "/workspace",
  MEMBER: "/members",
  CONNECT: "/connect",
  RENDER_TEST: "/render-test",
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RoutePaths = (typeof ROUTES)[RouteKeys];
