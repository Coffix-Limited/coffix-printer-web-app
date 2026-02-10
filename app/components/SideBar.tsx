"use client";

import Link from "next/link";
import { COFFEE_PALETTE } from "../constants/theme";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase.browser";


type NavItem = {
  name: string;
  href: string;
  icon?: string; // Optional: if you want to add unique icons later
};

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/" },
  { name: "Printers", href: "/printer" },
  { name: "Logs", href: "/logs" },
  { name: "Templates", href: "/templates" },
  { name: "Setup", href: "/setup" },
];

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Header (same as before) */}
      <div
        className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-50"
        style={{ backgroundColor: COFFEE_PALETTE.cardBg, borderColor: COFFEE_PALETTE.border }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">☕</span>
          <span className="font-bold" style={{ color: COFFEE_PALETTE.primary }}>Coffix Server Printer Dashboard</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav
        className={`
          fixed left-0 top-0 h-screen w-64 border-r flex flex-col z-50 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        style={{ borderColor: COFFEE_PALETTE.border, backgroundColor: COFFEE_PALETTE.cardBg }}
      >
        <div className="p-6 hidden md:flex items-center gap-3 border-b" style={{ borderColor: COFFEE_PALETTE.border }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-800" style={{ backgroundColor: COFFEE_PALETTE.primary }}>
            <span className="text-white text-xl font-bold">☕</span>
          </div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: COFFEE_PALETTE.primary }}>
            Coffix Printer Dashboard
          </h1>
        </div>

        {/* Mapped Navigation Links */}
        <div className="flex flex-col gap-1 p-4 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-md transition-all font-medium"
                style={{
                  // Change style based on active state
                  backgroundColor: isActive ? '#F5F5F4' : 'transparent',
                  color: isActive ? COFFEE_PALETTE.primary : COFFEE_PALETTE.textSecondary
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-4">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full px-4 py-3 rounded-md transition-all font-medium flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: COFFEE_PALETTE.error }}
          >
            {signingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut size={18} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>

        <footer className="p-4 border-t text-xs text-center">
          <div className="" style={{ borderColor: COFFEE_PALETTE.border, color: COFFEE_PALETTE.textSecondary }}>
            © 2026 Coffee System v1.0
          </div>
        </footer>
      </nav>
    </>
  );
}