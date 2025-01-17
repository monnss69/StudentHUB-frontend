import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../provider/authProvider.tsx";
import { Github, Linkedin, Mail } from 'lucide-react';
import Logout from "../pages/Logout";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex flex-col">
      {/* Navigation Bar */}
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
                    to="/profile"
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

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Developer Credits Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-blue-900/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-400 text-sm">
              <p>Developed by <span className="text-blue-400 font-medium">Pham Hai Minh</span></p>
              <p className="text-gray-500 text-xs mt-1">It's a good day to code!</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/monnss69"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:e1375556@u.nus.edu"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;