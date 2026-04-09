'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, MapPin, Calendar, Bell, CheckCircle2, 
  Church, Heart, BookOpen, Users, Star, Globe, Shield, 
  Info, Loader2, Sparkles
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export function ProfilePage() {
  const { user, setUser, isAuthenticated, setCurrentView } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || '',
    timezone: user?.timezone || '',
    bio: user?.bio || '',
    
    // Faith Background
    faithStatusDetail: user?.faithStatusDetail || '',
    believesInSalvation: user?.believesInSalvation || '',
    confessedChrist: user?.confessedChrist || '',
    completedDiscipleship: user?.completedDiscipleship || '',
    baptisedWater: user?.baptisedWater || '',
    baptisedSpirit: user?.baptisedSpirit || '',
    attendingLocalChurch: user?.attendingLocalChurch || '',
    notMemberReason: user?.notMemberReason || '',
    
    // Service & Ministry
    currentlyServing: user?.currentlyServing || '',
    ministryInterests: user?.ministryInterests || '',
    giftsStrengths: user?.giftsStrengths || '',
    
    // Follow-up & Prayer
    prayerSupportArea: user?.prayerSupportArea || '',
    spiritualGrowthArea: user?.spiritualGrowthArea || '',
    contactPreference: user?.contactPreference || false,
    mentorshipInterest: user?.mentorshipInterest || false,
    
    // Notifications
    emailOptIn: user?.emailOptIn ?? true,
    smsOptIn: user?.smsOptIn ?? false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
        timezone: user.timezone || '',
        bio: user.bio || '',
        faithStatusDetail: user.faithStatusDetail || '',
        believesInSalvation: user.believesInSalvation || '',
        confessedChrist: user.confessedChrist || '',
        completedDiscipleship: user.completedDiscipleship || '',
        baptisedWater: user.baptisedWater || '',
        baptisedSpirit: user.baptisedSpirit || '',
        attendingLocalChurch: user.attendingLocalChurch || '',
        notMemberReason: user.notMemberReason || '',
        currentlyServing: user.currentlyServing || '',
        ministryInterests: user.ministryInterests || '',
        giftsStrengths: user.giftsStrengths || '',
        prayerSupportArea: user.prayerSupportArea || '',
        spiritualGrowthArea: user.spiritualGrowthArea || '',
        contactPreference: user.contactPreference || false,
        mentorshipInterest: user.mentorshipInterest || false,
        emailOptIn: user.emailOptIn ?? true,
        smsOptIn: user.smsOptIn ?? false,
      });
    }
  }, [user]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError('');
    
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <User className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-white">Sign In Required</h2>
            <p className="text-slate-400 mb-4">
              Please sign in to view your profile.
            </p>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic flex items-center gap-3">
              <User className="h-8 w-8 text-amber-500" />
              Member Profile
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="border-slate-800 text-slate-300 hover:bg-slate-900"
            >
              Back to Dashboard
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
              <Info className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Profile Header */}
          <Card className="mb-8 bg-slate-900/50 border-slate-800/50 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24 text-amber-500" />
            </div>
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-slate-800/50">
                    <AvatarImage src={user?.image || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-4xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                  <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4 text-amber-500/70" />
                    {user?.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <Badge variant="outline" className="bg-slate-800/50 text-amber-500 border-amber-500/20 px-3 py-1">
                      {user?.role}
                    </Badge>
                    <Badge className="bg-white/10 text-white border-white/10 px-3 py-1">
                      Joined {user?.memberSince ? formatDate(user.memberSince) : 'Recently'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <User className="h-5 w-5 text-amber-500" />
                    </div>
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500/50 h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500/50 h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-slate-300">Country</Label>
                      <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-slate-300">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500/50 h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-300">Brief Bio</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500/50 h-11 rounded-xl"
                      placeholder="A little about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Faith Background */}
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Church className="h-5 w-5 text-emerald-500" />
                    </div>
                    Faith & Spiritual Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Faith Status</Label>
                      <Select value={formData.faithStatusDetail} onValueChange={(v) => updateField('faithStatusDetail', v)}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          <SelectItem value="committed-believer">Committed Believer</SelectItem>
                          <SelectItem value="growing-believer">Growing Believer</SelectItem>
                          <SelectItem value="seeking">Seeking/Exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Believe in Salvation?</Label>
                      <Select value={formData.believesInSalvation} onValueChange={(v) => updateField('believesInSalvation', v)}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="not-yet">Not yet</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service & Ministry */}
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Heart className="h-5 w-5 text-blue-500" />
                    </div>
                    Service & Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Gifts & Strengths</Label>
                    <Input
                      value={formData.giftsStrengths}
                      onChange={(e) => updateField('giftsStrengths', e.target.value)}
                      className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500/50 h-11 rounded-xl"
                      placeholder="E.g. Teaching, Music, Administration..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Ministry Interests</Label>
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                      {['Worship', 'Youth', 'Children', 'Media', 'Hospitality', 'Prayer'].map((interest) => (
                        <button
                          key={interest}
                          onClick={() => {
                            const current = formData.ministryInterests ? formData.ministryInterests.split(',') : [];
                            const updated = current.includes(interest) 
                              ? current.filter(i => i !== interest)
                              : [...current, interest];
                            updateField('ministryInterests', updated.join(','));
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
                            formData.ministryInterests.split(',').includes(interest)
                              ? 'bg-amber-500 border-amber-500 text-black'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-amber-500/30'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Status & Settings */}
            <div className="space-y-8">
              {/* Notification Settings */}
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white text-lg">
                    <Bell className="h-5 w-5 text-amber-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-200">Email Updates</Label>
                      <p className="text-xs text-slate-500">Weekly newsletters & news</p>
                    </div>
                    <Switch
                      checked={formData.emailOptIn}
                      onCheckedChange={(v) => updateField('emailOptIn', v)}
                    />
                  </div>
                  <Separator className="bg-slate-800" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-slate-200">SMS Alerts</Label>
                      <p className="text-xs text-slate-500">Event reminders via text</p>
                    </div>
                    <Switch
                      checked={formData.smsOptIn}
                      onCheckedChange={(v) => updateField('smsOptIn', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Success Indicators */}
              <Card className="bg-gradient-to-br from-slate-900 to-indigo-900/20 border-slate-800/60 shadow-xl">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Account Fully Verified
                  </div>
                  <div className="flex items-center gap-3 text-amber-400 text-sm font-medium">
                    <Shield className="h-5 w-5" />
                    Ministry Registration Complete
                  </div>
                  <Separator className="bg-slate-800/50" />
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                    Profile activity is logged for security and community moderation purposes.
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
                  {saved ? 'Changes Saved!' : 'Save All Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('dashboard')}
                  className="border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel & Exit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
