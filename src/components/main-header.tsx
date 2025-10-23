'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Personal',
    submenu: [
      { name: 'Checking Accounts', href: '/accounts/compare' },
      { name: 'Savings Accounts', href: '/accounts/compare' },
      { name: 'Loans & Mortgages', href: '/loans/rates' },
      { name: 'Transfers', href: '/services/transfers' },
    ],
  },
  {
    name: 'Services',
    href: '/services',
    submenu: [
      { name: 'All Services', href: '/services' },
      { name: 'Online Banking', href: '/services' },
      { name: 'Mobile App', href: '/services' },
      { name: 'Card Services', href: '/services' },
    ],
  },
  {
    name: 'About',
    href: '/about',
    submenu: [
      { name: 'About Us', href: '/about' },
      { name: 'Testimonials', href: '/testimonials' },
      { name: 'Careers', href: '/careers' },
      { name: 'Customer Stories', href: '/' },
    ],
  },
  {
    name: 'Support',
    submenu: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Help Center', href: '/contact' },
    ],
  },
];

export function MainHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fortiz.png"
              alt="Fortiz Bank"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="text-base font-semibold tracking-tight">
              Fortiz Bank
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.href ? (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.name}
                      {item.submenu && <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                    {item.submenu && <ChevronDown className="ml-1 h-3 w-3" />}
                  </Button>
                )}

                {/* Desktop Dropdown */}
                {item.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.name} href={subItem.href}>
                          <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                            {subItem.name}
                          </button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* User Menu (always visible) */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          style={{ top: '64px' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed left-0 w-80 bg-background border-r z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto shadow-xl',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ top: '64px', bottom: 0 }}
      >
        <nav className="flex flex-col p-4 space-y-1">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.href && !item.submenu ? (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base"
                  >
                    {item.name}
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-base"
                    onClick={() => toggleSubmenu(item.name)}
                  >
                    {item.name}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openSubmenu === item.name && 'rotate-180'
                      )}
                    />
                  </Button>

                  {/* Mobile Submenu */}
                  {item.submenu && openSubmenu === item.name && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.name} href={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm text-muted-foreground"
                          >
                            {subItem.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Mobile: Add direct links */}
          <div className="pt-4 border-t mt-4">
            <Link href="/open-account">
              <Button className="w-full mb-2">Open Account</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
