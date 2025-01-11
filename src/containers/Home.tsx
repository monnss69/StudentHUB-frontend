import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authProvider.tsx";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const letterArray = "StudentHub Singapore".split("");

  return (
    // Using multiple color stops for a smoother gradient transition
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 via-blue-900 to-gray-900">
      {/* Background animation elements with adjusted opacity and blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-32 w-96 h-96 bg-blue-500/10 rounded-full 
                     mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
        />
        <div 
          className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full 
                     mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        />
        <div 
          className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full 
                     mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        />
      </div>

      {/* Gradient overlay for additional smoothness */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/30" />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center p-4 mt-40">
        <div className="text-center">
          {/* Animated Text */}
          <div className="flex flex-wrap justify-center gap-x-2 mb-8">
            {letterArray.map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent 
                           bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-5 
                           drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>

          {/* Subtitle with enhanced glow effect */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-blue-200/90 max-w-2xl mx-auto mb-12 
                       drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
          >
            Empowering students to achieve academic excellence
          </motion.p>

          {/* CTA Buttons */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/login">
                <button 
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700
                           text-white rounded-lg shadow-lg hover:shadow-blue-500/50 
                           transition-all duration-300 transform hover:-translate-y-1 
                           hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600
                           ring-1 ring-blue-400/30"
                >
                  Log In
                </button>
              </Link>
              <Link to="/register">
                <button 
                  className="px-8 py-3 bg-gray-800/80 backdrop-blur-sm text-blue-200 
                           rounded-lg shadow-lg hover:shadow-purple-500/20 
                           transition-all duration-300 transform hover:-translate-y-1 
                           hover:bg-gray-700/80 ring-1 ring-blue-400/20"
                >
                  Sign Up
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </div>
  );
};

export default Home;