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

type TeacherChromeContextValue = {
  title: string | undefined;
  setTitle: (title: string | undefined) => void;
};

const TeacherChromeContext = createContext<TeacherChromeContextValue | null>(
  null,
);

export function TeacherChromeProvider({ children }: { children: ReactNode }) {
  const [title, setTitleState] = useState<string | undefined>(undefined);
  const setTitle = useCallback((next: string | undefined) => {
    setTitleState(next);
  }, []);
  const value = useMemo(() => ({ title, setTitle }), [title, setTitle]);
  return (
    <TeacherChromeContext.Provider value={value}>
      {children}
    </TeacherChromeContext.Provider>
  );
}

export function useTeacherTitle(title: string) {
  const setTitle = useContext(TeacherChromeContext)?.setTitle;
  useEffect(() => {
    if (!setTitle) return;
    setTitle(title);
    return () => setTitle(undefined);
  }, [setTitle, title]);
}

export function useTeacherChromeTitle() {
  return useContext(TeacherChromeContext)?.title;
}
