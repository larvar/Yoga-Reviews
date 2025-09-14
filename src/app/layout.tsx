import "./globals.css";
import { Inter } from "next/font/google";
import ToastProvider from "../components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yoga Reviews",
  description: "Find LA Fitness yoga classes & instructors you love",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
