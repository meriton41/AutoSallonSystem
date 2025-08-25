"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  name?: string;
  token?: string;
  role?: string;
  userId?: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return decoded.exp < currentTime;
};

// Helper to parse JWT and extract claims
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.token && !isTokenExpired(userData.token)) {
        setUser(userData);
        setToken(userData.token);
      } else {
        refreshToken().catch(() => {
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        });
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("https://localhost:7234/api/account/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // include cookies
      body: JSON.stringify({ Email: email, Password: password }),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.token) {
      // Decode the JWT token to get the role and userId
      const decoded = parseJwt(data.token);
      const role =
        decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decoded?.role ||
        null;
      const userId =
        decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        decoded?.sub ||
        null;
      const userRole = Array.isArray(role) ? role[0] : role;
      const loggedInUser: User = { 
        email, 
        token: data.token,
        role: userRole,
        userId
      };
      setUser(loggedInUser);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      if (typeof window !== "undefined") {
        router.push("/");
      }
    } else {
      throw new Error("No token in response");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      router.push("/");
    }
  };

  const refreshToken = async () => {
    const response = await fetch("https://localhost:7234/api/Account/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    if (data.token) {
      // Decode the new token to get the role
      const decoded = parseJwt(data.token);
      const role =
        decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decoded?.role ||
        null;
      const userRole = Array.isArray(role) ? role[0] : role;
      
      const updatedUser = user ? { 
        ...user, 
        token: data.token,
        role: userRole 
      } : null;
      
      if (updatedUser) {
        setUser(updatedUser);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } else {
      throw new Error("No token in response");
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
