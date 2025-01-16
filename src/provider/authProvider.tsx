import { AuthContextType } from "@/types";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize authentication state based on presence of Authorization header
  const [token, setToken_] = useState<string | null>(() => {
    // Check if axios has an Authorization header set
    const authHeader = axios.defaults.headers.common["Authorization"];
    if (authHeader && typeof authHeader === "string") {
      return authHeader.split(" ")[1];
    }
    return null;
  });

  // Enhanced token management
  const setToken = (newToken: string | null) => {
    if (newToken) {
      // When we receive a new token, set up axios defaults
      setToken_(newToken);
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      // When logging out, clean up axios defaults
      setToken_(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Effect to handle authentication state consistency
  useEffect(() => {
    // Configure global axios defaults
    axios.defaults.withCredentials = true;
    
    // Set up axios response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // If we get an unauthorized response, clear the token
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated: !!token }}>
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