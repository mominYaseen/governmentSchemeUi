import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { Search, Mic, Sparkles, BookOpen, ListChecks } from 'lucide-react';
import { Button } from './ui/button';
import { suggestedPrompts } from '../data/schemes';

export function LandingHero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/match?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setQuery(prompt);
    navigate(`/match?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1723564211731-21ceb97443a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcGVvcGxlJTIwaGVscGluZyUyMGNvbW11bml0eSUyMHNlcnZpY2UlMjBpbmRpYXxlbnwxfHx8fDE3NzQ2OTExNDN8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Community support"
          className="h-full w-full object-cover opacity-30"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 border border-white/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Scheme Discovery</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-tight">
            Find Government Schemes
            <br />
            <span className="text-secondary">Made for You</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Describe your situation and discover eligible government benefits, subsidies, and support programs
          </p>
        </div>

        {/* Main Prompt Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary via-white to-accent rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-white/40">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your situation (e.g., I am a farmer looking for subsidies...)"
                    className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-xl hover:bg-muted/50"
                  title="Voice input"
                >
                  <Mic className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 rounded-xl bg-primary hover:bg-primary/90"
                  disabled={!query.trim()}
                >
                  Find Schemes
                </Button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-8">
          <Button
            size="lg"
            variant="secondary"
            className="min-h-12 text-base rounded-xl"
            asChild
          >
            <Link to="/recommend" className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              I know my details
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-h-12 text-base rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20"
            asChild
          >
            <Link to="/catalog" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Browse catalog
            </Link>
          </Button>
        </div>

        {/* Suggested Prompts */}
        <div className="text-center">
          <p className="text-sm text-white/80 mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full text-sm text-white transition-all hover:scale-105"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center text-white/90">
            <div className="text-3xl font-semibold mb-1">100+</div>
            <div className="text-sm text-white/70">Government Schemes</div>
          </div>
          <div className="text-center text-white/90">
            <div className="text-3xl font-semibold mb-1">AI-Powered</div>
            <div className="text-sm text-white/70">Smart Matching</div>
          </div>
          <div className="text-center text-white/90">
            <div className="text-3xl font-semibold mb-1">Free</div>
            <div className="text-sm text-white/70">Always & Forever</div>
          </div>
        </div>
      </div>
    </div>
  );
}
