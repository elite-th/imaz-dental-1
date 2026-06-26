"use client";

import { useState, useEffect } from "react";
import { AdminUser, authApi } from "@/lib/api";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "../constants";

export function useAdminAuth() {
  /* ---- Auth state ---- */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  /* ---- Check auth on mount ---- */
  useEffect(() => {
    // Simple frontend-only auth check
    const loggedIn = localStorage.getItem("imaz-admin-logged-in");
    queueMicrotask(() => {
      if (loggedIn === "true") {
        setIsLoggedIn(true);
        setAdminUser({ id: "local", username: ADMIN_USERNAME, displayName: "منشی کلینیک" });
      }
      setAuthChecking(false);
    });
  }, []);

  /* ---- Login (frontend-only auth with hardcoded credentials) ---- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Frontend credential check — no backend auth needed
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setAdminUser({ id: "local", username: ADMIN_USERNAME, displayName: "منشی کلینیک" });
      localStorage.setItem("imaz-admin-logged-in", "true");
      setLoginLoading(false);
      return;
    }

    setLoginError("نام کاربری یا رمز عبور اشتباه است");
    setLoginLoading(false);
  };

  /* ---- Logout ---- */
  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem("imaz-admin-logged-in");
    setIsLoggedIn(false);
    setAdminUser(null);
    setUsername("");
    setPassword("");
  };

  /* ---- Admin display helpers ---- */
  const adminInitial = adminUser?.displayName?.charAt(0) || adminUser?.username?.charAt(0) || "م";
  const adminDisplayName = adminUser?.displayName || "منشی کلینیک";
  const adminEmail = adminUser?.username ? `${adminUser.username}@imaz.ir` : "admin@imaz.ir";

  return {
    authChecking,
    isLoggedIn,
    adminUser,
    username,
    password,
    loginError,
    loginLoading,
    setUsername,
    setPassword,
    handleLogin,
    handleLogout,
    adminInitial,
    adminDisplayName,
    adminEmail,
  };
}

export type UseAdminAuthReturn = ReturnType<typeof useAdminAuth>;
