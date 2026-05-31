"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const playerNavItems = [
  { href: "/home", label: "Inicio", icon: HomeIcon, activeIcon: HomeActiveIcon },
  { href: "/search", label: "Buscar", icon: SearchIcon, activeIcon: SearchActiveIcon },
  { href: "/bookings", label: "Agenda", icon: CalendarIcon, activeIcon: CalendarActiveIcon },
  { href: "/menu", label: "Menu", icon: MenuIcon, activeIcon: MenuActiveIcon },
];

const ownerNavItems = [
  { href: "/owner/dashboard", label: "Campos", icon: FieldIcon, activeIcon: FieldActiveIcon },
  { href: "/owner/bookings", label: "Reservas", icon: CalendarIcon, activeIcon: CalendarActiveIcon },
  { href: "/owner/dashboard/financeiro", label: "Financeiro", icon: DollarIcon2, activeIcon: DollarActiveIcon },
  { href: "/menu", label: "Menu", icon: MenuIcon, activeIcon: MenuActiveIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "FIELD_OWNER";

  const navItems = isOwner ? ownerNavItems : playerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" aria-label={isOwner ? "Navegacao do dono" : "Navegacao principal"}>
      <div className="mx-auto max-w-lg px-4 pb-4">
        <div className="rounded-2xl px-2 py-1.5" style={{ background: "rgba(17, 17, 24, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(34, 34, 51, 0.6)" }}>
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex flex-col items-center gap-0.5 py-2 px-3 transition-all duration-300 ${
                    isActive ? "scale-105" : ""
                  }`}
                >
                  <span aria-hidden="true">{isActive ? <item.activeIcon /> : <item.icon />}</span>
                  <span
                    className={`text-[10px] font-semibold tracking-wider transition-all duration-300 ${
                      isActive ? "text-primary" : "text-text-3 group-hover:text-text-2"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-primary glow-green-sm" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomeIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>); }
function HomeActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" fill="#22c55e" fillOpacity="0.15" /></svg>); }
function SearchIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>); }
function SearchActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" fill="#22c55e" fillOpacity="0.08" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>); }
function CalendarIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>); }
function CalendarActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#22c55e" fillOpacity="0.06" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>); }
function MenuIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>); }
function MenuActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5" fill="#22c55e" /><circle cx="19" cy="12" r="1.5" fill="#22c55e" /><circle cx="5" cy="12" r="1.5" fill="#22c55e" /></svg>); }
function FieldIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>); }
function FieldActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" fill="#22c55e" fillOpacity="0.15" /></svg>); }
function DollarIcon2() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>); }
function DollarActiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" fill="#22c55e" fillOpacity="0.08"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>); }
