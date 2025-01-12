import { AuthContextType } from "@/types";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

const getCookie = (name: string): string | null => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

const clearCookie = (name: string): void => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const AuthProvider = ({ children }: {children: React.ReactNode}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [token, setToken_] = useState<string | null>(() => {
    return getCookie("token");
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = getCookie("token");
      if (!currentToken) {
        setToken_(null);
        configureAxios(null);
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Configure axios defaults
  const configureAxios = (token: string | null): void => {
    if (token) {
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Validate token and set up authentication state
  const validateToken = async (): Promise<void> => {
    const savedToken = getCookie("token");
    if (!savedToken) {
      setToken_(null);
      setIsLoading(false);
      return;
    }

    try {
      configureAxios(savedToken);
      setToken_(savedToken);
    } catch (error) {
      console.error("Token validation failed:", error);
      setToken_(null);
      clearCookie("token");
      configureAxios(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Token setter function that manages all storage locations
  const setToken = (newToken: string | null): void => {
    if (newToken) {
      configureAxios(newToken);
      setToken_(newToken);
    } else {
      clearCookie("token");
      configureAxios(null);
      setToken_(null);
      validateToken();
    }
  };

  // Run initial token validation
  useEffect(() => {
    validateToken();
  }, []);

  // Derived authentication state
  const isAuthenticated = Boolean(token);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      isAuthenticated,
      refreshAuth: validateToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};