import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { QUERY_KEYS } from "@/constants/queryKeys";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PageFeed from "@/containers/PageFeed";
import CreatePost from "../pages/CreatePost";
import PageProfile from "@/containers/PageProfile";
import PostDetail from "../components/PostDetail";
import EditPost from "@/pages/EditPost";
import ErrorState from "@/components/ErrorState";
import EditUser from "@/components/EditUser";

const Routes = () => {
  const { isAuthenticated } = useAuth();

  // Routes that are always accessible
  const publicRoutes = [
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorState message="Something went wrong" />,
    },
  ];

  // Routes only accessible when not authenticated
  const authRoutes = [
    {
      path: "/login",
      element: !isAuthenticated ? <Login /> : <Navigate to="/" replace />,
      errorElement: <ErrorState message="Authentication error" />,
    },
    {
      path: "/register",
      element: !isAuthenticated ? <Register /> : <Navigate to="/" replace />,
      errorElement: <ErrorState message="Registration error" />,
    },
  ];

  // Routes that require authentication
  const protectedRoutes = [
    {
      path: "/post/academic-hub",
      element: isAuthenticated ? (
        <PageFeed
          category="Academic Hub"
          queryKey={QUERY_KEYS.ACADEMIC_HUB}
          title="Academic Hub"
          sidebarCategory="Academic"
        />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to load Academic Hub" />,
    },
    {
      path: "/post/campus-community",
      element: isAuthenticated ? (
        <PageFeed
          category="Campus Community"
          queryKey={QUERY_KEYS.CAMPUS_COMMUNITY}
          title="Campus Community"
          sidebarCategory="Community"
        />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to load Campus Community" />,
    },
    {
      path: "/post/platform-support",
      element: isAuthenticated ? (
        <PageFeed
          category="Platform Support"
          queryKey={QUERY_KEYS.PLATFORM_SUPPORT}
          title="Platform Support"
          sidebarCategory="Support"
        />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to load Platform Support" />,
    },
    {
      path: "/post/:id",
      element: isAuthenticated ? (
        <PostDetail />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to load post" />,
    },
    {
      path: "/create-post",
      element: isAuthenticated ? (
        <CreatePost />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to create post" />,
    },
    {
      path: "/profile/:id?",
      element: isAuthenticated ? (
        <PageProfile />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to load profile" />,
    },
    {
      path: "/edit-post/:id",
      element: isAuthenticated ? (
        <EditPost />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to edit post" />,
    },
    {
      path: "/edit-profile",
      element: isAuthenticated ? (
        <EditUser />
      ) : (
        <Navigate to="/login" replace />
      ),
      errorElement: <ErrorState message="Failed to edit profile" />,
    },
  ];

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorState message="Application error" />,
      children: [
        ...publicRoutes,
        ...authRoutes,
        ...protectedRoutes,
        // Catch-all route for 404
        {
          path: "*",
          element: <ErrorState message="Page not found" />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
