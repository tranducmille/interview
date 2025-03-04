import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Provider from './Provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Interview Management System",
  description: "Manage your Interview categories and questions",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className={inter.className}>
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