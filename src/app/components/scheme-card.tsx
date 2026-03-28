import { ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { EligibilityBadge } from './eligibility-badge';
import { Scheme } from '../data/schemes';

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                {scheme.category}
              </span>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
              {scheme.name}
            </h3>
          </div>
          <EligibilityBadge status={scheme.eligibility} showIcon={false} />
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {scheme.description}
        </p>

        <div className="mb-4">
          <p className="text-xs font-medium text-foreground mb-2">Key Benefits:</p>
          <ul className="space-y-1">
            {scheme.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span className="line-clamp-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-border">
          <Button asChild className="w-full group-hover:bg-primary/90" size="sm">
            <Link to={`/scheme/${scheme.id}`} className="flex items-center justify-center gap-2">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
