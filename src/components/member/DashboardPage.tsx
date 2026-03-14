'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, Heart, DollarSign, BookOpen, Users, Clock, MapPin, Video,
  CheckCircle2, TrendingUp, Bell, Settings, Camera, Edit3, Lock, Eye,
  EyeOff, Sparkles, Star, Gift, MessageSquare, ChevronRight, Loader2,
  Shield, User, Mail, Phone, Globe, Award, Zap, MapPin as MapPinIcon,
  Heart as HeartIcon, Church, ShieldCheck
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Registration {
  id: string;
  status: string;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string | null;
    isOnline: boolean;
    zoomJoinUrl: string | null;
  };
}

interface Donation {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
  paymentMethod: string | null;
}

interface PrayerRequest {
  id: string;
  title: string;
  request: string;
  status: string;
  prayerCount: number;
  createdAt: string;
}

export function DashboardPage() {
  const { user, isAuthenticated, setUser, setCurrentView } = useAppStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalDonations: 0,
    totalPrayers: 0,
    streakDays: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.image || '');
  const [username, setUsername] = useState(user?.username || '');
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [timezone, setTimezone] = useState(user?.timezone || '');
  const [denomination, setDenomination] = useState(user?.denomination || '');
  const [faithStatus, setFaithStatus] = useState(user?.faithStatus || '');
  const [localChurch, setLocalChurch] = useState(user?.localChurch || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileImage(user.image || '');
      setUsername(user.username || '');
      setCountry(user.country || '');
      setCity(user.city || '');
      setTimezone(user.timezone || '');
      setDenomination(user.denomination || '');
      setFaithStatus(user.faithStatus || '');
      setLocalChurch(user.localChurch || '');
      setInterests(user.interests || '');
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}`);
      const data = await res.json();
      
      setRegistrations(data.userRegistrations || []);
      setDonations(data.userDonations || []);
      setPrayers(data.userPrayers || []);
      setStats({
        totalEvents: data.userRegistrations?.length || 0,
        totalDonations: data.userDonations?.reduce((sum: number, d: Donation) => sum + d.amount, 0) || 0,
        totalPrayers: data.userPrayers?.length || 0,
        streakDays: 7,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: profileName, 
          image: profileImage,
          username,
          country,
          city,
          timezone,
          denomination,
          faithStatus,
          localChurch,
          interests
        }),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ ...user, ...updatedUser });
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (!user) return;
    setIsSavingPassword(true);
    
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      if (res.ok) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="max-w-md w-full bg-slate-900/80 border-slate-700 backdrop-blur-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Bell className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to access your personalized dashboard.
            </p>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8"
              onClick={() => setCurrentView('home')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMyMDI5M2EiIGZpbGwtb3BhY2l0eT0iLjQiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Profile Card */}
            <Card className="lg:w-80 bg-slate-900/60 border-slate-700/50 backdrop-blur-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 relative">
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <CardContent className="pt-0 relative">
                <div className="flex flex-col items-center -mt-16">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 ring-4 ring-slate-900 ring-offset-4 ring-offset-slate-900">
                      <AvatarImage src={isEditingProfile ? profileImage : user?.image || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-3xl font-bold">
                        {profileName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white transition-all shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {!isEditingProfile ? (
                    <>
                      <h2 className="text-xl font-bold text-white mt-4">{user?.name}</h2>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                          {user?.role}
                        </Badge>
                        {user?.isVerified && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Member since {formatDate(user?.memberSince || new Date().toISOString())}
                      </p>
                    </>
                  ) : (
                    <div className="w-full mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs text-left block">Full Name</Label>
                          <Input
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs text-left block">Username</Label>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="username"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Profile Photo</Label>
                        <Tabs defaultValue="upload" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-slate-800 h-8">
                            <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                            <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                          </TabsList>
                          <TabsContent value="upload" className="mt-2">
                            <div className="border-2 border-dashed border-slate-700 rounded-lg p-3 text-center hover:border-amber-500/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('type', 'images');
                                    try {
                                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                      const data = await res.json();
                                      if (data.url) {
                                        setProfileImage(data.url);
                                      }
                                    } catch (err) {
                                      console.error('Upload error:', err);
                                    }
                                  }
                                }}
                                className="hidden"
                                id="profile-photo-upload"
                              />
                              <label htmlFor="profile-photo-upload" className="cursor-pointer">
                                {profileImage ? (
                                  <img src={profileImage} alt="Profile" className="h-16 w-16 mx-auto rounded-full object-cover mb-2" />
                                ) : (
                                  <Camera className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                )}
                                <p className="text-xs text-slate-400">Click to upload photo</p>
                              </label>
                            </div>
                          </TabsContent>
                          <TabsContent value="url" className="mt-2">
                            <Input
                              value={profileImage}
                              onChange={(e) => setProfileImage(e.target.value)}
                              className="bg-slate-800/50 border-slate-700 text-white text-xs"
                              placeholder="https://..."
                            />
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Expanded Fields */}
                      <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="space-y-1.5">
                            <Label className="text-slate-300 text-[10px] uppercase font-semibold">Country</Label>
                            <Select value={country} onValueChange={setCountry}>
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs">
                                <SelectValue placeholder="Country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USA">United States</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Nigeria">Nigeria</SelectItem>
                                <SelectItem value="Kenya">Kenya</SelectItem>
                                <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-slate-300 text-[10px] uppercase font-semibold">City</Label>
                            <Input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs"
                              placeholder="City"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-slate-300 text-[10px] uppercase font-semibold">Timezone</Label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs">
                              <SelectValue placeholder="Select Timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC+3">UTC+3 (EAT)</SelectItem>
                              <SelectItem value="UTC+1">UTC+1 (WAT)</SelectItem>
                              <SelectItem value="UTC+0">UTC (GMT)</SelectItem>
                              <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-slate-300 text-[10px] uppercase font-semibold">Denomination</Label>
                          <Select value={denomination} onValueChange={setDenomination}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs">
                              <SelectValue placeholder="Denomination" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baptist">Baptist</SelectItem>
                              <SelectItem value="Anglican">Anglican</SelectItem>
                              <SelectItem value="Lutheran">Lutheran</SelectItem>
                              <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-slate-300 text-[10px] uppercase font-semibold">Local Church</Label>
                          <Input
                            value={localChurch}
                            onChange={(e) => setLocalChurch(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs"
                            placeholder="Local church name"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-slate-300 text-[10px] uppercase font-semibold">Faith Status</Label>
                          <div className="grid grid-cols-1 gap-2 p-2 bg-slate-900/30 rounded-lg">
                            {['Yes', 'Exploring Faith', 'New Believer'].map((opt) => (
                              <div key={opt} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-faith-${opt}`}
                                  checked={faithStatus === opt}
                                  onCheckedChange={() => setFaithStatus(opt)}
                                />
                                <Label htmlFor={`edit-faith-${opt}`} className="text-xs text-slate-400 cursor-pointer font-normal">{opt}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-slate-300 text-[10px] uppercase font-semibold">Interests</Label>
                          <div className="grid grid-cols-1 gap-1.5 p-2 bg-slate-900/30 rounded-lg max-h-32 overflow-y-auto">
                            {['Bible Study', 'Prayer Groups', 'Evangelism', 'Online Fellowship', 'Volunteering'].map((opt) => (
                              <div key={opt} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-interest-${opt}`}
                                  checked={interests.split(',').includes(opt)}
                                  onCheckedChange={(checked) => {
                                    const current = interests.split(',').filter(i => i);
                                    if (checked) {
                                      setInterests([...current, opt].join(','));
                                    } else {
                                      setInterests(current.filter(i => i !== opt).join(','));
                                    }
                                  }}
                                />
                                <Label htmlFor={`edit-interest-${opt}`} className="text-xs text-slate-400 cursor-pointer font-normal">{opt}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileName(user?.name || '');
                            setProfileImage(user?.image || '');
                          }}
                          className="flex-1 border-slate-700 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className="my-6 bg-slate-700/50" />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    <Lock className="h-4 w-4 mr-3" />
                    Change Password
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={() => setCurrentView('profile')}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </Button>
                </div>
                
                {/* Password Change Modal */}
                {isChangingPassword && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400" />
                      Change Password
                    </h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Current password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-slate-900/50 border-slate-600 text-white pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="New password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="bg-slate-900/50 border-slate-600 text-white pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                      
                      {passwordError && (
                        <p className="text-sm text-red-400">{passwordError}</p>
                      )}
                      {passwordSuccess && (
                        <p className="text-sm text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Password updated successfully!
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError('');
                          }}
                          className="flex-1 border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={isSavingPassword}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Right Side - Stats & Activity */}
            <div className="flex-1 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 hover:border-amber-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="h-5 w-5 text-amber-400" />
                      <Sparkles className="h-4 w-4 text-amber-400/50" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
                    <p className="text-sm text-amber-200/70">Upcoming Events</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      <TrendingUp className="h-4 w-4 text-emerald-400/50" />
                    </div>
                    <p className="text-3xl font-bold text-white">${stats.totalDonations.toLocaleString()}</p>
                    <p className="text-sm text-emerald-200/70">Total Giving</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 border-rose-500/30 hover:border-rose-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="h-5 w-5 text-rose-400" />
                      <Gift className="h-4 w-4 text-rose-400/50" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalPrayers}</p>
                    <p className="text-sm text-rose-200/70">Prayer Requests</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="h-5 w-5 text-purple-400" />
                      <Star className="h-4 w-4 text-purple-400/50" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.streakDays}</p>
                    <p className="text-sm text-purple-200/70">Day Streak 🔥</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-amber-500/50"
                      onClick={() => setCurrentView('events')}
                    >
                      <Calendar className="h-5 w-5 text-amber-400" />
                      <span className="text-slate-300 text-xs">Browse Events</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50"
                      onClick={() => setCurrentView('sermons')}
                    >
                      <BookOpen className="h-5 w-5 text-emerald-400" />
                      <span className="text-slate-300 text-xs">Watch Sermons</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-rose-500/50"
                      onClick={() => setCurrentView('prayer')}
                    >
                      <Heart className="h-5 w-5 text-rose-400" />
                      <span className="text-slate-300 text-xs">Prayer Request</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 border-slate-700 hover:bg-slate-800 hover:border-purple-500/50"
                      onClick={() => setCurrentView('contact')}
                    >
                      <Gift className="h-5 w-5 text-purple-400" />
                      <span className="text-slate-300 text-xs">Give Online</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tabs for Events, Giving, Prayers */}
              <Tabs defaultValue="events" className="w-full">
                <TabsList className="bg-slate-900/60 border border-slate-700/50 p-1">
                  <TabsTrigger value="events" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                    <Calendar className="h-4 w-4 mr-2" />
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="giving" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Giving
                  </TabsTrigger>
                  <TabsTrigger value="prayers" className="data-[state=active]:bg-rose-500 data-[state=active]:text-black">
                    <Heart className="h-4 w-4 mr-2" />
                    Prayers
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="mt-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-400" />
                        My Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                        </div>
                      ) : registrations.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                          <p className="text-slate-400 mb-4">No event registrations yet</p>
                          <Button onClick={() => setCurrentView('events')} className="bg-amber-500 hover:bg-amber-600 text-black">
                            Browse Events
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {registrations.map((reg) => (
                              <div 
                                key={reg.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700/50"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                                  <Calendar className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-medium truncate">{reg.event.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <span>{formatDate(reg.event.startDate)}</span>
                                    <span>•</span>
                                    <span>{formatTime(reg.event.startDate)}</span>
                                    {reg.event.isOnline && (
                                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                        <Video className="h-3 w-3 mr-1" />
                                        Online
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Registered
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="giving" className="mt-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                        Giving History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                        </div>
                      ) : donations.length === 0 ? (
                        <div className="text-center py-8">
                          <Gift className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                          <p className="text-slate-400 mb-4">No donations yet</p>
                          <Button onClick={() => setCurrentView('contact')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            Give Now
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {donations.map((donation) => (
                              <div 
                                key={donation.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700/50"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">${donation.amount.toFixed(2)}</h4>
                                  <p className="text-sm text-slate-400">{formatDate(donation.createdAt)}</p>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  Completed
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="prayers" className="mt-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Heart className="h-5 w-5 text-rose-400" />
                        My Prayer Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                        </div>
                      ) : prayers.length === 0 ? (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                          <p className="text-slate-400 mb-4">No prayer requests yet</p>
                          <Button onClick={() => setCurrentView('prayer')} className="bg-rose-500 hover:bg-rose-600 text-white">
                            Submit Prayer Request
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {prayers.map((prayer) => (
                              <div 
                                key={prayer.id}
                                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700/50"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-white font-medium">{prayer.title}</h4>
                                  <Badge className={
                                    prayer.status === 'ANSWERED' 
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                      : prayer.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  }>
                                    {prayer.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                  <span>{formatDate(prayer.createdAt)}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {prayer.prayerCount} prayers
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
