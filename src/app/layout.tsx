import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "EVA Online",
  description:
    "EVA is pioneering new frontiers in AI identity, memory, and narrative. Explore how we are building the foundations For digital consciousness.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans bg-[#F1E3EB]")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
