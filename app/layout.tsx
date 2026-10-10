import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/features/invoices/components/app-shell";

export const metadata: Metadata = {
  title: "Invoice App",
  description: "Create, manage, and track your invoices.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
