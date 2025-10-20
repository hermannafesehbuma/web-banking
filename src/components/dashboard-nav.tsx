'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  HeadphonesIcon,
  Bell,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/SupbaseClient';

export function DashboardNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
  }, [pathname]);

  const loadUnreadCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadCount(count ?? 0);
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Cards',
      href: '/dashboard/cards',
      icon: CreditCard,
    },
    {
      name: 'Support',
      href: '/dashboard/support',
      icon: HeadphonesIcon,
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: unreadCount,
    },
  ];

  return (
    <div className="border-b bg-background">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex items-center justify-between h-14">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="relative"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'system' && <Laptop className="h-4 w-4" />}
                <span className="ml-2 hidden md:inline">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
