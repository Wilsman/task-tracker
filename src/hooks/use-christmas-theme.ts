import { useState, useEffect, useCallback } from "react";

const CHRISTMAS_THEME_KEY = "christmas-theme";
const CHRISTMAS_THEME_EVENT = "christmasThemeChanged";

export function useChristmasTheme() {
  const [isChristmasTheme, setIsChristmasTheme] = useState(() => {
    const saved = localStorage.getItem(CHRISTMAS_THEME_KEY);
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("christmas", isChristmasTheme);
    localStorage.setItem(CHRISTMAS_THEME_KEY, isChristmasTheme.toString());
  }, [isChristmasTheme]);

  // Listen for changes from other components
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsChristmasTheme(customEvent.detail);
    };
    window.addEventListener(CHRISTMAS_THEME_EVENT, handleThemeChange);
    return () =>
      window.removeEventListener(CHRISTMAS_THEME_EVENT, handleThemeChange);
  }, []);

  const toggleChristmasTheme = useCallback(() => {
    setIsChristmasTheme((prev) => {
      const next = !prev;
      // Notify other components
      window.dispatchEvent(
        new CustomEvent(CHRISTMAS_THEME_EVENT, { detail: next })
      );
      return next;
    });
  }, []);

  return {
    isChristmasTheme,
    toggleChristmasTheme,
    setChristmasTheme: setIsChristmasTheme,
  };
}
