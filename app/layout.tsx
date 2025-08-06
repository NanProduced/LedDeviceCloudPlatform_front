import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WebSocketProvider } from "@/components/websocket/WebSocketProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LED云平台 - 全球化管理解决方案",
  description: "LED云平台为您提供覆盖全球的设备管理、内容发布和数据统计分析的一站式解决方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <UserProvider>
            <WebSocketProvider 
              config={{
                brokerURL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://192.168.1.222:8082/message-service/ws',
                reconnectDelay: 3000,
                maxReconnectAttempts: 5,
                debug: process.env.NODE_ENV === 'development',
              }}
              enableDebug={process.env.NODE_ENV === 'development'}
              showConnectionStatus={true}
            >
              {children}
            </WebSocketProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
