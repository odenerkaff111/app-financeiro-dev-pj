"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Settings, UsersRound, Package } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registros", label: "Registros", icon: ReceiptText },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="w-64 min-h-screen bg-[#0a003d] border-r border-[#0a003d] p-6 flex flex-col font-sans">
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-[#ffab40] rounded flex items-center justify-center">
          <span className="text-[#0a003d] font-black text-lg">K</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Kaff ERP</h2>
        </div>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-[#ffab40] text-[#0a003d] shadow-sm" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#0a003d]" : "text-gray-400"} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/10 px-2">
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Kaff Co. Workspace</p>
      </div>
    </div>
  );
}
