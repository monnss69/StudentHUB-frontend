import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import Logout from "../pages/Logout";
import MyProfile from "@/pages/MyProfile";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-blue-900/50 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-xl font-semibold text-blue-300 hover:text-blue-200 transition-colors"
              >
                StudentHub
              </Link>
              {isAuthenticated && (
                <div className="hidden sm:flex sm:space-x-4">
                  <Link
                    to="/post/academic-hub"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Academic Hub
                  </Link>
                  <Link
                    to="/post/campus-community"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Campus Community
                  </Link>
                  <Link
                    to="/post/platform-support"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Platform Support
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Logout />
                  <Link
                    to="/my-profile"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors
                             ring-1 ring-blue-500/50 hover:ring-blue-400"
                  >
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors
                             ring-1 ring-blue-500/50 hover:ring-blue-400"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
