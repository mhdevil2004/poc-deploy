"use client";

import { useState, useEffect } from "react";

type Language = "ID" | "EN";

export function useLanguage() {
  const [lang, setLang] = useState<Language>("ID");

  useEffect(() => {
    const stored = localStorage.getItem("fintilla_lang") as Language;
    if (stored === "ID" || stored === "EN") {
      setLang(stored);
    }
  }, []);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("fintilla_lang", newLang);
  };

  return { lang, toggleLanguage };
}
