import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";
import BusinessScene from "@/components/three/BusinessScene";
import SessionKeeper from "@/components/SessionKeeper";

export const metadata: Metadata = {
  title: "AI Executive Decision Agent",
  description: "AI-powered executive dashboard for data-driven business decisions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-ink">
        {/* keeps the login session alive by renewing the access token quietly */}
        <SessionKeeper />
        {/* one shared 3D background behind every page */}
        <BusinessScene />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
