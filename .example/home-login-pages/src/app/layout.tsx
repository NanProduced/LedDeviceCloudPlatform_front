import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/outfit";
import "./globals.css";

export const metadata: Metadata = {
  title: "LED云平台 - 播放设备管理系统",
  description: "LED播放设备管理平台，高效管理您的设备，提供简便的内容控制解决方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
