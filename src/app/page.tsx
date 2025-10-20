import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Banknote,
  CreditCard,
  PiggyBank,
  ArrowLeftRight,
  Landmark,
  Award,
  Shield,
  Lock,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <Badge className="mb-4">Secure. Modern. Human.</Badge>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                Banking that puts your money to work
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-prose">
                Fortiz Bank helps you save smarter, transfer instantly, and
                access fair credit — all with enterprise-grade security.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild className="sm:w-auto w-full">
                  <a href="/open-account">Open an account</a>
                </Button>
                <Button asChild variant="outline" className="sm:w-auto w-full">
                  <a href="/learn-more">Learn more</a>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>FDIC insured</span>
                </div>
                <div className="hidden md:flex h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Balance</CardTitle>
                    <CardDescription>Checking •••• 4821</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-semibold tracking-tight">
                      $24,580.12
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Savings APY</CardTitle>
                    <CardDescription>High-yield</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-semibold tracking-tight">
                      4.10%
                    </p>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>This week</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Payroll • ACME Inc.</span>
                        <span className="text-green-600 dark:text-green-400">
                          + $3,200.00
                        </span>
                      </div>
                      <Separator className="h-px" />
                      <div className="flex items-center justify-between">
                        <span>Card • Grocery</span>
                        <span>- $86.27</span>
                      </div>
                      <Separator className="h-px" />
                      <div className="flex items-center justify-between">
                        <span>Transfer • Savings</span>
                        <span>- $500.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Everything you expect — and more
          </h2>
          <p className="mt-2 text-muted-foreground max-w-prose">
            From everyday spending to long-term goals, Fortiz gives you tools
            that are powerful, transparent, and easy to use.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <PiggyBank className="h-5 w-5" />
                  <CardTitle className="text-base">
                    High-yield Savings
                  </CardTitle>
                </div>
                <CardDescription>
                  Grow your money with competitive rates and no monthly fees.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ArrowLeftRight className="h-5 w-5" />
                  <CardTitle className="text-base">Instant Transfers</CardTitle>
                </div>
                <CardDescription>
                  Move money in seconds, domestically and abroad.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="text-base">Smart Cards</CardTitle>
                </div>
                <CardDescription>
                  Virtual and physical cards with powerful controls.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Banknote className="h-5 w-5" />
                  <CardTitle className="text-base">Fair Loans</CardTitle>
                </div>
                <CardDescription>
                  Transparent terms, fast decisions, and flexible repayments.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle className="text-base">Security First</CardTitle>
                </div>
                <CardDescription>
                  Biometric login, real-time alerts, and industry-grade
                  protection.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Landmark className="h-5 w-5" />
                  <CardTitle className="text-base">Global Access</CardTitle>
                </div>
                <CardDescription>
                  Travel confidently with low fees and great rates.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust / Testimonials */}
      <section id="trust" className="border-t bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Trusted by thousands
              </h2>
              <p className="mt-2 text-muted-foreground max-w-prose">
                Real customers. Real results. See why people choose Fortiz to
                manage their finances with confidence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">4.9/5 average rating</Badge>
              <Badge variant="secondary">99.99% uptime</Badge>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Aria Chen',
                role: 'Freelancer',
                img: 'https://i.pravatar.cc/80?img=1',
                quote:
                  'Opening an account took minutes and transfers are instant. The app nails the details.',
              },
              {
                name: 'Miguel Santos',
                role: 'Small business owner',
                img: 'https://i.pravatar.cc/80?img=2',
                quote:
                  'Transparent fees and great support. Fortiz helped me separate business and personal easily.',
              },
              {
                name: 'Priya Patel',
                role: 'Product manager',
                img: 'https://i.pravatar.cc/80?img=3',
                quote:
                  'The savings APY is excellent and security gives me peace of mind.',
              },
            ].map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6">
                  <p className="text-sm">“{t.quote}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={t.img} alt={t.name} />
                      <AvatarFallback>
                        {t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium leading-none">{t.name}</div>
                      <div className="text-muted-foreground leading-none mt-1">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Trust Indicators */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customers
                </CardTitle>
                <CardDescription>Worldwide</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-semibold">1.2M+</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total deposits
                </CardTitle>
                <CardDescription>Managed</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-semibold">$8.4B</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Years operating
                </CardTitle>
                <CardDescription>Reliable</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-semibold">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Uptime
                </CardTitle>
                <CardDescription>Last 12 mo</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-semibold">99.99%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Get started in four simple steps
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                n: 1,
                t: 'Sign up',
                d: 'Create your Fortiz account in minutes.',
              },
              {
                n: 2,
                t: 'Verify',
                d: 'Secure identity verification to protect your account.',
              },
              {
                n: 3,
                t: 'Deposit',
                d: 'Fund your account via transfer or direct deposit.',
              },
              {
                n: 4,
                t: 'Bank',
                d: 'Spend, save, transfer, and grow confidently.',
              },
            ].map((s) => (
              <Card key={s.n}>
                <CardHeader>
                  <div className="text-primary text-sm font-medium">
                    Step {s.n}
                  </div>
                  <CardTitle className="text-base">{s.t}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {s.d}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Featured products
              </h2>
              <p className="mt-2 text-muted-foreground">
                Powerful accounts and tools to match your goals.
              </p>
            </div>
            <Button variant="outline" className="hidden md:inline-flex">
              View all services
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <PiggyBank className="h-5 w-5" />
                  <CardTitle className="text-base">
                    High-yield Savings
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Earn more with competitive APY and no monthly fees.
                <div className="mt-4">
                  <Button asChild size="sm">
                    <a href="/open-account">Open account</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ArrowLeftRight className="h-5 w-5" />
                  <CardTitle className="text-base">Instant Transfers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Move money in seconds with low, transparent fees.
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline">
                    <a href="/services/transfers">Learn more</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Banknote className="h-5 w-5" />
                  <CardTitle className="text-base">Personal Loans</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Fair, fast, and flexible financing for what matters.
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline">
                    <a href="/loans/rates">Check rates</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Security & Compliance
          </h2>
          <p className="mt-2 text-muted-foreground">
            We take security and compliance seriously.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Encryption</CardTitle>
                </div>
                <CardDescription>
                  Protection in transit and at rest
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                Modern TLS, strong ciphers, and key management.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Access controls</CardTitle>
                </div>
                <CardDescription>Defense in depth</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                Least privilege, audit trails, and regular reviews.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Compliance</CardTitle>
                </div>
                <CardDescription>Built to meet standards</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                Member FDIC. Robust KYC/AML programs and monitoring.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer stories */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Customer stories
              </h2>
              <p className="mt-2 text-muted-foreground">
                Real outcomes from real people and businesses.
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Growing a small business',
                desc: 'How a local shop scaled with Fortiz business banking.',
                author: 'Sofia Park • Park & Co.',
                img: '',
              },
              {
                title: 'Saving for a first home',
                desc: 'Automated savings helped reach a big milestone sooner.',
                author: 'Anthony Rivera',
                img: '',
              },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="p-6">
                  <div className="aspect-video w-full rounded-md border bg-muted" />
                  <div className="mt-4">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {c.desc}
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      {c.author}
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={
                            c.title === 'Growing a small business'
                              ? '/stories/growing-small-business'
                              : '/stories/first-home-savings'
                          }
                        >
                          Read story
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Get insights in your inbox
            </h2>
            <p className="mt-2 text-muted-foreground">
              Subscribe for product updates and money tips.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                required
                className="sm:flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Awards & Partners */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">
                    Awards & recognition
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                Recognized for customer satisfaction and fintech innovation in
                2024–2025.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Trusted partners</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                Working with leading networks and technology providers to
                deliver reliable banking.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="rounded-xl border bg-card p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Open your Fortiz Bank account today
            </h2>
            <p className="mt-2 text-muted-foreground">
              Join millions who bank with confidence and clarity.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <a href="/open-account">Get started</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/accounts/compare">Compare accounts</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Global footer is rendered in layout */}
    </div>
  );
}
