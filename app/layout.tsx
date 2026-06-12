import type { Metadata } from "next";
import { AppShell } from "@/app/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xì Dách Ledger",
  description: "Theo dõi lời lỗ các buổi chơi xì dách.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
