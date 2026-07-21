import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Talk to Map — 對話式商圈分析",
  description:
    "自然語言問答 × 地圖標註 × 商場競爭分析／銷售預測（示範：吉隆坡 Bukit Bintang / TRX 商圈）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
