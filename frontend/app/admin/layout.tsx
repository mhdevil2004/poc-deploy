import { Metadata } from "next";
import { LanguageProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "Fintilla Admin Portal",
  description: "Administrative portal for Fintilla",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
