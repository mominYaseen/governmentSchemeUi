import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  ClipboardList,
  ExternalLink,
  Gift,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EligibilityBadge } from '../components/eligibility-badge';
import { getSchemeByIdFromStorage } from '../api/scheme-results-storage';
import { Separator } from '../components/ui/separator';

export function SchemeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scheme = id ? getSchemeByIdFromStorage(id) : undefined;

  if (!scheme) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Scheme not found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Open a scheme from search results so details stay in your session, or run a new search from
            the home page.
          </p>
          <Button asChild>
            <Link to="/results">Go to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {scheme.category}
                  </div>
                  <h1 className="text-3xl font-semibold text-foreground mb-2">
                    {scheme.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {scheme.description}
                  </p>
                </div>
                <EligibilityBadge status={scheme.eligibility} />
              </div>

              <Separator className="my-6" />

              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {scheme.fullDescription}
                </p>
              </div>
            </Card>

            {/* Benefits Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-secondary" />
                Key Benefits
              </h3>
              <ul className="space-y-3">
                {scheme.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Eligibility Criteria Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Eligibility Criteria
              </h3>
              <ul className="space-y-3">
                {scheme.criteriaList.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{criteria}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Required Documents Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Required Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.requiredDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Application Steps Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                How to Apply
              </h3>
              <ol className="space-y-4">
                {scheme.applicationSteps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {scheme.officialLink && scheme.officialLink !== '#' ? (
                  <>
                    <Button className="w-full" size="lg" asChild>
                      <a
                        href={scheme.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button variant="outline" className="w-full" size="lg" asChild>
                      <a
                        href={scheme.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Visit Official Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No apply URL was returned for this scheme. Check the overview and steps below.
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Scheme Info */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{scheme.category}</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Your Eligibility Status
                  </div>
                  <EligibilityBadge status={scheme.eligibility} />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Eligibility Summary
                  </div>
                  <div className="text-sm">{scheme.eligibilitySummary}</div>
                </div>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Contact your nearest Common Service Centre or government help desk for assistance with applications.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Find Help Center
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
