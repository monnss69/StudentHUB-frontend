import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const getCookie = (name) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

const setSecureCookie = (name, value, maxAge = 86400) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearCookie = (name) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const [token, setToken_] = useState(() => {
    return getCookie("token") || null;
  });

  // Configure axios defaults
  const configureAxios = (token) => {
    if (token) {
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Validate token and set up authentication state
  const validateToken = async () => {
    const savedToken = getCookie("token");
    if (!savedToken) {
      setToken_(null);
      setIsLoading(false);
      return;
    }

    try {
      configureAxios(savedToken);
      setToken_(savedToken);
      setSecureCookie("token", savedToken);
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
  const setToken = (newToken) => {
    if (newToken) {
      setSecureCookie("token", newToken);
      configureAxios(newToken);
      setToken_(newToken);
    } else {
      clearCookie("token");
      configureAxios(null);
      setToken_(null);
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