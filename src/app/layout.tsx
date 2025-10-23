import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SimpleToastProvider } from '@/components/ui/simple-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { MainHeader } from '@/components/main-header';

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
  icons: {
    icon: '/fortiz.png',
    shortcut: '/fortiz.png',
    apple: '/fortiz.png',
  },
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
        <ThemeProvider defaultTheme="system" storageKey="fortiz-theme">
          <AuthProvider>
            <SimpleToastProvider>
              <div className="min-h-dvh flex flex-col">
                <MainHeader />
                <main className="flex-1">{children}</main>
                <footer className="border-t" id="global-footer">
                  <div className="mx-auto w-full max-w-6xl px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/fortiz.png"
                            alt="Fortiz Bank"
                            className="h-7 w-7 rounded-md object-cover"
                          />
                          <span className="text-sm font-semibold">
                            Fortiz Bank
                          </span>
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
                            <a
                              className="hover:text-foreground"
                              href="/testimonials"
                            >
                              Testimonials
                            </a>
                          </li>
                          <li>
                            <a
                              className="hover:text-foreground"
                              href="/careers"
                            >
                              Careers
                            </a>
                          </li>
                          <li>
                            <a
                              className="hover:text-foreground"
                              href="/services"
                            >
                              Services
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium mb-2">Support</div>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>
                            <a
                              className="hover:text-foreground"
                              href="/contact"
                            >
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
                      © {new Date().getFullYear()} Fortiz Bank. All rights
                      reserved.
                    </div>
                  </div>
                </footer>
              </div>
            </SimpleToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
