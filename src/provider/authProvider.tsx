import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthContextType, DecodedToken } from "@/types";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken_] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced token management with local storage backup
  const setToken = (newToken: string | null) => {
    if (newToken) {
      setToken_(newToken);
      localStorage.setItem('auth_token', newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      setToken_(null);
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, check localStorage for existing token
        const storedToken = localStorage.getItem('auth_token');
        
        if (storedToken) {
          // Verify token is still valid
          try {
            const decoded: DecodedToken = jwtDecode(storedToken);
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (decoded.exp > currentTime) {
              setToken_(storedToken);
              axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            } else {
              // Token expired, clear it
              localStorage.removeItem('auth_token');
            }
          } catch (error) {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
          }
        }

        // Configure global axios defaults
        axios.defaults.withCredentials = true;
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};