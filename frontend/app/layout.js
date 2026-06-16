import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "zkCAP — Commit Attestation Platform",
  description: "Verifiable commit attestation protocol for private repositories. Track commits, generate attestations, and verify integrity.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Sidebar />
        <main
          className="min-h-screen transition-all duration-300"
          style={{ marginLeft: "var(--sidebar-width)" }}
        >
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
