import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Providers from "@/components/providers/Providers";
import PageTransition from "@/components/transitions/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinit",
  description: "Seu novo app de conversas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900`}>
        <Providers>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col ml-64 overflow-hidden">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
