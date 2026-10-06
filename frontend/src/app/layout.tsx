import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import "./app-theme.css";
import "./subscriber.css";
import "./conta-aberta.css";
export const metadata: Metadata = {
  title: "Conta Aberta · DrivePulse",
  description:
    "Conceito Conta Aberta para o app de carro por assinatura, criado a partir do case Localiza no Ruptura 2026. Dados de demonstração.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
