import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/app/lib/context";
import { CompareProvider } from "@/components/CompareWidget";

export const metadata: Metadata = {
  title: "Elavia Dent — пошук стоматологічних товарів та послуг",
  description: "Інтелектуальна платформа пошуку стоматологічних товарів, клінік та послуг в Україні",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <AppProvider>
          <CompareProvider>
            {children}
          </CompareProvider>
        </AppProvider>
      </body>
    </html>
  );
}
