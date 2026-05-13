import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Voting Platform",
  description: "Secure Online Voting Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0A0A0A",
                color: "#fff",
                border: "1px solid #E11D48",
                borderRadius: "0.75rem",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
