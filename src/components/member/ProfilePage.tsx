'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Bell, CheckCircle2, Church, Heart, BookOpen, Users, Star } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser, isAuthenticated, setCurrentView } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [bio, setBio] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (user) {
      setUser({
        ...user,
        name,
        email,
      });
    }
    
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your profile.
            </p>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setCurrentView('home')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.image || ''} />
                <AvatarFallback className="bg-amber-600 text-white text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="outline">{user?.role}</Badge>
                  {user?.isVerified && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberSince">Member Since</Label>
                <Input
                  id="memberSince"
                  value={user?.memberSince ? formatDate(user.memberSince) : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faith & Spiritual Journey */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="h-5 w-5 text-amber-600" />
              Faith & Spiritual Journey
            </CardTitle>
            <CardDescription>Your spiritual background and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Faith Status</Label>
                <p className="font-medium">{user?.faithStatusDetail || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Believes in Salvation</Label>
                <p className="font-medium">{user?.believesInSalvation || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Confessed Christ</Label>
                <p className="font-medium">{user?.confessedChrist || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Discipleship Completed</Label>
                <p className="font-medium">{user?.completedDiscipleship || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Water Baptism</Label>
                <p className="font-medium">{user?.baptisedWater || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Holy Spirit Baptism</Label>
                <p className="font-medium">{user?.baptisedSpirit || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Local Church Attendance</Label>
                <p className="font-medium">{user?.attendingLocalChurch || 'Not specified'}</p>
              </div>
            </div>
            {user?.notMemberReason && (
              <div className="pt-2 border-t mt-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Reason for not being a member</Label>
                <p className="text-sm mt-1 bg-muted p-2 rounded italic text-muted-foreground">"{user.notMemberReason}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ministry & Service */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Ministry & Service
            </CardTitle>
            <CardDescription>How you serve and areas of interest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Current Service Status</Label>
              <p className="font-medium">{user?.currentlyServing || 'Not specified'}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Ministry Interests</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.ministryInterests ? user.ministryInterests.split(',').map((interest, i) => (
                  <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                    {interest.trim()}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No interests listed</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gifts & Strengths</Label>
              <p className="text-sm text-balance">{user?.giftsStrengths || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Prayer & Follow-up */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-amber-600" />
              Prayer & Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Prayer Support Area</Label>
              <p className="text-sm">{user?.prayerSupportArea || 'None specified'}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Spiritual Growth Focus</Label>
                <p className="font-medium">{user?.spiritualGrowthArea || 'Not specified'}</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className={`w-2 h-2 rounded-full ${user?.contactPreference ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-medium text-emerald-800">
                  {user?.contactPreference ? 'Requested Contact' : 'No Contact Requested'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <div className={`w-2 h-2 rounded-full ${user?.mentorshipInterest ? 'bg-blue-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-medium text-blue-800">
                  {user?.mentorshipInterest ? 'Interested in Mentorship' : 'No Mentorship Requested'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about events, sermons, and announcements
                </p>
              </div>
              <Switch
                checked={emailOptIn}
                onCheckedChange={setEmailOptIn}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get text reminders for events and important updates
                </p>
              </div>
              <Switch
                checked={smsOptIn}
                onCheckedChange={setSmsOptIn}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            Cancel
          </Button>
          <Button 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
