import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageSquare, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact & Support — Fortiz Bank',
  description: 'Get in touch with Fortiz Bank. We are here to help 24/7.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <section>
        <Badge className="mb-4">Support</Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          We are here to help
        </h1>
        <p className="mt-4 text-muted-foreground max-w-prose">
          Reach out anytime. Our support team is available around the clock.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Send us a message</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your full name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full md:w-auto">
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              US: (800) 123-4567
              <br />
              International: +1 (555) 987-6543
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Email
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              support@fortizbank.com
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Live chat
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              Chat with us 24/7 in the app or web dashboard.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Branch locations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              <div className="aspect-video w-full rounded-md border bg-muted" />
              <div className="mt-2 text-xs text-muted-foreground">
                Map coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
