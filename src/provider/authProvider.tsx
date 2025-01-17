import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContextType, DecodedToken } from "@/types";
import { apiService } from "@/services/api";
import LoadingState from "@/components/LoadingState";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken_] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simplified token management
    const setToken = async (newToken: string | null) => {
        try {
            if (newToken) {
                // Sync token with backend first
                await apiService.syncToken(newToken);
                // If sync successful, update state and storage
                setToken_(newToken);
                localStorage.setItem('auth_token', newToken);
            } else {
                // Handle logout
                await apiService.logout();
                setToken_(null);
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Token management error:', error);
            setToken_(null);
            localStorage.removeItem('auth_token');
        }
    };

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                
                if (storedToken) {
                    // Verify token expiration
                    const decoded: DecodedToken = jwtDecode(storedToken);
                    const currentTime = Math.floor(Date.now() / 1000);
                    
                    if (decoded.exp > currentTime) {
                        // Token is valid, sync with backend
                        await apiService.syncToken(storedToken);
                        setToken_(storedToken);
                    } else {
                        // Token is expired
                        await setToken(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                await setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    if (isLoading) {
        return <LoadingState />;
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