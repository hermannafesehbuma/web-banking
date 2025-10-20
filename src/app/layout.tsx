import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/UserMenu';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fortiz Bank — Modern Digital Banking',
  description:
    'Trusted, secure, and modern banking. Open an account with Fortiz Bank.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-dvh flex flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                <a
                  href="/"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-8 w-8 rounded-md bg-primary" />
                  <span className="text-base font-semibold tracking-tight">
                    Fortiz Bank
                  </span>
                </a>
                <div className="flex items-center gap-6">
                  <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <a href="/services" className="hover:text-foreground">
                      Services
                    </a>
                    <a href="/about" className="hover:text-foreground">
                      About
                    </a>
                    <a href="/contact" className="hover:text-foreground">
                      Contact
                    </a>
                  </nav>
                  <UserMenu />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t" id="global-footer">
              <div className="mx-auto w-full max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-primary" />
                      <span className="text-sm font-semibold">Fortiz Bank</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground max-w-xs">
                      Fortiz Bank, N.A. Member FDIC. Equal Housing Lender.
                    </p>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Company</div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <a className="hover:text-foreground" href="/about">
                          About
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-foreground" href="/careers">
                          Careers
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-foreground" href="/services">
                          Services
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Support</div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <a className="hover:text-foreground" href="/contact">
                          Contact
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-foreground" href="/faq">
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a className="hover:text-foreground" href="#">
                          Status
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-2">Legal</div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <a
                          className="hover:text-foreground"
                          href="/legal/privacy"
                        >
                          Privacy Policy
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-foreground"
                          href="/legal/terms"
                        >
                          Terms & Conditions
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:text-foreground"
                          href="/legal/cookie"
                        >
                          Cookie Policy
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Fortiz Bank. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
