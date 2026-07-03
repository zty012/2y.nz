"use client";

import { useEffect, type ReactNode } from "react";

export function TimeThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    document.documentElement.dataset.themeTime = isDay ? "day" : "night";
  }, []);

  return <>{children}</>;
}
