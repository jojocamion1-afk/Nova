import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaCity RP — Boutique officielle",
  description: "Boutique officielle NovaCity RP : crédits pour Garry's Mod DarkRP, connexion Steam et avantages à débloquer en jeu.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
