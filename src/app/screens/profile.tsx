import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, MapPin, Briefcase, DollarSign, Calendar, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    income: '',
    location: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a backend
    console.log('Profile saved:', formData);
    // Show success message and redirect
    navigate('/results?q=' + encodeURIComponent(formData.occupation || 'general'));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us personalize scheme recommendations based on your situation
            </p>
          </div>

          {/* Profile Form */}
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Occupation & Income Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Occupation & Income
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Select
                      value={formData.occupation}
                      onValueChange={(value) => handleChange('occupation', value)}
                    >
                      <SelectTrigger id="occupation">
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="business-owner">Business Owner</SelectItem>
                        <SelectItem value="self-employed">Self Employed</SelectItem>
                        <SelectItem value="salaried">Salaried Employee</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="homemaker">Homemaker</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income Range</Label>
                    <Select
                      value={formData.income}
                      onValueChange={(value) => handleChange('income', value)}
                    >
                      <SelectTrigger id="income">
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-100000">Below ₹1 Lakh</SelectItem>
                        <SelectItem value="100000-250000">₹1 - 2.5 Lakhs</SelectItem>
                        <SelectItem value="250000-500000">₹2.5 - 5 Lakhs</SelectItem>
                        <SelectItem value="500000-1000000">₹5 - 10 Lakhs</SelectItem>
                        <SelectItem value="1000000+">Above ₹10 Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location & Category Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location & Category
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">State/Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter your state"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Social Category (Optional)</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Privacy Note:</strong> Your information is used solely to provide personalized scheme recommendations. We do not share your data with third parties.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" size="lg" className="flex-1">
                  <Save className="mr-2 h-5 w-5" />
                  Save Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          {/* Benefits Info */}
          <Card className="mt-6 p-6 bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Why Complete Your Profile?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Get personalized scheme recommendations tailored to your situation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Automatically filter schemes based on your eligibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Save time by viewing only relevant government programs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>Receive updates about new schemes you might qualify for</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
