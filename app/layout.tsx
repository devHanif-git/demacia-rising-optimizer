import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demacia Rising Optimizer",
  description: "Calculate the optimal unit composition to defend against incoming attacks.",
  openGraph: {
    title: "Demacia Rising Optimizer",
    description: "Calculate the optimal unit composition to defend against incoming attacks.",
    type: "website",
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
