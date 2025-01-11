import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../context/authProvider.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";
import { Layout } from '../components/common';
import { PostDetail } from '../components/post';
import { ErrorState } from '../components/common';
import Home from '../containers/Home.tsx';
import Login from '../containers/Login.tsx';
import Register from '../containers/Register.tsx';
import AcademicHub from '../containers/AcademicHub.tsx';
import CampusCommunity from '../containers/CampusCommunity.tsx';
import PlatformSupport from '../containers/PlatformSupport.tsx';
import CreatePost from '../containers/CreatePost.tsx';
import MyProfile from "../containers/MyProfile.tsx";
import EditPost from "../containers/EditPost.tsx";

const Routes = () => {
  const { isAuthenticated } = useAuth();

  const publicRoutes = [
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorState message="Something went wrong" />,
    }
  ];

  const authRoutes = [
    {
      path: "/login",
      element: <Login />,
      errorElement: <ErrorState message="Authentication error" />
    },
    {
      path: "/register",
      element: <Register />,
      errorElement: <ErrorState message="Registration error" />
    }
  ];

  const protectedRoutes = [
    {
      path: "/post/academic-hub",
      element: <AcademicHub />,
      errorElement: <ErrorState message="Failed to load Academic Hub" />
    },
    {
      path: "/post/campus-community",
      element: <CampusCommunity />,
      errorElement: <ErrorState message="Failed to load Campus Community" />
    },
    {
      path: "/post/platform-support",
      element: <PlatformSupport />,
      errorElement: <ErrorState message="Failed to load Platform Support" />
    },
    {
      path: '/posts/:id',
      element: <PostDetail />,
      errorElement: <ErrorState message="Failed to load post" />
    },
    {
      path: "/create-post",
      element: <CreatePost />,
      errorElement: <ErrorState message="Failed to create post" />
    },
    {
      path: "/my-profile",
      element: <MyProfile />,
      errorElement: <ErrorState message="Failed to load profile" />
    },
    {
      path: "/edit-post/:id",
      element: <EditPost />,
      errorElement: <ErrorState message="Failed to edit post" />
    }
  ];

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorState message="Application error" />, // Add root error element
      children: [
        // Public routes are always available
        ...publicRoutes,
        
        // Auth routes only available when not logged in
        ...(!isAuthenticated ? authRoutes : []),
        
        // Protected routes wrapped in ProtectedRoute component
        {
          element: <ProtectedRoute />,
          errorElement: <ErrorState message="Protected route error" />, // Add error element for protected routes
          children: protectedRoutes
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;