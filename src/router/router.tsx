import { Suspense } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useRouteError,
} from "react-router";
import { BlankLayout } from "@/layouts/BlankLayout";
import SidebarLayout, { Body } from "@/layouts/SidebarLayout";
import { CyclePage } from "@/pages/project/CyclePage";
import { ModulePage } from "@/pages/project/ModulePage";
import { TaskPage } from "@/pages/project/tasks/TaskPage";
import { ViewsPage } from "@/pages/project/ViewsPage";
import { About, Connect, Home, PageLoader } from "./components";
import { ROUTES } from "./routes";
import { InboxPage } from "@/pages/manager/InboxPage";
import { ProjectPage } from "@/pages/manager/ProjectPage";
import { WorkspacePage } from "@/pages/manager/WorkspacePage";
import { MemberPage } from "@/pages/manager/MemberPage";

// Error boundary component for route-level errors
function RouteErrorBoundary() {
  const error = useRouteError();
  console.error("Route error:", error);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">
          Oops! Something went wrong
        </h1>
        <p className="mt-2 text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );
}

// Root layout component with Outlet Context
function RootLayout() {
  return (
    <SidebarLayout>
      <Suspense fallback={<PageLoader />}></Suspense>
      <Body>
        <Outlet />
      </Body>
    </SidebarLayout>
  );
}

// Create browser router with modern v7 patterns
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: ROUTES.ABOUT,
        element: <About />,
      },
      {
        path: ROUTES.TASKS,
        element: <TaskPage />,
      },
      {
        path: ROUTES.VIEWS,
        element: <ViewsPage />,
      },
      {
        path: ROUTES.MODULES,
        element: <ModulePage />,
      },
      {
        path: ROUTES.CYCLES,
        element: <CyclePage />,
      },
      {
        path: ROUTES.WORKSPACE,
        element: <WorkspacePage />,
      },
      {
        path: ROUTES.PROJECT,
        element: <ProjectPage />,
      },
      {
        path: ROUTES.INBOX,
        element: <InboxPage />,
      },
      {
        path: ROUTES.MEMBER,
        element: <MemberPage />,
      },
    ],
  },
  {
    path: "/",
    element: <BlankLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: ROUTES.CONNECT,
        element: <Connect />,
      },
    ],
  },
]);

// Router Provider Component
export const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
