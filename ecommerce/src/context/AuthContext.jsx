"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      // Verify token and get user data
      api
        .get("/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          // If token is invalid, clear it
          Cookies.remove("auth_token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      // Set token in cookie with 1 day expiry
      Cookies.set("auth_token", token, { expires: 1 });

      setUser(user);
      return user;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Invalid email or password";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post("/register", userData);
      const { token, user } = response.data;

      // Set token in cookie with 1 day expiry
      Cookies.set("auth_token", token, { expires: 1 });

      setUser(user);
      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token
      await api.post("/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear token and user data regardless of API call success
      Cookies.remove("auth_token");
      setUser(null);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put("/me", updatedData);
      const updatedUser = response.data;
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
