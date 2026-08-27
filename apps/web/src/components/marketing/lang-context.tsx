"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MarketingLang = "en" | "am";

const STORAGE_KEY = "kasina:marketing-lang";

type LangContextValue = {
  lang: MarketingLang;
  setLang: (lang: MarketingLang) => void;
  toggleLang: () => void;
};

const MarketingLangContext = createContext<LangContextValue | null>(null);

export function MarketingLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<MarketingLang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "am") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: MarketingLang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "am" : "en");
  }, [lang, setLang]);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return (
    <MarketingLangContext.Provider value={value}>
      {children}
    </MarketingLangContext.Provider>
  );
}

export function useMarketingLang() {
  const ctx = useContext(MarketingLangContext);
  if (!ctx) {
    throw new Error("useMarketingLang must be used within MarketingLangProvider");
  }
  return ctx;
}
