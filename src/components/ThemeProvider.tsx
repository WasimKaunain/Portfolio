"use client";
import React, { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("site-theme");
  return saved === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("site-theme", theme);
  }, [theme]);

  useEffect(() => {
    function onToggle() {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    }
    window.addEventListener("toggle-theme", onToggle);
    return () => window.removeEventListener("toggle-theme", onToggle);
  }, []);

  return <>{children}</>;
}
