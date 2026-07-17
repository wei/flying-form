import { createContext, useContext, useState } from "react";
import type { Lang } from "./types";

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({
  lang: "en",
  toggle: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    // JA-first (matches the fill flow's original default); persisted once toggled
    () => (localStorage.getItem("ff-lang") as Lang) || "ja",
  );
  const toggle = () => {
    const next = lang === "en" ? "ja" : "en";
    localStorage.setItem("ff-lang", next);
    setLang(next);
  };
  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
