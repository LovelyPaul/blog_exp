import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "체험단 플랫폼",
  description: "블로그 리뷰 체험단 매칭 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            <Header />
            {children}
            <Toaster />
          </CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
