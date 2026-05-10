import Link from "next/link";
import { useRouter } from "next/router";

// Simple SVG icons for demonstration
const icons = {
  home: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
  ),
  markets: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
  ),
  points: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  ),
  user: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
  ),
  search: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
  ),
};

const navItems = [
  { href: "/markets", label: "Markets", icon: icons.markets },
  { href: "/dashboard", label: "Dashboard", icon: icons.points },
  { href: "/create", label: "Create", icon: icons.search },
  { href: "/faucet", label: "Faucet", icon: icons.user },
];

export default function MobileTabBar() {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 flex md:hidden justify-around items-center py-2 px-2 shadow-lg">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex flex-col items-center text-xs font-medium text-gray-600 hover:text-[var(--color-accent2)] transition-colors">
          <span className="w-8 h-8 flex items-center justify-center mb-0.5">
            {item.icon}
          </span>
          <span className="text-[11px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
