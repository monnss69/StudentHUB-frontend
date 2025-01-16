import { AuthContextType } from "@/types";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "@/services/api";

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to safely get cookie value
const getCookie = (name: string): string | null => {
  try {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1]
      ?.trim() || null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
};

// Helper function to set cookie with proper attributes for cross-origin usage
const setCookie = (name: string, value: string) => {
  // Set cookie with same attributes as backend for consistency
  document.cookie = `${name}=${value}; path=/; domain=studenthub-backend.vercel.app; secure=true; samesite=none; max-age=9999999`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken_] = useState<string | null>(() => {
    const savedToken = getCookie("token");
    if (savedToken) {
      // Configure axios with the token on initial load
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
    return savedToken;
  });

  // Sync cookie with token state and ensure persistence
  useEffect(() => {
    const cookieToken = getCookie("token");
    
    // If there's a token in state but not in cookie, restore the cookie
    if (token && !cookieToken) {
      setCookie("token", token);
    }
    // If there's a cookie but no token in state, update state
    else if (cookieToken && !token) {
      setToken_(cookieToken);
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${cookieToken}`;
    }
  }, [token]);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      setToken_(newToken);
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      setToken_(null);
      delete axios.defaults.headers.common["Authorization"];
      // Clear cookie on logout
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      apiService.logout();
    }
  };

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