'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Mail, MapPin, Bell, CheckCircle2, 
  Church, Heart, BookOpen, Users, Star, Globe, Shield, 
  Info, Loader2, Sparkles, Target, Zap, Edit3
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, setCurrentView } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    timezone: user?.timezone || '',
    
    faithStatusDetail: user?.faithStatusDetail || '',
    believesInSalvation: user?.believesInSalvation || '',
    confessedChrist: user?.confessedChrist || '',
    completedDiscipleship: user?.completedDiscipleship || '',
    baptisedWater: user?.baptisedWater || '',
    baptisedSpirit: user?.baptisedSpirit || '',
    attendingLocalChurch: user?.attendingLocalChurch || '',
    notMemberReason: user?.notMemberReason || '',
    
    currentlyServing: user?.currentlyServing || '',
    ministryInterests: user?.ministryInterests || '',
    giftsStrengths: user?.giftsStrengths || '',
    
    prayerSupportArea: user?.prayerSupportArea || '',
    spiritualGrowthArea: user?.spiritualGrowthArea || '',
    contactPreference: user?.contactPreference || false,
    mentorshipInterest: user?.mentorshipInterest || false,
    
    dataConsent: user?.dataConsent || false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        timezone: user.timezone || '',
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
        dataConsent: user.dataConsent || false,
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

  const isProfileComplete = user?.dataConsent && user?.faithStatusDetail && user?.believesInSalvation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
              <User className="h-8 w-8 text-amber-500" />
              Member Profile
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
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
                  {isProfileComplete && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 shadow-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
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
                    {isProfileComplete && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Profile Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="bg-slate-900/60 border border-slate-800/50 p-1 w-full grid grid-cols-4">
              <TabsTrigger value="personal" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg text-xs md:text-sm">
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="faith" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black rounded-lg text-xs md:text-sm">
                <Church className="h-4 w-4 mr-2" />
                Faith
              </TabsTrigger>
              <TabsTrigger value="ministry" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg text-xs md:text-sm">
                <Heart className="h-4 w-4 mr-2" />
                Ministry
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-lg text-xs md:text-sm">
                <Target className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <User className="h-5 w-5 text-amber-500" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your basic contact and location details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300 font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="bg-slate-950/50 border-slate-700 text-white focus:border-amber-500/50 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="bg-slate-800/30 border-slate-700/50 text-slate-400 h-12 rounded-xl cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-300 font-medium">Phone / WhatsApp</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="Your phone number"
                        className="bg-slate-950/50 border-slate-700 text-white focus:border-amber-500/50 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-slate-300 font-medium">Country</Label>
                      <Select value={formData.country} onValueChange={(v) => updateField('country', v)}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 rounded-xl">
                          <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-slate-300 font-medium">City / Region</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Your city"
                        className="bg-slate-950/50 border-slate-700 text-white focus:border-amber-500/50 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-slate-300 font-medium">Time Zone</Label>
                      <Select value={formData.timezone} onValueChange={(v) => updateField('timezone', v)}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white h-12 rounded-xl">
                          <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 rounded-xl">
                          <SelectItem value="UTC+3">UTC+3 (East Africa Time)</SelectItem>
                          <SelectItem value="UTC+1">UTC+1 (West Africa Time)</SelectItem>
                          <SelectItem value="UTC+0">UTC (GMT)</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                          <SelectItem value="UTC+5.5">UTC+5:30 (IST)</SelectItem>
                          <SelectItem value="UTC+8">UTC+8 (SGT/CST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faith" className="mt-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Church className="h-5 w-5 text-emerald-500" />
                    </div>
                    Faith & Spiritual Journey
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your spiritual background and beliefs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Current Faith Status</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.faithStatusDetail || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Believes in Salvation</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.believesInSalvation || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Confessed Christ as Lord</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.confessedChrist || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Completed Discipleship</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.completedDiscipleship || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Water Baptism</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.baptisedWater || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Spirit Baptism</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.baptisedSpirit || <span className="text-slate-500 italic">Not specified</span>}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Attending Local Church</Label>
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <p className="text-white">{formData.attendingLocalChurch || <span className="text-slate-500 italic">Not specified</span>}</p>
                    </div>
                  </div>
                  
                  {formData.notMemberReason && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Reason for Not Attending</Label>
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-white">{formData.notMemberReason}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ministry" className="mt-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    Service & Ministry
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your ministry involvement and interests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Currently Serving In Ministry</Label>
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <p className="text-white">{formData.currentlyServing || <span className="text-slate-500 italic">Not specified</span>}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Ministry Interests</Label>
                    {formData.ministryInterests ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.ministryInterests.split(',').filter(i =>i.trim()).map((interest, idx) => (
                          <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1.5 rounded-lg">
                            {interest.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                        <p className="text-slate-500 italic">No ministry interests specified</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Gifts & Strengths</Label>
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <p className="text-white">{formData.giftsStrengths || <span className="text-slate-500 italic">Not specified</span>}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="bg-slate-900/40 border-slate-800/60 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                    Care & Support
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Prayer needs and spiritual growth focus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Prayer Support Area</Label>
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <p className="text-white">{formData.prayerSupportArea || <span className="text-slate-500 italic">Not specified</span>}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">Spiritual Growth Focus</Label>
                    <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <p className="text-white">{formData.spiritualGrowthArea || <span className="text-slate-500 italic">Not specified</span>}</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700/50" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <div className="space-y-1">
                        <Label className="text-white font-medium">Personal Contact</Label>
                        <p className="text-xs text-slate-400">Requested follow-up</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${formData.contactPreference ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/50 text-slate-500'}`}>
                        {formData.contactPreference ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-slate-700/50">
                      <div className="space-y-1">
                        <Label className="text-white font-medium">Mentorship Interest</Label>
                        <p className="text-xs text-slate-400">Spiritual mentorship</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${formData.mentorshipInterest ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/50 text-slate-500'}`}>
                        {formData.mentorshipInterest ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

                      <Card className="mt-8 bg-gradient-to-br from-slate-900 to-indigo-900/20 border-slate-800/60 shadow-xl">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Account Fully Verified
                </div>
                {formData.dataConsent && (
                  <div className="flex items-center gap-3 text-amber-400 text-sm font-medium">
                    <Shield className="h-5 w-5" />
                    Ministry Registration Complete
                  </div>
                )}
              </div>
              <Separator className="bg-slate-800/50" />
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
                  {saved ? 'Changes Saved!' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/register/ministry')} 
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Update Ministry Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}