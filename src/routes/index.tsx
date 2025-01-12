import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AcademicHub from '../pages/AcademicHub';
import CampusCommunity from '../pages/CampusCommunity';
import PlatformSupport from '../pages/PlatformSupport';
import CreatePost from '../pages/CreatePost';
import MyProfile from "../pages/MyProfile";
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
    }
  ];

  // Routes only accessible when not authenticated
  const authRoutes = [
    {
      path: "/login",
      element: !isAuthenticated ? <Login /> : <Navigate to="/" replace />,
      errorElement: <ErrorState message="Authentication error" />
    },
    {
      path: "/register",
      element: !isAuthenticated ? <Register /> : <Navigate to="/" replace />,
      errorElement: <ErrorState message="Registration error" />
    }
  ];

  // Routes that require authentication
  const protectedRoutes = [
    {
      path: "/post/academic-hub",
      element: isAuthenticated ? <AcademicHub /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to load Academic Hub" />
    },
    {
      path: "/post/campus-community",
      element: isAuthenticated ? <CampusCommunity /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to load Campus Community" />
    },
    {
      path: "/post/platform-support",
      element: isAuthenticated ? <PlatformSupport /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to load Platform Support" />
    },
    {
      path: '/post/:id',
      element: isAuthenticated ? <PostDetail /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to load post" />
    },
    {
      path: "/create-post",
      element: isAuthenticated ? <CreatePost /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to create post" />
    },
    {
      path: "/my-profile",
      element: isAuthenticated ? <MyProfile /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to load profile" />
    },
    {
      path: "/edit-post/:id",
      element: isAuthenticated ? <EditPost /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to edit post" />
    },
    {
      path: "/edit-profile",
      element: isAuthenticated ? <EditUser /> : <Navigate to="/login" replace />,
      errorElement: <ErrorState message="Failed to edit profile" />
    }
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
          element: <ErrorState message="Page not found" />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;