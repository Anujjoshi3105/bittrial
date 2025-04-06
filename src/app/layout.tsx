import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { constructMetadata } from "@/lib/metadata";
import { ThemeProvider } from "@/lib/providers/theme.provider";
import { Montserrat } from "next/font/google";
import HolyLoader from "holy-loader";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-background text-primary`}>
        <ThemeProvider
          defaultTheme="light"
          enableSystem
          attribute="class"
          storageKey="station-theme">
          <HolyLoader color="linear-gradient(to right, #ff7e5f, #feb47b)" />

          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
