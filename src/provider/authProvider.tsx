import { AuthContextType } from "@/types";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "@/services/api";

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken_] = useState<string | null>(() => {
    const savedToken = getCookie("token");
    if (savedToken) {
      // Configure axios with the token
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
    return savedToken;
  });

  // Set token with proper cookie handling
  const setToken = (newToken: string | null) => {
    if (newToken) {
      // Token will be set by the backend cookie
      setToken_(newToken);
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      setToken_(null);
      delete axios.defaults.headers.common["Authorization"];
      // Let the backend handle cookie removal
      apiService.logout();
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated: !!token }}>
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