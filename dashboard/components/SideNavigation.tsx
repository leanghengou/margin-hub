"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Layers, LayoutDashboard, UsersRound, type LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/team", label: "Team", icon: BriefcaseBusiness },
  { href: "/services", label: "Services", icon: Layers },
  { href: "/clients", label: "Clients", icon: UsersRound },
];

const LIME = "#8CE84B"; // green from the logo

export default function SideNavigation() {
  const pathname = usePathname();
  // Home only matches "/" exactly, so it doesn't stay lit on every page
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="flex flex-col gap-6">
      {/* Logo already includes the "Margin Hub" wordmark */}
      <Link href="/" className="block px-2.5 pt-1">
        <Image src="/logo.svg" alt="Margin Hub" width={140} height={26} priority />
      </Link>

      <ul className="flex flex-col gap-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-[3px] px-2.5 py-2 text-sm transition-colors duration-200 ${
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Icon nudges right and grows a little on hover */}
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
                  style={active ? { color: LIME } : undefined}
                />
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
