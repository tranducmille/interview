import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Provider from './Provider';

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "Interview Management System",
  description: "Manage your Interview categories and questions",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <Provider>
        <div className="min-h-screen">
          {children}
          <Toaster position="bottom-right" />
        </div>
        </Provider>
      </body>
    </html>
  );
}