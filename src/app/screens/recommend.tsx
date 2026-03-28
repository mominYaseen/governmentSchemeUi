import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { recommendSchemes } from '../api/schemes-api';
import { ApiError } from '../api/client';
import type { SchemeSummary, UserProfileRequest } from '../api/types';
import { SchemeCard } from '../components/scheme-card';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const emptyForm = {
  occupation: '',
  incomeAnnual: '',
  location: '',
  state: '',
  gender: '',
  age: '',
  casteCategory: '',
  landOwned: 'unset' as 'unset' | 'yes' | 'no',
  bplCard: 'unset' as 'unset' | 'yes' | 'no',
  isFarmer: false,
  isStudent: false,
  isDisabled: false,
};

export function Recommend() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SchemeSummary[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const body: UserProfileRequest = {};

    if (form.occupation.trim()) body.occupation = form.occupation.trim();
    if (form.location.trim()) body.location = form.location.trim();
    const st = form.state.trim().toUpperCase();
    if (st.length === 2) body.state = st;
    if (form.gender) body.gender = form.gender;
    if (form.casteCategory) body.casteCategory = form.casteCategory;
    const age = parseInt(form.age, 10);
    if (!Number.isNaN(age) && age > 0) body.age = age;
    const inc = parseInt(form.incomeAnnual.replace(/\D/g, ''), 10);
    if (!Number.isNaN(inc) && inc >= 0) body.incomeAnnual = inc;
    if (form.landOwned === 'yes') body.landOwned = true;
    if (form.landOwned === 'no') body.landOwned = false;
    if (form.bplCard === 'yes') body.bplCard = true;
    if (form.bplCard === 'no') body.bplCard = false;
    if (form.isFarmer) body.isFarmer = true;
    if (form.isStudent) body.isStudent = true;
    if (form.isDisabled) body.isDisabled = true;

    try {
      const list = await recommendSchemes(body);
      setResults(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              I know my details
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Rule-based matches via{' '}
              <code className="text-sm bg-muted px-1 rounded">POST /api/schemes/recommend</code>. Leave fields blank if
              you are not sure — omitted fields are treated as unknown.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not get recommendations</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    className="min-h-11 text-base"
                    placeholder="e.g. farmer, student"
                    value={form.occupation}
                    onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Annual income (INR)</Label>
                  <Input
                    id="income"
                    inputMode="numeric"
                    className="min-h-11 text-base"
                    placeholder="e.g. 200000"
                    value={form.incomeAnnual}
                    onChange={(e) => setForm((f) => ({ ...f, incomeAnnual: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City / district</Label>
                  <Input
                    id="location"
                    className="min-h-11 text-base"
                    placeholder="e.g. Srinagar"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / UT code (2 letters)</Label>
                  <Input
                    id="state"
                    maxLength={2}
                    className="min-h-11 text-base uppercase"
                    placeholder="e.g. JK"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={form.gender || 'unset'}
                    onValueChange={(v) => setForm((f) => ({ ...f, gender: v === 'unset' ? '' : v }))}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Prefer not to say" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">Prefer not to say</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    inputMode="numeric"
                    className="min-h-11 text-base"
                    placeholder="e.g. 32"
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Social category</Label>
                  <Select
                    value={form.casteCategory || 'unset'}
                    onValueChange={(v) => setForm((f) => ({ ...f, casteCategory: v === 'unset' ? '' : v }))}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">Prefer not to say</SelectItem>
                      <SelectItem value="GEN">GEN</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Owns land</Label>
                  <Select
                    value={form.landOwned}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, landOwned: v as typeof form.landOwned }))
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">Unknown</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>BPL card</Label>
                  <Select
                    value={form.bplCard}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, bplCard: v as typeof form.bplCard }))
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">Unknown</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 min-h-11">
                  <Checkbox
                    id="isFarmer"
                    checked={form.isFarmer}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, isFarmer: c === true }))}
                  />
                  <Label htmlFor="isFarmer" className="text-base font-normal cursor-pointer">
                    I am a farmer
                  </Label>
                </div>
                <div className="flex items-center gap-3 min-h-11">
                  <Checkbox
                    id="isStudent"
                    checked={form.isStudent}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, isStudent: c === true }))}
                  />
                  <Label htmlFor="isStudent" className="text-base font-normal cursor-pointer">
                    I am a student
                  </Label>
                </div>
                <div className="flex items-center gap-3 min-h-11">
                  <Checkbox
                    id="isDisabled"
                    checked={form.isDisabled}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, isDisabled: c === true }))}
                  />
                  <Label htmlFor="isDisabled" className="text-base font-normal cursor-pointer">
                    Person with disability
                  </Label>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full min-h-12 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding schemes…
                  </>
                ) : (
                  'Get recommendations'
                )}
              </Button>
            </form>
          </Card>

          {results && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {results.length === 0 ? 'No rule-based matches' : `${results.length} scheme(s) for you`}
              </h2>
              {results.length === 0 ? (
                <Alert>
                  <AlertTitle>Empty result</AlertTitle>
                  <AlertDescription>
                    The API returned no schemes for this profile. Try natural-language matching, or adjust your details.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((s) => (
                    <SchemeCard key={s.id} catalogSummary={s} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
