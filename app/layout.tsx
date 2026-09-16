import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PingVirtual - Virtual SMS Numbers",
  description: "Cheap virtual phone numbers for SMS verification.",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API = Tawk_API || {};
            var Tawk_LoadStart = new Date();

            // Must be set BEFORE the embed script loads to take effect.
            // Mobile gets a bigger vertical offset so the widget clears
            // our fixed bottom tab bar on the dashboard.
            Tawk_API.customStyle = {
              visibility: {
                desktop: { position: "br", xOffset: 15, yOffset: 15 },
                mobile: { position: "br", xOffset: 10, yOffset: 90 }
              }
            };

            (function () {
              var s1 = document.createElement("script");
              var s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = "https://embed.tawk.to/6aaa4082f9359f3441af0703/default";
              s1.charset = "UTF-8";
              s1.setAttribute("crossorigin", "*");
              s0.parentNode.insertBefore(s1, s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
