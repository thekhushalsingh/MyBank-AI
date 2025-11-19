import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthHook {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage only on client side
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchUser(): Promise<User | null> {
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token is invalid - clear it
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Error fetching user:", err);
      // Don't clear token on network errors, only on auth errors
      if (err instanceof Error && err.message.includes("401")) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
      return null;
    }
  }

  async function login(newToken: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        
        // Immediately fetch user and wait for it
        fetchUser().finally(() => {
          setIsLoading(false);
          resolve();
        });
      } catch (err) {
        console.error("Error saving token:", err);
        setIsLoading(false);
        resolve();
      }
    });
  }

  function logout() {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      // Use window.location for reliable navigation
      window.location.href = "/";
    } catch (err) {
      console.error("Error during logout:", err);
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  return { 
    user, 
    token, 
    login, 
    logout, 
    isLoading 
  };
}