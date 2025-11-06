'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  QrCode,
  Settings,
  Database as DatabaseIcon,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/tenants/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/visitors", icon: QrCode, label: "Visitors" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Profile | null>(null);

  useEffect(() => {
    loadAdminInfo();
  }, []);

  const loadAdminInfo = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setAdmin(profile);
      }
    }
  };

  return (
    <nav className="hidden md:flex flex-col h-full w-64 border-r border-border bg-sidebar text-sidebar-foreground p-4 gap-4 fixed">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-4">
        <DatabaseIcon className="size-8 text-primary" />
        <h1 className="text-2xl font-bold">Growpath</h1>
      </div>

      {/* Admin Info */}
      {admin && (
        <div className="px-2 py-3 bg-sidebar-accent rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {admin.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {admin.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin.email}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          // More precise matching: exact match for root paths, or startsWith for nested
          const isActive = item.href === '/tenants' 
            ? pathname === '/tenants' || (pathname.startsWith('/tenants/') && !pathname.startsWith('/tenants/transactions'))
            : pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <form action={signOut}>
          <Button variant="ghost" className="w-full justify-start text-lg gap-3 px-3">
            Log Out
          </Button>
        </form>
      </div>
    </nav>
  );
}