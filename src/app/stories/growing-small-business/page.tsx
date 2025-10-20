import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title: 'Customer Story: Growing a Small Business — Fortiz Bank',
  description: 'How Park & Co. scaled with Fortiz business banking.',
};

export default function StorySmallBusinessPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
      <Badge className="mb-4">Customer story</Badge>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Growing a small business with Fortiz
      </h1>
      <p className="mt-4 text-muted-foreground">
        How Park & Co. used Fortiz business banking to streamline operations,
        improve cash flow, and focus on customers.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
        <p>
          When Sofia Park launched Park & Co., a neighborhood design studio, she
          needed a bank that could keep up with the pace of a growing client
          base. Traditional tools felt slow and fragmented. Fortiz offered a
          clean dashboard, instant transfers, and multi-user access—features
          that mapped to the way her team worked.
        </p>
        <p>
          Moving invoices and vendor payments into Fortiz reduced hours of
          bookkeeping each week. Sofia set spending limits on team cards,
          created virtual cards for online purchases, and approved payments from
          her phone during site visits. Real-time alerts and reliable transfers
          meant less time worrying about logistics and more time serving
          clients.
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outcomes</CardTitle>
            <CardDescription>Measurable improvements</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc pl-4 space-y-2">
              <li>Saved ~6 hours per week on reconciliation</li>
              <li>Reduced payment delays by 40% with instant transfers</li>
              <li>Improved budget accuracy with category-level controls</li>
            </ul>
          </CardContent>
        </Card>
        <p>
          “I can train a new teammate in minutes,” Sofia explains. “The controls
          are intuitive and the alerts catch issues before they become
          problems.” With less administrative overhead, Park & Co. expanded
          services and took on larger projects, confident the bank wouldn’t be a
          bottleneck.
        </p>
        <p>
          Today, Park & Co. continues to grow with Fortiz. The team relies on
          fast support and industry-grade security, while clients enjoy quicker
          turnarounds thanks to streamlined finances. For Sofia, the biggest win
          is focus: “Fortiz lets us spend time on the work that matters.”
        </p>
      </div>
    </div>
  );
}
