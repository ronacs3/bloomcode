import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Baloo 2 — rounded, playful display face with full Vietnamese diacritics support.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BLOOMCODE — Nông Trại Lai Tạo Gene",
  description:
    "Trồng cây, thu hoạch và lai tạo gene. Tạo ra giống lai, kích hoạt đột biến theo thời tiết và hoàn thành GeneDex trong tựa game nông trại ấm cúng trên trình duyệt.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9a6640",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn(baloo.variable, nunito.variable, "font-sans", geist.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
