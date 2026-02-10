import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Coffix Server Printer Dashboard Admin",
  description: "Admin login for Coffix Server Printer Dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
