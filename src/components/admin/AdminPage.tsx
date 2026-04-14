'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Scatter
} from 'recharts';
import { 
  Users, Calendar, BookOpen, DollarSign, Heart, Church, Home, Settings, Info,
  TrendingUp, Activity, Clock, CheckCircle2, AlertCircle, Video,
  BarChart3, ArrowUpRight, ArrowDownRight, Plus, Search, Bell,
  Mail, UserPlus, ChevronRight, Layers, MessageSquare, UsersRound,
  Megaphone, FileText, PieChart as PieChartIcon, FolderOpen, Play,
  MonitorPlay, MapPin, ZoomIn, Globe, Gift, Target, Award, Sparkles,
  MoreHorizontal, Pencil, Trash2, Eye, Loader2, Download, Upload,
  Rocket, Wrench, Lock, Shield, AlertTriangle, Archive, LayoutDashboard,
  Smartphone, Send, TestTube, Pause, Play as PlayIcon, RefreshCw,
  Image as ImageIcon, Music, File, FolderClosed, Grid, List, X, Check, Copy, ShieldCheck, UserCircle, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { MediaPicker } from './MediaPicker';

import { SocialLoginSettings } from './SocialLoginSettings';
import { EmailSettingsView } from './EmailSettingsView';
import { SmsSettingsView } from './SmsSettingsView';

// Types
interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  totalSermons: number;
  upcomingEvents: number;
  liveEvents: number;
  pendingPrayers: number;
  answeredPrayers: number;
  recentRegistrations: number;
  monthlyGiving: number;
  totalDonationAmount: number;
  totalDonations: number;
  totalGroups: number;
  activeGroups: number;
  groupMembers: number;
  totalVisitors: number;
  activeVisitors: number;
  todayViews: number;
  yesterdayViews: number;
}

interface ChartData {
  donationTrends: Array<{ month: string; amount: number; donors: number }>;
  memberGrowth: Array<{ month: string; newMembers: number }>;
  eventsByType: Array<{ name: string; value: number }>;
  usersByRole: Array<{ name: string; value: number }>;
  prayersByStatus: Array<{ name: string; value: number }>;
  registrationsByStatus: Array<{ name: string; value: number }>;
  hourlyTraffic: Array<{ time: string; views: number }>;
  topPages: Array<{ name: string; value: number }>;
  browsers: Array<{ name: string; value: number }>;
  devices: Array<{ name: string; value: number }>;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  phone?: string | null;
  createdAt: string;
  isActive: boolean;
  isVerified?: boolean;
  username?: string;
  country?: string;
  city?: string;
  timezone?: string;
  denomination?: string;
  faithStatus?: string;
  localChurch?: string;
  interests?: string;
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
  acceptedStatementOfFaith?: boolean;
}

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  registrationCount: number;
}

interface Sermon {
  id: string;
  title: string;
  speakerName: string;
  description: string | null;
  scripture: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  publishedAt: string | null;
  tags: string | null;
  seriesId: string | null;
  series?: { name: string };
  createdAt: string;
}

interface SermonSeries {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count?: { sermons: number };
}

interface Donation {
  id: string;
  amount: number;
  donorName: string | null;
  createdAt: string;
  isRecurring: boolean;
}

interface SmallGroup {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  location: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  maxMembers: number | null;
  imageUrl: string | null;
  isActive: boolean;
  country: string | null;
  city: string | null;
  timezone: string | null;
  denomination: string | null;
  faithStatus: string | null;
  localChurch: string | null;
  interests: string | null;
  _count: { members: number };
  members?: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
}

// Sidebar menu categories
const menuCategories = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'People',
    items: [
      { id: 'members', label: 'Members', icon: Users },
      { id: 'visitors', label: 'Visitors', icon: UserPlus },
      { id: 'groups', label: 'Small Groups', icon: UsersRound },
    ]
  },
  {
    title: 'Events',
    items: [
      { id: 'events', label: 'All Events', icon: Calendar },
      { id: 'registrations', label: 'Registrations', icon: CheckCircle2 },
      { id: 'programs', label: 'Programs', icon: Layers },
    ]
  },
  {
    title: 'Content',
    items: [
      { id: 'sermons', label: 'Sermons', icon: BookOpen },
      { id: 'series', label: 'Sermon Series', icon: FolderOpen },
      { id: 'testimonies', label: 'Testimonies', icon: MessageSquare },
      { id: 'media', label: 'Media Library', icon: Play },
    ]
  },
  {
    title: 'Finance',
    items: [
      { id: 'donations', label: 'Donations', icon: DollarSign },
      { id: 'campaigns', label: 'Campaigns', icon: Target },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'prayers', label: 'Prayer Requests', icon: Heart },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'emails', label: 'Email Templates', icon: Mail },
      { id: 'email-subscriptions', label: 'Email Subscriptions', icon: Users },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity', label: 'Activity Log', icon: Activity },
    ]
  }
];

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function AdminPage() {
  const { user, isAuthenticated, setCurrentView, settings } = useAppStore();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // Function to navigate within admin panel
  const navigateToSection = (section: string) => {
    setActiveMenu(section);
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0, activeMembers: 0, totalEvents: 0, totalSermons: 0,
    upcomingEvents: 0, liveEvents: 0, pendingPrayers: 0, answeredPrayers: 0,
    recentRegistrations: 0, monthlyGiving: 0, totalDonationAmount: 0, totalDonations: 0,
    totalGroups: 0, activeGroups: 0, groupMembers: 0, totalVisitors: 0,
    activeVisitors: 0, todayViews: 0, yesterdayViews: 0
  });
  const [charts, setCharts] = useState<ChartData>({
    donationTrends: [], memberGrowth: [], eventsByType: [], usersByRole: [],
    prayersByStatus: [], registrationsByStatus: [],
    hourlyTraffic: [], topPages: [], browsers: [], devices: []
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'PASTOR') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      
      if (data.stats) setStats(data.stats);
      if (data.charts) setCharts(data.charts);
      setMembers(data.recentMembers || []);
      setEvents(data.upcomingEvents || []);
      setSermons(data.popularSermons || []);
      setDonations(data.recentDonations || []);
      setGroups(data.smallGroups || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Generate weekly attendance data
  const getWeeklyAttendanceData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day) => ({
      day,
      attendance: Math.floor(100 + Math.random() * 150),
      online: Math.floor(50 + Math.random() * 100),
    }));
  };

  // Get engagement radar data
  const getEngagementData = () => {
    return [
      { subject: 'Events', A: 85, fullMark: 100 },
      { subject: 'Sermons', A: 75, fullMark: 100 },
      { subject: 'Groups', A: 65, fullMark: 100 },
      { subject: 'Giving', A: 80, fullMark: 100 },
      { subject: 'Prayer', A: 70, fullMark: 100 },
      { subject: 'Outreach', A: 55, fullMark: 100 },
    ];
  };

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'PASTOR')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Card className="max-w-md mx-auto bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">
              You don&apos;t have permission to access the admin panel.
            </p>
            <Button onClick={() => setCurrentView('home')} className="bg-amber-500 hover:bg-amber-600">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent stats={stats} charts={charts} members={members} events={events} sermons={sermons} donations={donations} groups={groups} formatDate={formatDate} formatCurrency={formatCurrency} navigateToSection={navigateToSection} />;
      case 'members':
        return <MembersContent members={members} searchQuery={searchQuery} setSearchQuery={setSearchQuery} formatDate={formatDate} />;
      case 'events':
        return <EventsContent events={events} formatDate={formatDate} />;
      case 'sermons':
        return <SermonsContent sermons={sermons} formatDate={formatDate} />;
      case 'donations':
        return <DonationsContent donations={donations} stats={stats} charts={charts} formatDate={formatDate} formatCurrency={formatCurrency} />;
      case 'campaigns':
        return <CampaignsContent />;
      case 'prayers':
        return <PrayersContent charts={charts} stats={stats} user={user} />;
      case 'series':
        return <SeriesContent />;
      case 'groups':
        return <GroupsContent initialGroups={groups} />;
      case 'settings':
        return <SettingsContent />;
      case 'activity':
        return <ActivityLogContent />;

      case 'email-subscriptions':
        return <EmailSettingsView />;
      case 'media':
        return <MediaLibraryContent />;
      case 'testimonies':
        return <TestimoniesContent />;
      case 'programs':
        return <ProgramsContent />;
      case 'registrations':
        return <RegistrationsContent />;
      default:
        return <ComingSoonContent feature={activeMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", !sidebarOpen && "justify-center w-full ml-0")}>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                <Church className="h-5 w-5 text-white" />
              </div>
            )}
            {sidebarOpen && (
              <span className="font-bold text-white truncate max-w-[150px] animate-in fade-in slide-in-from-left-2 duration-300">
                {settings.siteName || 'GraceAdmin'}
              </span>
            )}
          </div>
          {sidebarOpen ? (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 ml-2"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Expand Sidebar"
            />
          )}
        </div>

        {/* Menu Categories */}
        <ScrollArea className={cn(
          "transition-all duration-300",
          sidebarOpen ? "h-[calc(100vh-7.5rem)]" : "h-[calc(100vh-4rem)]"
        )}>
          <div className={cn("space-y-4", sidebarOpen ? "p-3 pb-6" : "p-3")}>
            {menuCategories.map((category) => (
              <div key={category.title}>
                {sidebarOpen && (
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {category.title}
                  </h3>
                )}
                <nav className="space-y-1">
                  {category.items.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => setActiveMenu(item.id)}
                      className={cn(
                        "w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800",
                        activeMenu === item.id && "bg-amber-500/10 text-amber-500 hover:text-amber-400 hover:bg-amber-500/20",
                        !sidebarOpen && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900 transition-all duration-300",
          sidebarOpen ? "p-4" : "p-2"
        )}>
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            <Avatar className="h-9 w-9 border-2 border-amber-500 shrink-0">
              <AvatarFallback className="bg-amber-500 text-white">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-white shrink-0"
                  onClick={() => setCurrentView('home')}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white capitalize">
                {menuCategories.flatMap(c => c.items).find(i => i.id === activeMenu)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ stats, charts, members, events, sermons, donations, groups, formatDate, formatCurrency, navigateToSection }: {
  stats: DashboardStats;
  charts: ChartData;
  members: Member[];
  events: Event[];
  sermons: Sermon[];
  donations: Donation[];
  groups: SmallGroup[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  navigateToSection: (section: string) => void;
}) {
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [newMember, setNewMember] = useState({ 
    name: '', 
    email: '', 
    username: '',
    role: 'MEMBER', 
    phone: '',
    country: '',
    city: '',
    timezone: '',
    denomination: '',
    faithStatus: '',
    localChurch: '',
    interests: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedStatementOfFaith: false,
  });
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate engagement data from real stats
  const engagementData = [
    { subject: 'Events', A: stats.totalEvents > 0 ? Math.min(100, Math.round((stats.recentRegistrations / Math.max(stats.totalMembers, 1)) * 100)) : 0, fullMark: 100 },
    { subject: 'Sermons', A: stats.totalSermons > 0 ? 75 : 0, fullMark: 100 },
    { subject: 'Groups', A: stats.totalGroups > 0 ? Math.round((stats.groupMembers / Math.max(stats.totalMembers, 1)) * 100) : 0, fullMark: 100 },
    { subject: 'Giving', A: stats.totalDonations > 0 ? 80 : 0, fullMark: 100 },
    { subject: 'Prayer', A: stats.pendingPrayers > 0 || stats.answeredPrayers > 0 ? Math.round((stats.answeredPrayers / Math.max(stats.pendingPrayers + stats.answeredPrayers, 1)) * 100) : 0, fullMark: 100 },
    { subject: 'Outreach', A: stats.totalVisitors > 0 ? Math.min(100, Math.round((stats.totalVisitors / Math.max(stats.totalMembers, 1)) * 50)) : 0, fullMark: 100 },
  ];

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMember, password: 'password123' }),
      });
      if (res.ok) {
        setNewMember({ 
          name: '', 
          email: '', 
          username: '',
          role: 'MEMBER', 
          phone: '',
          country: '',
          city: '',
          timezone: '',
          denomination: '',
          faithStatus: '',
          localChurch: '',
          interests: '',
          acceptedTerms: false,
          acceptedPrivacy: false,
          acceptedStatementOfFaith: false,
        });
        setShowAddMemberDialog(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterSubject || !newsletterContent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newsletterSubject, content: newsletterContent }),
      });
      if (res.ok) {
        setNewsletterSubject('');
        setNewsletterContent('');
        setShowNewsletterDialog(false);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalMembers}</p>
                <p className="text-amber-300 text-xs mt-2 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{stats.activeMembers} active
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">Monthly Giving</p>
                <p className="text-3xl font-bold text-white mt-1">{formatCurrency(stats.monthlyGiving)}</p>
                <p className="text-emerald-300 text-xs mt-2 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{stats.totalDonations} donations
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.upcomingEvents}</p>
                <p className="text-blue-300 text-xs mt-2 flex items-center">
                  {stats.liveEvents > 0 && (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                      {stats.liveEvents} live now
                    </>
                  )}
                  {stats.liveEvents === 0 && 'This week'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Active Visitors</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.activeVisitors || 0}</p>
                <p className="text-purple-300 text-xs mt-2 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Live now
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Globe className="h-7 w-7 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Comparison row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium">Today&apos;s Views</p>
              <p className="text-xl font-bold text-white mt-1">{stats.todayViews || 0}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={cn(
                "border-emerald-500/30 text-emerald-400",
                (stats.todayViews || 0) < (stats.yesterdayViews || 0) && "border-red-500/30 text-red-400"
              )}>
                {(stats.todayViews || 0) >= (stats.yesterdayViews || 0) ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {stats.yesterdayViews > 0 ? Math.abs(Math.round(((stats.todayViews - stats.yesterdayViews) / stats.yesterdayViews) * 100)) : 0}%
              </Badge>
              <p className="text-[10px] text-slate-500 mt-1">vs yesterday ({stats.yesterdayViews || 0})</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium">Top Browser</p>
              <p className="text-xl font-bold text-white mt-1">{charts.browsers?.[0]?.name || '---'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <MonitorPlay className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium">Most Active Device</p>
              <p className="text-xl font-bold text-white mt-1">{charts.devices?.[0]?.name || '---'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium">Engagement Rate</p>
              <p className="text-xl font-bold text-white mt-1">78%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Small Groups', value: stats.totalGroups, icon: UsersRound, color: 'cyan' },
          { label: 'Group Members', value: stats.groupMembers, icon: Users, color: 'pink' },
          { label: 'Sermons', value: stats.totalSermons, icon: BookOpen, color: 'orange' },
          { label: 'Registrations', value: stats.recentRegistrations, icon: CheckCircle2, color: 'green' },
          { label: 'Total Raised', value: formatCurrency(stats.totalDonationAmount), icon: Gift, color: 'amber' },
          { label: 'Visitors', value: stats.totalVisitors, icon: Sparkles, color: 'violet' },
        ].map((item) => (
          <Card key={item.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/20 flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{item.label}</p>
                  <p className="text-white font-semibold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donation Trends */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Donation Trends</CardTitle>
                <CardDescription className="text-slate-400">Monthly giving patterns</CardDescription>
              </div>
              {stats.totalDonations > 0 && (
                <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.totalDonations} donations
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {charts.donationTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.donationTrends}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" name="Amount ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <DollarSign className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No donation data yet</p>
                  <p className="text-sm">Donations will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Registration Stats */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Event Registrations</CardTitle>
                <CardDescription className="text-slate-400">Registration status breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {charts.registrationsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.registrationsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Calendar className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No registrations yet</p>
                  <p className="text-sm">Event registrations will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Roles */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {charts.usersByRole.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.usersByRole}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value"
                    >
                      {charts.usersByRole.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Users className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">No users yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Event Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {charts.eventsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.eventsByType}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                    >
                      {charts.eventsByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Calendar className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">No events yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prayer Status */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Prayer Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {charts.prayersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.prayersByStatus}
                      cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    >
                      {charts.prayersByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Heart className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">No prayer requests yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Overview Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hourly Traffic */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Traffic Overview</CardTitle>
                <CardDescription className="text-slate-400">Views in the last 24 hours</CardDescription>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                <Activity className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {charts.hourlyTraffic?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.hourlyTraffic}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTraffic)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Activity className="h-10 w-10 mb-2 opacity-20" />
                  <p>Awaiting traffic data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Popular Pages</CardTitle>
            <CardDescription className="text-slate-400">Most visited paths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.topPages?.length > 0 ? (
                charts.topPages.map((page, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[150px]">{page.name}</span>
                      <span className="text-white font-medium">{page.value} views</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${Math.min(100, (page.value / (charts.topPages[0].value || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-10">No page data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Members */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Members</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition">
                    <Avatar className="h-10 w-10 border-2 border-amber-500/50">
                      <AvatarFallback className="bg-amber-500/20 text-amber-400">
                        {member.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <p className="text-slate-400 text-sm truncate">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn(
                        "border-slate-600",
                        member.role === 'ADMIN' && "border-red-500/50 text-red-400",
                        member.role === 'PASTOR' && "border-purple-500/50 text-purple-400",
                        member.role === 'MEMBER' && "border-green-500/50 text-green-400",
                        member.role === 'VISITOR' && "border-blue-500/50 text-blue-400"
                      )}>
                        {member.role}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(member.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => navigateToSection('events')}>
              <Calendar className="h-4 w-4 mr-3 text-amber-400" />
              Create Event
            </Button>
            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => navigateToSection('sermons')}>
              <BookOpen className="h-4 w-4 mr-3 text-blue-400" />
              Add Sermon
            </Button>
            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => navigateToSection('prayers')}>
              <Heart className="h-4 w-4 mr-3 text-pink-400" />
              Review Prayers
            </Button>
            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => setShowAddMemberDialog(true)}>
              <UserPlus className="h-4 w-4 mr-3 text-emerald-400" />
              Add Member
            </Button>
            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => setShowNewsletterDialog(true)}>
              <Mail className="h-4 w-4 mr-3 text-purple-400" />
              Send Newsletter
            </Button>
          </CardContent>
          <Separator className="bg-slate-800" />
          <CardContent className="pt-4">
            <h4 className="text-white font-medium mb-3">Database Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Sermons</span>
                <span className="text-white font-medium">{stats.totalSermons}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Raised</span>
                <span className="text-white font-medium">{formatCurrency(stats.totalDonationAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Active Groups</span>
                <span className="text-white font-medium">{stats.activeGroups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Answered Prayers</span>
                <span className="text-white font-medium">{stats.answeredPrayers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the details for the new member. They will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Full Name</Label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Role</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VISITOR">Visitor</SelectItem>
                  <SelectItem value="PASTOR">Pastor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Newsletter Dialog */}
      <Dialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription className="text-slate-400">
              Send an email newsletter to all subscribed members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Subject</Label>
              <Input
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
                placeholder="Weekly Update from Grace Church"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Message</Label>
              <textarea
                value={newsletterContent}
                onChange={(e) => setNewsletterContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                className="bg-slate-800 border-slate-700 text-white rounded-md p-3 min-h-[150px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewsletterDialog(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSendNewsletter} disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-600 text-white">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Members Content Component
function MembersContent({ members, searchQuery, setSearchQuery, formatDate }: {
  members: Member[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  formatDate: (date: string) => string;
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberList, setMemberList] = useState<Member[]>(members);
  
  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    username: '',
    role: 'MEMBER',
    phone: '',
    country: '',
    city: '',
    timezone: '',
    denomination: '',
    faithStatus: '',
    localChurch: '',
    interests: [] as string[],
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedStatementOfFaith: false,
    password: '',
  });

  // Form state for edit member
  const [editMember, setEditMember] = useState({
    name: '',
    email: '',
    username: '',
    role: 'MEMBER',
    isActive: true,
    phone: '',
    country: '',
    city: '',
    timezone: '',
    denomination: '',
    faithStatus: '',
    localChurch: '',
    interests: [] as string[],
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedStatementOfFaith: false,
  });

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await fetch('/api/users?limit=1000');
        if (res.ok) {
          const data = await res.json();
          setMemberList(data);
        } else {
          setMemberList(members);
        }
      } catch (error) {
        console.error('Failed to fetch all members:', error);
        setMemberList(members);
      }
    };
    fetchAllMembers();
  }, [members]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredMembers = memberList.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMember,
          interests: newMember.interests.join(','),
          password: newMember.password || 'password123',
        }),
      });
      
      if (res.ok) {
        const createdMember = await res.json();
        setMemberList(prev => [createdMember, ...prev]);
        setNewMember({ 
          name: '', 
          email: '', 
          username: '',
          role: 'MEMBER', 
          phone: '',
          country: '',
          city: '',
          timezone: '',
          denomination: '',
          faithStatus: '',
          localChurch: '',
          interests: [],
          acceptedTerms: false,
          acceptedPrivacy: false,
          acceptedStatementOfFaith: false,
          password: '',
        });
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember || !editMember.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editMember,
          interests: editMember.interests.join(','),
        }),
      });
      
      if (res.ok) {
        setMemberList(prev => prev.map(m => 
          m.id === selectedMember.id 
            ? { ...m, ...editMember, interests: editMember.interests.join(',') }
            : m
        ));
        setIsEditDialogOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error editing member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedMember.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setMemberList(prev => prev.filter(m => m.id !== selectedMember.id));
        setIsDeleteDialogOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setEditMember({
      name: member.name || '',
      email: member.email,
      username: member.username || '',
      role: member.role,
      isActive: member.isActive,
      phone: member.phone || '',
      country: member.country || '',
      city: member.city || '',
      timezone: member.timezone || '',
      denomination: member.denomination || '',
      faithStatus: member.faithStatus || '',
      localChurch: member.localChurch || '',
      interests: member.interests ? member.interests.split(',').map(i => i.trim()) : [],
      acceptedTerms: member.acceptedTerms || false,
      acceptedPrivacy: member.acceptedPrivacy || false,
      acceptedStatementOfFaith: member.acceptedStatementOfFaith || false,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search members..." 
              className="pl-10 w-80 bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Add Member Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill in the member details. Password will be set to a default if not provided.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* 1. Basic Personal Information */}
              <div>
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  1. Basic Personal Information
                </h4>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name *</Label>
                      <Input
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email Address *</Label>
                      <Label className="text-slate-500 text-xs block">(required for login and communication)</Label>
                      <Input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Username</Label>
                      <Input
                        value={newMember.username}
                        onChange={(e) => setNewMember(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="johndoe"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={newMember.password}
                        onChange={(e) => setNewMember(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Leave blank for default"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Role</Label>
                      <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VISITOR">Visitor</SelectItem>
                          <SelectItem value="PASTOR">Pastor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* 2. Location Information */}
              <div>
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  2. Location Information
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Country</Label>
                    <Select value={newMember.country} onValueChange={(value) => setNewMember(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">City / Region</Label>
                    <Input
                      value={newMember.city}
                      onChange={(e) => setNewMember(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Time Zone</Label>
                    <Select value={newMember.timezone} onValueChange={(value) => setNewMember(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select Time Zone" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Africa/Addis_Ababa">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* 3. Church / Faith Information */}
              <div>
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <Church className="h-4 w-4" />
                  3. Church / Faith Information
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Denomination (Optional)</Label>
                    <Select value={newMember.denomination} onValueChange={(value) => setNewMember(prev => ({ ...prev, denomination: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select Denomination" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Baptist">Baptist</SelectItem>
                        <SelectItem value="Anglican">Anglican</SelectItem>
                        <SelectItem value="Lutheran">Lutheran</SelectItem>
                        <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                        <SelectItem value="Methodist">Methodist</SelectItem>
                        <SelectItem value="Presbyterian">Presbyterian</SelectItem>
                        <SelectItem value="Catholic">Catholic</SelectItem>
                        <SelectItem value="Non-denominational">Non-denominational</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Are you a Christian?</Label>
                    <Select value={newMember.faithStatus} onValueChange={(value) => setNewMember(prev => ({ ...prev, faithStatus: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="believer">Yes - I am a Christian</SelectItem>
                        <SelectItem value="exploring">Exploring Faith</SelectItem>
                        <SelectItem value="new_believer">New Believer</SelectItem>
                        <SelectItem value="seeker">Seeker / Curious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-slate-300">Local Church Name (Optional)</Label>
                  <Input
                    value={newMember.localChurch}
                    onChange={(e) => setNewMember(prev => ({ ...prev, localChurch: e.target.value }))}
                    placeholder="Grace Community Church"
                    className="bg-slate-800 border-slate-700 text-white mt-2"
                  />
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* 4. Interests or Ministries */}
              <div>
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  4. Interests or Ministries
                </h4>
                <Label className="text-slate-300 text-sm">Select the areas you are interested in:</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {['Bible Study', 'Prayer Groups', 'Evangelism', 'Online Fellowship', 'Volunteering', 'Worship Team', 'Youth Ministry', 'Children Ministry'].map((interest) => (
                    <label key={interest} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMember.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMember(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                          } else {
                            setNewMember(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-slate-300 text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* 5. Agreement and Consent */}
              <div>
                <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  5. Agreement and Consent
                </h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.acceptedTerms}
                      onChange={(e) => setNewMember(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                      className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                    />
                    <span className="text-slate-300 text-sm">I accept the Terms of Use</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.acceptedPrivacy}
                      onChange={(e) => setNewMember(prev => ({ ...prev, acceptedPrivacy: e.target.checked }))}
                      className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                    />
                    <span className="text-slate-300 text-sm">I accept the Privacy Policy</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.acceptedStatementOfFaith}
                      onChange={(e) => setNewMember(prev => ({ ...prev, acceptedStatementOfFaith: e.target.checked }))}
                      className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                    />
                    <span className="text-slate-300 text-sm">I agree with the Statement of Faith</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Member</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Role</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Status</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Joined</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-amber-500/20 text-amber-400">
                            {member.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-slate-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn(
                        "border-slate-600",
                        member.role === 'ADMIN' && "border-red-500/50 text-red-400",
                        member.role === 'PASTOR' && "border-purple-500/50 text-purple-400",
                        member.role === 'MEMBER' && "border-green-500/50 text-green-400",
                        member.role === 'VISITOR' && "border-blue-500/50 text-blue-400"
                      )}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={member.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700">
                          <DropdownMenuLabel className="text-slate-300">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            onClick={() => openViewDialog(member)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem 
                            className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                            onClick={() => openDeleteDialog(member)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     let pageNum = i + 1;
                     if (totalPages > 5) {
                       pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                     }
                     return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-amber-500 hover:bg-amber-600 text-black border-transparent" 
                          : "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-9 h-9 p-0"
                        }
                      >
                        {pageNum}
                      </Button>
                     );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-amber-500">
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xl">
                    {selectedMember.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                  <p className="text-slate-400">{selectedMember.email}</p>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Account Info</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Username</span>
                        <span className="text-white font-medium">{selectedMember.username || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Role</span>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {selectedMember.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Status</span>
                        <Badge className={selectedMember.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                          {selectedMember.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Location & Faith</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Country</span>
                        <span className="text-white">{selectedMember.country || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">City</span>
                        <span className="text-white">{selectedMember.city || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Denomination</span>
                        <span className="text-white">{selectedMember.denomination || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Faith Status</span>
                        <span className="text-amber-400">{selectedMember.faithStatus || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Church & Interests</p>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm">
                        <p className="text-slate-400">Local Church</p>
                        <p className="text-white font-medium">{selectedMember.localChurch || 'Not set'}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-slate-400">Interests</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedMember.interests ? selectedMember.interests.split(',').map((interest, i) => (
                            <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 text-[10px]">
                              {interest.trim()}
                            </Badge>
                          )) : <span className="text-slate-500 text-xs italic">No interests listed</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Metadata</p>
                    <div className="mt-2 space-y-2 text-sm text-slate-400">
                      <p>Joined: <span className="text-slate-300">{formatDate(selectedMember.createdAt)}</span></p>
                      <p>Timezone: <span className="text-slate-300">{selectedMember.timezone || 'Not set'}</span></p>
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {selectedMember.acceptedTerms ? <ShieldCheck className="h-3 w-3 text-emerald-400" /> : <div className="h-3 w-3 rounded-full border border-slate-600" />}
                          <span className={selectedMember.acceptedTerms ? "text-slate-300" : "text-slate-500"}>Terms Accepted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {selectedMember.acceptedPrivacy ? <ShieldCheck className="h-3 w-3 text-emerald-400" /> : <div className="h-3 w-3 rounded-full border border-slate-600" />}
                          <span className={selectedMember.acceptedPrivacy ? "text-slate-300" : "text-slate-500"}>Privacy Accepted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedMember) openEditDialog(selectedMember);
            }} className="bg-amber-500 hover:bg-amber-600 text-black">
              Edit Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the member&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 1. Basic Personal Information */}
            <div>
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                1. Basic Personal Information
              </h4>
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Full Name *</Label>
                    <Input
                      value={editMember.name}
                      onChange={(e) => setEditMember(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email Address *</Label>
                    <Input
                      type="email"
                      value={editMember.email}
                      onChange={(e) => setEditMember(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Username</Label>
                    <Input
                      value={editMember.username}
                      onChange={(e) => setEditMember(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Role</Label>
                    <Select value={editMember.role} onValueChange={(value) => setEditMember(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="VISITOR">Visitor</SelectItem>
                        <SelectItem value="PASTOR">Pastor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editMember.isActive}
                    onChange={(e) => setEditMember(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                  />
                  <Label htmlFor="edit-active" className="text-slate-300">Active Member</Label>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* 2. Location Information */}
            <div>
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                2. Location Information
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">Country</Label>
                  <Select value={editMember.country} onValueChange={(value) => setEditMember(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">City / Region</Label>
                  <Input
                    value={editMember.city}
                    onChange={(e) => setEditMember(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Time Zone</Label>
                  <Select value={editMember.timezone} onValueChange={(value) => setEditMember(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select Time Zone" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Africa/Addis_Ababa">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* 3. Church / Faith Information */}
            <div>
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <Church className="h-4 w-4" />
                3. Church / Faith Information
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Denomination</Label>
                  <Select value={editMember.denomination} onValueChange={(value) => setEditMember(prev => ({ ...prev, denomination: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select Denomination" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="Baptist">Baptist</SelectItem>
                      <SelectItem value="Anglican">Anglican</SelectItem>
                      <SelectItem value="Lutheran">Lutheran</SelectItem>
                      <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="Methodist">Methodist</SelectItem>
                      <SelectItem value="Presbyterian">Presbyterian</SelectItem>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Non-denominational">Non-denominational</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Are you a Christian?</Label>
                  <Select value={editMember.faithStatus} onValueChange={(value) => setEditMember(prev => ({ ...prev, faithStatus: value }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="believer">Yes - I am a Christian</SelectItem>
                      <SelectItem value="exploring">Exploring Faith</SelectItem>
                      <SelectItem value="new_believer">New Believer</SelectItem>
                      <SelectItem value="seeker">Seeker / Curious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-slate-300">Local Church Name</Label>
                <Input
                  value={editMember.localChurch}
                  onChange={(e) => setEditMember(prev => ({ ...prev, localChurch: e.target.value }))}
                  placeholder="Grace Community Church"
                  className="bg-slate-800 border-slate-700 text-white mt-2"
                />
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* 4. Interests or Ministries */}
            <div>
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                4. Interests or Ministries
              </h4>
              <Label className="text-slate-300 text-sm">Select the areas of interest:</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {['Bible Study', 'Prayer Groups', 'Evangelism', 'Online Fellowship', 'Volunteering', 'Worship Team', 'Youth Ministry', 'Children Ministry'].map((interest) => (
                  <label key={interest} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editMember.interests.includes(interest)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditMember(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                        } else {
                          setEditMember(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-slate-300 text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* 5. Agreement and Consent */}
            <div>
              <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                5. Agreement and Consent
              </h4>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editMember.acceptedTerms}
                    onChange={(e) => setEditMember(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                    className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                  />
                  <span className="text-slate-300 text-sm">I accept the Terms of Use</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editMember.acceptedPrivacy}
                    onChange={(e) => setEditMember(prev => ({ ...prev, acceptedPrivacy: e.target.checked }))}
                    className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                  />
                  <span className="text-slate-300 text-sm">I accept the Privacy Policy</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editMember.acceptedStatementOfFaith}
                    onChange={(e) => setEditMember(prev => ({ ...prev, acceptedStatementOfFaith: e.target.checked }))}
                    className="h-4 w-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-amber-500"
                  />
                  <span className="text-slate-300 text-sm">I agree with the Statement of Faith</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditMember} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-amber-500/20 text-amber-400">
                  {selectedMember.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{selectedMember.name}</p>
                <p className="text-sm text-slate-400">{selectedMember.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteMember} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Events Content Component
function EventsContent({ events, formatDate }: { events: Event[]; formatDate: (date: string) => string }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventList, setEventList] = useState<Event[]>(events);
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => {
    setEventList(events);
  }, [events]);

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'SERVICE',
    startDate: '',
    startTime: '10:00',
    location: '',
    isOnline: false,
    capacity: '',
  });

  // Form state for edit event
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    type: 'SERVICE',
    startDate: '',
    location: '',
    isOnline: false,
    status: 'SCHEDULED',
  });

  const filteredEvents = filter === 'upcoming' 
    ? eventList.filter(e => new Date(e.startDate) >= new Date())
    : eventList;

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startDate) return;
    
    setIsSubmitting(true);
    try {
      const startDate = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          type: newEvent.type,
          startDate: startDate.toISOString(),
          location: newEvent.location,
          isOnline: newEvent.isOnline,
          capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
          isInPerson: !newEvent.isOnline,
        }),
      });
      
      if (res.ok) {
        const createdEvent = await res.json();
        setEventList(prev => [createdEvent, ...prev]);
        setNewEvent({ title: '', description: '', type: 'SERVICE', startDate: '', startTime: '10:00', location: '', isOnline: false, capacity: '' });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !editEvent.title) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEvent),
      });
      
      if (res.ok) {
        setEventList(prev => prev.map(e => 
          e.id === selectedEvent.id 
            ? { ...e, ...editEvent }
            : e
        ));
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error editing event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setEventList(prev => prev.filter(e => e.id !== selectedEvent.id));
        setIsDeleteDialogOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setEditEvent({
      title: event.title,
      description: '',
      type: event.type,
      startDate: event.startDate.split('T')[0],
      location: event.location || '',
      isOnline: event.isOnline,
      status: 'SCHEDULED',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            className={filter === 'upcoming' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('all')}
          >
            All Events
          </Button>
        </div>
        
        {/* Create Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill in the details for the new event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title" className="text-slate-300">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Sunday Worship Service"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-type" className="text-slate-300">Event Type</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                    <SelectItem value="PRAYER_MEETING">Prayer Meeting</SelectItem>
                    <SelectItem value="YOUTH_NIGHT">Youth Night</SelectItem>
                    <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="SPECIAL">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-date" className="text-slate-300">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time" className="text-slate-300">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location" className="text-slate-300">Location</Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Main Sanctuary or Online"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="event-online"
                    checked={newEvent.isOnline}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, isOnline: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                  />
                  <Label htmlFor="event-online" className="text-slate-300">Online Event</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-capacity" className="text-slate-300">Capacity (Optional)</Label>
                  <Input
                    id="event-capacity"
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="100"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-amber-500/20 text-amber-400">{event.type.replace('_', ' ')}</Badge>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{event.registrationCount}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuLabel className="text-slate-300">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => openViewDialog(event)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => openEditDialog(event)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                        onClick={() => openDeleteDialog(event)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">{event.title}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <Calendar className="h-4 w-4" />
                {formatDate(event.startDate)}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                {event.isOnline ? (
                  <>
                    <Globe className="h-4 w-4" />
                    Online Event
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    {event.location || 'TBD'}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">Create your first event to get started</p>
          </div>
        )}
      </div>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                  <Badge className="bg-amber-500/20 text-amber-400 mt-2">
                    {selectedEvent.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Users className="h-4 w-4" />
                    <span>{selectedEvent.registrationCount} registered</span>
                  </div>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedEvent.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="text-white flex items-center gap-2">
                    {selectedEvent.isOnline ? (
                      <>
                        <Globe className="h-4 w-4" />
                        Online
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        {selectedEvent.location || 'TBD'}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedEvent) openEditDialog(selectedEvent);
            }} className="bg-amber-500 hover:bg-amber-600 text-black">
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the event information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-event-title" className="text-slate-300">Event Title</Label>
              <Input
                id="edit-event-title"
                value={editEvent.title}
                onChange={(e) => setEditEvent(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-type" className="text-slate-300">Event Type</Label>
              <Select value={editEvent.type} onValueChange={(value) => setEditEvent(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                  <SelectItem value="PRAYER_MEETING">Prayer Meeting</SelectItem>
                  <SelectItem value="YOUTH_NIGHT">Youth Night</SelectItem>
                  <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-date" className="text-slate-300">Date</Label>
              <Input
                id="edit-event-date"
                type="date"
                value={editEvent.startDate}
                onChange={(e) => setEditEvent(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-event-location" className="text-slate-300">Location</Label>
              <Input
                id="edit-event-location"
                value={editEvent.location}
                onChange={(e) => setEditEvent(prev => ({ ...prev, location: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-event-online"
                checked={editEvent.isOnline}
                onChange={(e) => setEditEvent(prev => ({ ...prev, isOnline: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              <Label htmlFor="edit-event-online" className="text-slate-300">Online Event</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditEvent} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this event? This will also cancel all registrations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedEvent.title}</p>
                <p className="text-sm text-slate-400">{formatDate(selectedEvent.startDate)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteEvent} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sermon Series Content Component
function SeriesContent() {
  const { toast } = useToast();
  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<SermonSeries | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newSeries, setNewSeries] = useState({
    name: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
  });

  const [editSeries, setEditSeries] = useState({
    name: '',
    description: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sermon-series');
      const data = await res.json();
      if (Array.isArray(data)) setSeriesList(data);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSeries = async () => {
    if (!newSeries.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sermon-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeries),
      });
      if (res.ok) {
        const data = await res.json();
        setSeriesList(prev => [data, ...prev]);
        setIsCreateDialogOpen(false);
        setNewSeries({ name: '', description: '', imageUrl: '', startDate: '', endDate: '' });
        toast({ title: "Success", description: "Series created successfully" });
      } else {
        const error = await res.json();
        toast({ 
          title: "Error", 
          description: `${error.error || "Failed to create series"} ${error.details ? `(${error.details})` : ""}`, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred. Please check your connection.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSeries = async () => {
    if (!selectedSeries || !editSeries.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sermon-series/${selectedSeries.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSeries),
      });
      if (res.ok) {
        const data = await res.json();
        setSeriesList(prev => prev.map(s => s.id === selectedSeries.id ? data : s));
        setIsEditDialogOpen(false);
        toast({ title: "Success", description: "Series updated successfully" });
      } else {
        const error = await res.json();
        toast({ 
          title: "Error", 
          description: `${error.error || "Failed to update series"} ${error.details ? `(${error.details})` : ""}`, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during update.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!selectedSeries) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sermon-series/${selectedSeries.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSeriesList(prev => prev.filter(s => s.id !== selectedSeries.id));
        setIsDeleteDialogOpen(false);
        toast({ title: "Deleted", description: "Series removed successfully" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to delete series", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Sermon Series</h2>
          <p className="text-slate-400">Organize your sermons into series and collections</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create Series
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-4" />
          <p className="text-slate-400">Loading series...</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <Card key={series.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
              <CardHeader className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <FolderOpen className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        setSelectedSeries(series);
                        setEditSeries({
                          name: series.name,
                          description: series.description || '',
                          imageUrl: series.imageUrl || '',
                          startDate: series.startDate || '',
                          endDate: series.endDate || '',
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        setSelectedSeries(series);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-white text-lg group-hover:text-amber-500 transition-colors">{series.name}</CardTitle>
                <CardDescription className="text-slate-400 text-sm line-clamp-2 mt-2">
                  {series.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-amber-500/70" />
                    <span>{series._count?.sermons || 0} Sermons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-blue-500/70" />
                    <span>{new Date(series.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {seriesList.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
              <FolderOpen className="h-12 w-12 mx-auto text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-white">No series found</h3>
              <p className="text-slate-400 max-w-sm mx-auto mt-2">Create your first sermon series to organize your content better.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="mt-6 border-slate-700 hover:bg-slate-800">
                Create First Series
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Series</DialogTitle>
            <DialogDescription className="text-slate-400">Add a new collection for your sermons.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="series-name" className="text-slate-300">Name</Label>
              <Input 
                id="series-name"
                value={newSeries.name}
                onChange={(e) => setNewSeries(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. The Grace of God"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series-image" className="text-slate-300">Image URL</Label>
              <Input 
                id="series-image"
                value={newSeries.imageUrl}
                onChange={(e) => setNewSeries(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="series-description" className="text-slate-300">Description</Label>
              <textarea 
                id="series-description"
                value={newSeries.description}
                onChange={(e) => setNewSeries(prev => ({ ...prev, description: e.target.value }))}
                placeholder="About this series..."
                className="w-full bg-slate-800 border-slate-700 text-white rounded-md p-2 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleCreateSeries} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Series
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Series</DialogTitle>
            <DialogDescription className="text-slate-400">Update series details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-series-name" className="text-slate-300">Name</Label>
              <Input 
                id="edit-series-name"
                value={editSeries.name}
                onChange={(e) => setEditSeries(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-series-image" className="text-slate-300">Image URL</Label>
              <Input 
                id="edit-series-image"
                value={editSeries.imageUrl}
                onChange={(e) => setEditSeries(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-series-description" className="text-slate-300">Description</Label>
              <textarea 
                id="edit-series-description"
                value={editSeries.description}
                onChange={(e) => setEditSeries(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-800 border-slate-700 text-white rounded-md p-2 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleUpdateSeries} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Series?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="text-white font-medium">{selectedSeries?.name}</span>? 
              This will not delete the sermons in this series, but they will no longer be associated with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteSeries} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Series
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sermons Content Component
function SermonsContent({ sermons, formatDate }: { sermons: Sermon[]; formatDate: (date: string) => string }) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sermonList, setSermonList] = useState<Sermon[]>(sermons);
  const [filter, setFilter] = useState<'popular' | 'recent' | 'all'>('recent');
  
  // Media Picker states
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
  const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState(false);
  const [isEditVideoPickerOpen, setIsEditVideoPickerOpen] = useState(false);
  const [isEditAudioPickerOpen, setIsEditAudioPickerOpen] = useState(false);
  const [isEditThumbnailPickerOpen, setIsEditThumbnailPickerOpen] = useState(false);
  const [seriesOptions, setSeriesOptions] = useState<SermonSeries[]>([]);

  useEffect(() => {
    fetchSermons();
    fetchSeries();
  }, [filter]);

  const fetchSermons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sermons?limit=100`);
      const data = await res.json();
      if (Array.isArray(data)) setSermonList(data);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/sermon-series');
      const data = await res.json();
      if (Array.isArray(data)) setSeriesOptions(data);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  // Form state for new sermon
  const [newSermon, setNewSermon] = useState({
    title: '',
    description: '',
    speakerName: '',
    scripture: '',
    videoUrl: '',
    audioUrl: '',
    thumbnailUrl: '',
    duration: '',
    seriesId: '',
    tags: '',
    isFeatured: false,
  });

  // Form state for edit sermon
  const [editSermon, setEditSermon] = useState({
    title: '',
    description: '',
    speakerName: '',
    scripture: '',
    videoUrl: '',
    audioUrl: '',
    thumbnailUrl: '',
    duration: '',
    seriesId: '',
    tags: '',
    isFeatured: false,
  });

  const sortedSermons = sermonList.sort((a, b) => {
    if (filter === 'popular') return b.viewCount - a.viewCount;
    if (filter === 'recent') {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const handleCreateSermon = async () => {
    if (!newSermon.title || !newSermon.speakerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title and Speaker).",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSermon,
          publishedAt: new Date().toISOString(),
        }),
      });
      
      const data = await res.json();

      if (res.ok) {
        // Refresh local list
        setSermonList(prev => [data, ...prev]);
        setNewSermon({
          title: '', description: '', speakerName: '', scripture: '',
          videoUrl: '', audioUrl: '', thumbnailUrl: '', duration: '',
          seriesId: '', tags: '', isFeatured: false
        });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Sermon created successfully.",
        });
      } else {
        toast({
          title: "Create Failed",
          description: `${data.error || "Failed to create sermon."} ${data.details ? `(${data.details})` : ""}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error creating sermon:', error);
      toast({
        title: "Network Error",
        description: "An unexpected error occurred. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSermon = async () => {
    if (!selectedSermon || !editSermon.title) {
      toast({
        title: "Error",
        description: "Sermon title is required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sermons/${selectedSermon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSermon),
      });
      
      const data = await res.json();

      if (res.ok) {
        setSermonList(prev => prev.map(s => 
          s.id === selectedSermon.id ? data : s
        ));
        setIsEditDialogOpen(false);
        setSelectedSermon(null);
        toast({
          title: "Success",
          description: "Sermon updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: `${data.error || "Failed to update sermon."} ${data.details ? `(${data.details})` : ""}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error editing sermon:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during update.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSermon = async () => {
    if (!selectedSermon) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sermons/${selectedSermon.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setSermonList(prev => prev.filter(s => s.id !== selectedSermon.id));
        setIsDeleteDialogOpen(false);
        setSelectedSermon(null);
        toast({
          title: "Success",
          description: "Sermon deleted successfully.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete sermon.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setEditSermon({
      title: sermon.title,
      description: sermon.description || '',
      speakerName: sermon.speakerName,
      scripture: sermon.scripture || '',
      videoUrl: sermon.videoUrl || '',
      audioUrl: sermon.audioUrl || '',
      thumbnailUrl: sermon.thumbnailUrl || '',
      duration: sermon.duration?.toString() || '',
      seriesId: sermon.seriesId || '',
      isFeatured: sermon.isFeatured || false,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant={filter === 'recent' ? 'default' : 'outline'}
            className={filter === 'recent' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            onClick={() => setFilter('recent')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </Button>
          <Button 
            variant={filter === 'popular' ? 'default' : 'outline'}
            className={filter === 'popular' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            onClick={() => setFilter('popular')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Filter sermons..." 
              className="pl-10 w-64 bg-slate-900 border-slate-800 text-white"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                New Sermon
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Sermon</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in the details to publish a new sermon message.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sermon-title" className="text-slate-300">Sermon Title *</Label>
                    <Input
                      id="sermon-title"
                      value={newSermon.title}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. The Power of Grace"
                      className="bg-slate-800 border-slate-700 text-white focus:border-amber-500/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sermon-speaker" className="text-slate-300">Speaker Name *</Label>
                    <Input
                      id="sermon-speaker"
                      value={newSermon.speakerName}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, speakerName: e.target.value }))}
                      placeholder="e.g. Pastor Davids"
                      className="bg-slate-800 border-slate-700 text-white focus:border-amber-500/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sermon-scripture" className="text-slate-300">Scripture Reference</Label>
                    <Input
                      id="sermon-scripture"
                      value={newSermon.scripture}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, scripture: e.target.value }))}
                      placeholder="e.g. Romans 8:1-4"
                      className="bg-slate-800 border-slate-700 text-white focus:border-amber-500/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sermon-series" className="text-slate-300">Sermon Series</Label>
                    <Select 
                      value={newSermon.seriesId || 'none'} 
                      onValueChange={(val) => setNewSermon(prev => ({ ...prev, seriesId: val === 'none' ? '' : val }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select a series" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="none">No Series</SelectItem>
                        {seriesOptions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sermon-description" className="text-slate-300">Short Description</Label>
                    <textarea
                      id="sermon-description"
                      value={newSermon.description}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Summary of the message..."
                      className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Thumbnail Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSermon.thumbnailUrl}
                        onChange={(e) => setNewSermon(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                        placeholder="Image URL..."
                        className="bg-slate-800 border-slate-700 text-white flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="border-slate-700 text-slate-300 shrink-0"
                        onClick={() => setIsThumbnailPickerOpen(true)}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-slate-300">Media Files (Video/Audio)</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newSermon.videoUrl}
                          onChange={(e) => setNewSermon(prev => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="Video URL (YouTube/MP4)..."
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                        <Button variant="outline" size="sm" className="border-slate-700 text-xs text-slate-300" onClick={() => setIsVideoPickerOpen(true)}>
                          Pick
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSermon.audioUrl}
                          onChange={(e) => setNewSermon(prev => ({ ...prev, audioUrl: e.target.value }))}
                          placeholder="Audio URL (MP3)..."
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                        <Button variant="outline" size="sm" className="border-slate-700 text-xs text-slate-300" onClick={() => setIsAudioPickerOpen(true)}>
                          Pick
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sermon-duration" className="text-slate-300">Duration (min)</Label>
                      <Input
                        id="sermon-duration"
                        value={newSermon.duration}
                        onChange={(e) => setNewSermon(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g. 45"
                        type="number"
                        className="bg-slate-800 border-slate-700 text-white focus:border-amber-500/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sermon-tags" className="text-slate-300">Tags</Label>
                      <Input
                        id="sermon-tags"
                        value={newSermon.tags}
                        onChange={(e) => setNewSermon(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="grace, faith"
                        className="bg-slate-800 border-slate-700 text-white focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox 
                      id="isFeatured" 
                      checked={newSermon.isFeatured}
                      onCheckedChange={(checked) => setNewSermon(prev => ({ ...prev, isFeatured: !!checked }))}
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium leading-none text-slate-300 cursor-pointer">
                      Feature this sermon on homepage
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6 border-t border-slate-800 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button onClick={handleCreateSermon} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black px-8">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Sermon
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedSermons.map((sermon) => (
          <Card key={sermon.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-amber-500/30 transition-all duration-300 flex flex-col">
            <div className="relative aspect-video bg-slate-800 overflow-hidden">
              {sermon.thumbnailUrl ? (
                <img 
                  src={sermon.thumbnailUrl} 
                  alt={sermon.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <PlayIcon className="h-12 w-12 text-slate-700" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {sermon.isFeatured && (
                  <Badge className="bg-amber-500 text-black font-semibold">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="icon" variant="secondary" className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 border-none" onClick={() => openViewDialog(sermon)}>
                  <Eye className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{sermon.title}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <UserCircle className="h-3 w-3 text-amber-500" />
                  {sermon.speakerName}
                </p>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
                <div className="flex gap-4">
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                    <Video className="h-3 w-3 text-blue-400" />
                    {sermon.viewCount}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                    <Download className="h-3 w-3 text-emerald-400" />
                    {sermon.downloadCount || 0}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => openEditDialog(sermon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/50 hover:text-red-500" onClick={() => openDeleteDialog(sermon)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedSermons.length === 0 && (
          <Card className="col-span-full bg-slate-900 border-slate-800 border-dashed p-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-16 w-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-white">No Sermons Found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Start adding your sermons to build your library and reach your congregation.
            </p>
            <Button className="mt-6 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={() => setIsCreateDialogOpen(true)}>
              Add Your First Sermon
            </Button>
          </Card>
        )}
      </div>

      {/* View Sermon Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
          </DialogHeader>
          {selectedSermon && (
            <div className="space-y-6">
              <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-2xl relative">
                {selectedSermon.videoUrl ? (
                  <div className="absolute inset-0 bg-black flex items-center justify-center group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayIcon className="h-8 w-8 text-black fill-current" />
                    </div>
                    {selectedSermon.thumbnailUrl && (
                       <img src={selectedSermon.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                    )}
                  </div>
                ) : selectedSermon.thumbnailUrl ? (
                  <img src={selectedSermon.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Video className="h-16 w-16 text-slate-700" />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{selectedSermon.title}</h2>
                    <p className="text-amber-500 font-medium">with {selectedSermon.speakerName}</p>
                  </div>
                  
                  {selectedSermon.scripture && (
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">SCRIPTURE</p>
                      <p className="text-slate-300 italic">{selectedSermon.scripture}</p>
                    </div>
                  )}
                  
                  <div className="text-slate-400 text-sm leading-relaxed">
                    {selectedSermon.description || "No description provided for this sermon message."}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Views</span>
                      <span className="text-white font-bold">{selectedSermon.viewCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Downloads</span>
                      <span className="text-white font-bold">{selectedSermon.downloadCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">Published</span>
                      <span className="text-white font-bold">{selectedSermon.publishedAt ? formatDate(selectedSermon.publishedAt) : 'Draft'}</span>
                    </div>
                    <Separator className="bg-slate-800" />
                    <div className="space-y-2">
                       {selectedSermon.videoUrl && (
                         <Button variant="outline" className="w-full justify-start text-xs border-slate-800 hover:bg-slate-800" asChild>
                           <a href={selectedSermon.videoUrl} target="_blank" rel="noreferrer">
                             <MonitorPlay className="h-3 w-3 mr-2 text-blue-400" />
                             Play Video
                           </a>
                         </Button>
                       )}
                       {selectedSermon.audioUrl && (
                         <Button variant="outline" className="w-full justify-start text-xs border-slate-800 hover:bg-slate-800" asChild>
                           <a href={selectedSermon.audioUrl} target="_blank" rel="noreferrer">
                             <Music className="h-3 w-3 mr-2 text-emerald-400" />
                             Play Audio
                           </a>
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-slate-800 pt-4 gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedSermon) openEditDialog(selectedSermon);
            }} className="bg-amber-500 hover:bg-amber-600 text-black">
              Edit Sermon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sermon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sermon Message</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the details for this published message.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title" className="text-slate-300">Sermon Title</Label>
                  <Input
                    id="edit-title"
                    value={editSermon.title}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-speaker" className="text-slate-300">Speaker Name</Label>
                  <Input
                    id="edit-speaker"
                    value={editSermon.speakerName}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, speakerName: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-scripture" className="text-slate-300">Scripture Reference</Label>
                  <Input
                    id="edit-scripture"
                    value={editSermon.scripture}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, scripture: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-series" className="text-slate-300">Sermon Series</Label>
                  <Select 
                    value={editSermon.seriesId || 'none'} 
                    onValueChange={(val) => setEditSermon(prev => ({ ...prev, seriesId: val === 'none' ? '' : val }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select a series" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="none">No Series</SelectItem>
                      {seriesOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
                  <textarea
                    id="edit-description"
                    value={editSermon.description}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, description: e.target.value }))}
                    className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-slate-300 text-xs">Media Links</Label>
                <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={editSermon.thumbnailUrl}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    placeholder="Thumbnail URL..."
                    className="bg-slate-800 border-slate-700 text-white text-xs border-r-0 rounded-r-none"
                  />
                  <Button variant="outline" size="sm" className="border-slate-700 text-xs text-slate-300 rounded-l-none" onClick={() => setIsEditThumbnailPickerOpen(true)}>
                    Pick
                  </Button>
                </div>
                  <div className="flex gap-2">
                    <Input
                      value={editSermon.videoUrl}
                      onChange={(e) => setEditSermon(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Video URL..."
                      className="bg-slate-800 border-slate-700 text-white text-xs border-r-0 rounded-r-none"
                    />
                    <Button variant="outline" size="sm" className="border-slate-700 text-xs text-slate-300 rounded-l-none" onClick={() => setIsEditVideoPickerOpen(true)}>
                      Pick
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={editSermon.audioUrl}
                      onChange={(e) => setEditSermon(prev => ({ ...prev, audioUrl: e.target.value }))}
                      placeholder="Audio URL..."
                      className="bg-slate-800 border-slate-700 text-white text-xs border-r-0 rounded-r-none"
                    />
                    <Button variant="outline" size="sm" className="border-slate-700 text-xs text-slate-300 rounded-l-none" onClick={() => setIsEditAudioPickerOpen(true)}>
                      Pick
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-duration" className="text-slate-300">Duration (min)</Label>
                <Input
                  id="edit-duration"
                  value={editSermon.duration}
                  onChange={(e) => setEditSermon(prev => ({ ...prev, duration: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox 
                  id="edit-isFeatured" 
                  checked={editSermon.isFeatured}
                  onCheckedChange={(checked) => setEditSermon(prev => ({ ...prev, isFeatured: !!checked }))}
                />
                <label htmlFor="edit-isFeatured" className="text-sm font-medium leading-none text-slate-300 cursor-pointer">
                  Featured Sermon
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 border-t border-slate-800 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditSermon} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Sermon Permanently?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this sermon? This will also remove all notes and bookmarks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSermon && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedSermon.title}</p>
                <p className="text-sm text-slate-400">by {selectedSermon.speakerName}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteSermon} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Sermon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Pickers for Create Dialog */}
      <MediaPicker
        open={isVideoPickerOpen}
        onClose={() => setIsVideoPickerOpen(false)}
        onSelect={(url) => setNewSermon(prev => ({ ...prev, videoUrl: url }))}
        typeFilter="video"
      />
      <MediaPicker
        open={isAudioPickerOpen}
        onClose={() => setIsAudioPickerOpen(false)}
        onSelect={(url) => setNewSermon(prev => ({ ...prev, audioUrl: url }))}
        typeFilter="audio"
      />

      {/* Media Pickers for Edit Dialog */}
      <MediaPicker
        open={isEditVideoPickerOpen}
        onClose={() => setIsEditVideoPickerOpen(false)}
        onSelect={(url) => setEditSermon(prev => ({ ...prev, videoUrl: url }))}
        typeFilter="video"
      />
      <MediaPicker
        open={isEditAudioPickerOpen}
        onClose={() => setIsEditAudioPickerOpen(false)}
        onSelect={(url) => setEditSermon(prev => ({ ...prev, audioUrl: url }))}
        typeFilter="audio"
      />
      <MediaPicker
        open={isThumbnailPickerOpen}
        onClose={() => setIsThumbnailPickerOpen(false)}
        onSelect={(url) => setNewSermon(prev => ({ ...prev, thumbnailUrl: url }))}
        typeFilter="image"
      />
      <MediaPicker
        open={isEditThumbnailPickerOpen}
        onClose={() => setIsEditThumbnailPickerOpen(false)}
        onSelect={(url) => setEditSermon(prev => ({ ...prev, thumbnailUrl: url }))}
        typeFilter="image"
      />
    </div>
  );
}

// Donations Content Component
function DonationsContent({ donations, stats, charts, formatDate, formatCurrency }: {
  donations: Donation[];
  stats: DashboardStats;
  charts: ChartData;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">This Month</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyGiving)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">Total Raised</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalDonationAmount)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">Total Donations</p>
            <p className="text-2xl font-bold text-white">{stats.totalDonations}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">Average Gift</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(stats.totalDonations > 0 ? stats.monthlyGiving / stats.totalDonations : 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Donations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left text-slate-400 font-medium px-6 py-4">Donor</th>
                <th className="text-left text-slate-400 font-medium px-6 py-4">Amount</th>
                <th className="text-left text-slate-400 font-medium px-6 py-4">Type</th>
                <th className="text-left text-slate-400 font-medium px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4 text-white font-medium">
                    {donation.donorName || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-semibold">{formatCurrency(donation.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={donation.isRecurring ? "border-purple-500 text-purple-400" : "border-slate-600 text-slate-300"}>
                      {donation.isRecurring ? 'Recurring' : 'One-time'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(donation.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// Campaign interface
interface Campaign {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  goal: number | null;
  raised: number;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  donationTotal?: number;
  donationCount?: number;
}

// Campaigns Content Component
function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    slug: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    isActive: true,
  });

  const [editCampaign, setEditCampaign] = useState({
    name: '',
    slug: '',
    description: '',
    goal: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    isActive: true,
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/campaigns?stats=true');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'active') return c.isActive;
    if (filter === 'inactive') return !c.isActive;
    return true;
  });

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      
      if (res.ok) {
        const created = await res.json();
        setCampaigns(prev => [created, ...prev]);
        setNewCampaign({ name: '', description: '', goal: '', startDate: '', endDate: '', imageUrl: '', isActive: true });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCampaign = async () => {
    if (!selectedCampaign || !editCampaign.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCampaign),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? updated : c));
        setIsEditDialogOpen(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Error editing campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.campaign) {
          // Campaign was marked as inactive
          setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, isActive: false } : c));
        } else {
          // Campaign was deleted
          setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
        }
        setIsDeleteDialogOpen(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditCampaign({
      name: campaign.name,
      slug: campaign.slug || '',
      description: campaign.description || '',
      goal: campaign.goal?.toString() || '',
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      imageUrl: campaign.imageUrl || '',
      isActive: campaign.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = async (campaign: Campaign) => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCampaign(data);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };

  const openDeleteDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getProgressPercentage = (campaign: Campaign) => {
    if (!campaign.goal || campaign.goal === 0) return 0;
    const raised = campaign.donationTotal || campaign.raised || 0;
    return Math.min(100, Math.round((raised / campaign.goal) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'}
            className={filter === 'active' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'default' : 'outline'}
            className={filter === 'inactive' ? 'bg-slate-600 text-white hover:bg-slate-700' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </Button>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription className="text-slate-400">
                Set up a new fundraising campaign for your church.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Campaign Name *</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCampaign(prev => ({ 
                      ...prev, 
                      name,
                      slug: prev.slug || generateSlug(name)
                    }));
                  }}
                  placeholder="Building Fund"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm shrink-0">/campaign/</span>
                  <Input
                    value={newCampaign.slug}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="building-fund"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <p className="text-xs text-slate-500">This is the URL for your campaign page</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Description</Label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the campaign purpose..."
                  className="bg-slate-800 border-slate-700 text-white rounded-md p-3 min-h-[80px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Goal Amount</Label>
                  <Input
                    type="number"
                    value={newCampaign.goal}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="50000"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Status</Label>
                  <Select 
                    value={newCampaign.isActive ? 'active' : 'inactive'} 
                    onValueChange={(v) => setNewCampaign(prev => ({ ...prev, isActive: v === 'active' }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Start Date</Label>
                  <Input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">End Date</Label>
                  <Input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Image URL (Optional)</Label>
                <Input
                  value={newCampaign.imageUrl}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Found</h3>
            <p className="text-slate-400 mb-4">
              {filter === 'all' 
                ? 'Create your first fundraising campaign to get started.'
                : `No ${filter} campaigns at the moment.`}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className={cn(
              "bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition group",
              !campaign.isActive && "opacity-60"
            )}>
              {campaign.imageUrl && (
                <div className="h-32 w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={campaign.imageUrl} 
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{campaign.name}</CardTitle>
                    <Badge className={cn(
                      "mt-2",
                      campaign.isActive 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-500/20 text-slate-400"
                    )}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuLabel className="text-slate-300">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => openViewDialog(campaign)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => openEditDialog(campaign)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Campaign
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                        onClick={() => openDeleteDialog(campaign)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">{campaign.description}</p>
                )}
                
                {/* Progress Bar */}
                {campaign.goal && campaign.goal > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{getProgressPercentage(campaign)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(campaign)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Raised: {formatCurrency(campaign.donationTotal || campaign.raised || 0)}</span>
                      <span>Goal: {formatCurrency(campaign.goal)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Gift className="h-4 w-4" />
                    <span>{campaign.donationCount || 0} donations</span>
                  </div>
                  <div className="text-slate-400">
                    {campaign.startDate && campaign.endDate 
                      ? `${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}`
                      : campaign.startDate 
                        ? `Starts ${formatDate(campaign.startDate)}`
                        : 'Ongoing'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Campaign Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              {selectedCampaign.imageUrl && (
                <img 
                  src={selectedCampaign.imageUrl} 
                  alt={selectedCampaign.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{selectedCampaign.name}</h3>
                <Badge className={cn(
                  "mt-2",
                  selectedCampaign.isActive 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-slate-500/20 text-slate-400"
                )}>
                  {selectedCampaign.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {selectedCampaign.description && (
                <p className="text-slate-400">{selectedCampaign.description}</p>
              )}
              <Separator className="bg-slate-800" />
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Goal</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedCampaign.goal ? formatCurrency(selectedCampaign.goal) : 'No Goal Set'}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Raised</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(selectedCampaign.donationTotal || selectedCampaign.raised || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Start Date</p>
                  <p className="text-white">{formatDate(selectedCampaign.startDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400">End Date</p>
                  <p className="text-white">{formatDate(selectedCampaign.endDate)}</p>
                </div>
              </div>

              {/* Recent Donations */}
              {(selectedCampaign as Campaign & { recentDonations?: Array<{ id: string; amount: number; donorName: string | null; createdAt: string; isAnonymous: boolean }> }).recentDonations && (
                <div>
                  <h4 className="text-white font-medium mb-2">Recent Donations</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {(selectedCampaign as Campaign & { recentDonations?: Array<{ id: string; amount: number; donorName: string | null; createdAt: string; isAnonymous: boolean }> }).recentDonations?.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-white">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Anonymous'}
                          </span>
                          <span className="text-emerald-400 font-medium">{formatCurrency(donation.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedCampaign) openEditDialog(selectedCampaign);
              }} 
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Edit Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the campaign information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Campaign Name *</Label>
              <Input
                value={editCampaign.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditCampaign(prev => ({ 
                    ...prev, 
                    name,
                    slug: prev.slug || generateSlug(name)
                  }));
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm shrink-0">/campaign/</span>
                <Input
                  value={editCampaign.slug}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, slug: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Description</Label>
              <textarea
                value={editCampaign.description}
                onChange={(e) => setEditCampaign(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white rounded-md p-3 min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Goal Amount</Label>
                <Input
                  type="number"
                  value={editCampaign.goal}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, goal: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Status</Label>
                <Select 
                  value={editCampaign.isActive ? 'active' : 'inactive'} 
                  onValueChange={(v) => setEditCampaign(prev => ({ ...prev, isActive: v === 'active' }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input
                  type="date"
                  value={editCampaign.startDate}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">End Date</Label>
                <Input
                  type="date"
                  value={editCampaign.endDate}
                  onChange={(e) => setEditCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Image URL</Label>
              <Input
                value={editCampaign.imageUrl}
                onChange={(e) => setEditCampaign(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditCampaign} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this campaign? If there are donations associated with it, it will be marked as inactive instead.
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedCampaign.name}</p>
                <p className="text-sm text-slate-400">
                  {selectedCampaign.donationCount || 0} donations
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteCampaign} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prayer Request interface
interface PrayerRequest {
  id: string;
  title: string;
  request: string;
  isPublic: boolean;
  isUrgent: boolean;
  status: string;
  prayerCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  responses?: Array<{
    id: string;
    message: string;
    responderName: string | null;
    createdAt: string;
  }>;
}

// Prayers Content Component
function PrayersContent({ charts, stats, user }: { charts: ChartData; stats: DashboardStats; user: { id: string; role: string; name?: string | null } | null }) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'ANSWERED'>('all');
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, [filter]);

  const fetchPrayers = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      
      // ALWAYS pass userId - the API will determine role and return appropriate prayers
      // Admins/Pastors will see ALL prayers, regular users only see their own
      params.append('userId', user.id);
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const res = await fetch(`/api/prayers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPrayers(data);
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (prayerId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/prayers/${prayerId}?userId=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setPrayers(prev => prev.map(p => 
          p.id === prayerId ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Error updating prayer status:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedPrayer || !replyMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prayers/${selectedPrayer.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          message: replyMessage,
          responderName: user?.name || 'Prayer Team',
          isPublic: false,
        }),
      });
      
      if (res.ok) {
        const newResponse = await res.json();
        setPrayers(prev => prev.map(p => 
          p.id === selectedPrayer.id 
            ? { 
                ...p, 
                responses: [newResponse, ...(p.responses || [])],
                status: p.status === 'PENDING' ? 'IN_PROGRESS' : p.status,
                prayerCount: p.prayerCount + 1
              } 
            : p
        ));
        setReplyMessage('');
        setIsReplyDialogOpen(false);
        setSelectedPrayer(null);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewDialog = async (prayer: PrayerRequest) => {
    try {
      const res = await fetch(`/api/prayers/${prayer.id}?userId=${user?.id}`);
      if (res.ok) {
        const fullPrayer = await res.json();
        setSelectedPrayer(fullPrayer);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching prayer details:', error);
    }
  };

  const openReplyDialog = (prayer: PrayerRequest) => {
    setSelectedPrayer(prayer);
    setReplyMessage('');
    setIsReplyDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ANSWERED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ARCHIVED': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredPrayers = filter === 'all' 
    ? prayers 
    : prayers.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={cn("cursor-pointer transition-all bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50", filter === 'PENDING' ? "ring-2 ring-amber-500 border-amber-500" : "")}
          onClick={() => setFilter(filter === 'PENDING' ? 'all' : 'PENDING')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pendingPrayers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50", filter === 'IN_PROGRESS' ? "ring-2 ring-blue-500 border-blue-500" : "")}
          onClick={() => setFilter(filter === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white mt-1">{prayers.filter(p => p.status === 'IN_PROGRESS').length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/50", filter === 'ANSWERED' ? "ring-2 ring-emerald-500 border-emerald-500" : "")}
          onClick={() => setFilter(filter === 'ANSWERED' ? 'all' : 'ANSWERED')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm font-medium">Answered</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.answeredPrayers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Total Prayers</p>
                <p className="text-3xl font-bold text-white mt-1">{prayers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Requests Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Prayer Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-slate-700 text-slate-300'}
              >
                All
              </Button>
              <Button 
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('PENDING')}
                className={filter === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-slate-700 text-slate-300'}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Heart className="h-12 w-12 mb-4 opacity-50" />
              <p>No prayer requests found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-slate-800">
                {filteredPrayers.map((prayer) => (
                  <div key={prayer.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(prayer.status)}>
                            {prayer.status.replace('_', ' ')}
                          </Badge>
                          {prayer.isUrgent && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              Urgent
                            </Badge>
                          )}
                          {!prayer.isPublic && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              Private
                            </Badge>
                          )}
                          <span className="text-slate-500 text-xs">{formatDate(prayer.createdAt)}</span>
                        </div>
                        <h4 className="text-white font-medium mb-1 truncate">{prayer.title}</h4>
                        <p className="text-slate-400 text-sm line-clamp-2">{prayer.request}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {prayer.user.name || prayer.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {prayer.prayerCount} prayers
                          </span>
                          {prayer.responses && prayer.responses.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {prayer.responses.length} replies
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReplyDialog(prayer)}
                          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => openViewDialog(prayer)} className="text-slate-300 hover:bg-slate-700">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(prayer.id, 'IN_PROGRESS')}
                              className="text-blue-400 hover:bg-slate-700"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(prayer.id, 'ANSWERED')}
                              className="text-emerald-400 hover:bg-slate-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Answered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(prayer.id, 'ARCHIVED')}
                              className="text-slate-400 hover:bg-slate-700"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* View Prayer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedPrayer?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Submitted by {selectedPrayer?.user.name || selectedPrayer?.user.email} • {selectedPrayer && formatDate(selectedPrayer.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50">
              <p className="text-slate-300">{selectedPrayer?.request}</p>
            </div>
            
            {selectedPrayer?.responses && selectedPrayer.responses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Responses ({selectedPrayer.responses.length})</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {selectedPrayer.responses.map((response) => (
                      <div key={response.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-amber-400">{response.responderName || 'Anonymous'}</span>
                          <span className="text-xs text-slate-500">{formatDate(response.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedPrayer) openReplyDialog(selectedPrayer);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reply to Prayer Request</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your response will be sent to {selectedPrayer?.user.name || selectedPrayer?.user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-400 font-medium mb-1">{selectedPrayer?.title}</p>
              <p className="text-sm text-slate-300 line-clamp-3">{selectedPrayer?.request}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Your Response</Label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your prayer response, encouragement, or update..."
                className="w-full h-32 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReplyDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReply}
              disabled={!replyMessage.trim() || isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Groups Content Component
function GroupsContent({ initialGroups }: { initialGroups: SmallGroup[] }) {
  const [groups, setGroups] = useState<SmallGroup[]>(initialGroups);
  const [membersData, setMembersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SmallGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'suggestions' | 'analytics'>('groups');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const interestOptions = [
    'Prayer Ministry', 'Worship / Music', 'Media Support', 
    'Evangelism', 'Bible Teaching', 'Administration',
    'Follow-up', 'Intercession', 'Communication',
    'Cell Fellowship', 'Need guidance'
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Nigeria', 'Kenya', 'Ethiopia', 'South Africa', 'Other'
  ];

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'General',
    location: '',
    meetingDay: 'Sunday',
    meetingTime: '10:00',
    maxMembers: '20',
    imageUrl: '',
    country: '',
    city: '',
    timezone: 'UTC',
    denomination: '',
    faithStatus: '',
    localChurch: '',
    interests: [] as string[]
  });

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembersData = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await fetch('/api/users?role=MEMBER');
      if (res.ok) {
        const data = await res.json();
        setMembersData(data.filter((u: any) => u.dataConsent === true));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMembersData();
  }, []);

  const getAnalytics = () => {
    const analytics = {
      byLocation: {} as Record<string, number>,
      byInterest: {} as Record<string, number>,
      byGrowthArea: {} as Record<string, number>,
      byFaithStatus: {} as Record<string, number>,
      needsMentorship: 0,
      needsContact: 0,
      totalCompletedProfiles: membersData.length
    };

    membersData.forEach(member => {
      if (member.country) {
        analytics.byLocation[member.country] = (analytics.byLocation[member.country] || 0) + 1;
      }
      if (member.ministryInterests) {
        member.ministryInterests.split(',').forEach((interest: string) => {
          const trimmed = interest.trim();
          if (trimmed) {
            analytics.byInterest[trimmed] = (analytics.byInterest[trimmed] || 0) + 1;
          }
        });
      }
      if (member.spiritualGrowthArea) {
        analytics.byGrowthArea[member.spiritualGrowthArea] = (analytics.byGrowthArea[member.spiritualGrowthArea] || 0) + 1;
      }
      if (member.faithStatusDetail) {
        analytics.byFaithStatus[member.faithStatusDetail] = (analytics.byFaithStatus[member.faithStatusDetail] || 0) + 1;
      }
      if (member.mentorshipInterest) analytics.needsMentorship++;
      if (member.contactPreference) analytics.needsContact++;
    });

    return analytics;
  };

  const getSuggestedGroups = () => {
    const suggestions: any[] = [];
    const analytics = getAnalytics();

    Object.entries(analytics.byInterest)
      .filter(([_, count]) => (count as number) >= 2)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10)
      .forEach(([interest, count]) => {
        const matchingMembers = membersData.filter(m => 
          m.ministryInterests?.includes(interest)
        );
        suggestions.push({
          type: 'interest',
          name: `${interest} Group`,
          interest,
          memberCount: count,
          matchingMembers,
          suggestedDay: 'Sunday',
          suggestedTime: '10:00',
          priority: 'high' as const
        });
      });

    Object.entries(analytics.byLocation)
      .filter(([_, count]) => (count as number) >= 3)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .forEach(([location, count]) => {
        const matchingMembers = membersData.filter(m => m.country === location);
        suggestions.push({
          type: 'location',
          name: `${location} Fellowship`,
          location,
          memberCount: count,
          matchingMembers,
          suggestedDay: 'Sunday',
          suggestedTime: '14:00',
          priority: 'medium' as const
        });
      });

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleCreateGroup = async () => {
    if (!form.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchGroups();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFromSuggestion = async (suggestion: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestion.name,
          description: `Group based on ${suggestion.type}: ${suggestion.interest || suggestion.location || 'member data'}`,
          type: suggestion.type === 'interest' ? 'Ministry' : 'General',
          country: suggestion.location || '',
          meetingDay: suggestion.suggestedDay || 'Sunday',
          meetingTime: suggestion.suggestedTime || '10:00',
          maxMembers: '30',
          interests: suggestion.interest ? [suggestion.interest] : [],
        })
      });
      if (res.ok) {
        await fetchGroups();
        setActiveTab('groups');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !form.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchGroups();
        setIsEditDialogOpen(false);
        setSelectedGroup(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    setIsSubmitting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchGroups();
        setIsDeleteDialogOpen(false);
        setSelectedGroup(null);
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setDeleteError('Failed to delete group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', type: 'General', location: '',
      meetingDay: 'Sunday', meetingTime: '10:00', maxMembers: '20', imageUrl: '',
      country: '', city: '', timezone: 'UTC', denomination: '',
      faithStatus: '', localChurch: '', interests: []
    });
  };

  const openEditDialog = (group: SmallGroup) => {
    setSelectedGroup(group);
    setForm({
      name: group.name,
      description: group.description || '',
      type: group.type || 'General',
      location: group.location || '',
      meetingDay: group.meetingDay || 'Sunday',
      meetingTime: group.meetingTime || '10:00',
      maxMembers: group.maxMembers?.toString() || '20',
      imageUrl: group.imageUrl || '',
      country: group.country || '',
      city: group.city || '',
      timezone: group.timezone || 'UTC',
      denomination: group.denomination || '',
      faithStatus: group.faithStatus || '',
      localChurch: group.localChurch || '',
      interests: group.interests ? group.interests.split(',') : []
    });
    setIsEditDialogOpen(true);
  };

  const openViewMembers = (group: SmallGroup) => {
    setSelectedGroup(group);
    setIsViewMembersOpen(true);
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const analytics = getAnalytics();
  const suggestions = getSuggestedGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Small Groups</h2>
          <p className="text-slate-400 text-sm">Manage groups based on member ministry data</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('analytics')}
            className={`border-slate-700 ${activeTab === 'analytics' ? 'bg-amber-500/10 text-amber-500 border-amber-500/50' : 'text-slate-300'}`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('suggestions')}
            className={`border-slate-700 ${activeTab === 'suggestions' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' : 'text-slate-300'}`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Suggestions ({suggestions.length})
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-white">Create New Small Group</DialogTitle>
                <DialogDescription className="text-slate-400">Define a new group with location, faith profile, and focus areas.</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4 pb-10 custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Info className="h-4 w-4" /> Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Group Name *</Label>
                        <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Downtown Bible Study" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Category / Type</Label>
                        <Select value={form.type} onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Bible Study">Bible Study</SelectItem>
                            <SelectItem value="Youth">Youth</SelectItem>
                            <SelectItem value="Interests">Interests</SelectItem>
                            <SelectItem value="Ministry">Ministry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full min-h-[80px] rounded-md bg-slate-800 border border-slate-700 p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none" placeholder="What is this group about?" />
                    </div>
                  </div>
                  <Separator className="bg-slate-800" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Country</Label>
                        <Select value={form.country} onValueChange={(v) => setForm(prev => ({ ...prev, country: v }))}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select Country" /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">City / Region</Label>
                        <Input value={form.city} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Addis Ababa" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Time Zone</Label>
                        <Select value={form.timezone} onValueChange={(v) => setForm(prev => ({ ...prev, timezone: v }))}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select Time Zone" /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="UTC">UTC (GMT)</SelectItem>
                            <SelectItem value="UTC+3">UTC+3 (EAT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Physical Location</Label>
                        <Input value={form.location} onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Hall B" />
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-slate-800" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Target className="h-4 w-4" /> Ministry Interests</h3>
                    <p className="text-xs text-slate-400">From MinistryRegistrationFlow data:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {interestOptions.map(option => (
                        <div key={option} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                          <Checkbox id={`interest-${option}`} checked={form.interests.includes(option)} onCheckedChange={() => toggleInterest(option)} />
                          <Label htmlFor={`interest-${option}`} className="text-sm text-slate-300 cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-slate-800" />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Meeting Logistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Meeting Day</Label>
                        <Select value={form.meetingDay} onValueChange={(v) => setForm(prev => ({ ...prev, meetingDay: v }))}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Start Time</Label>
                        <Input type="time" value={form.meetingTime} onChange={(e) => setForm(prev => ({ ...prev, meetingTime: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Capacity</Label>
                        <Input type="number" value={form.maxMembers} onChange={(e) => setForm(prev => ({ ...prev, maxMembers: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-slate-800">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-white">Cancel</Button>
                <Button onClick={handleCreateGroup} disabled={isSubmitting || !form.name} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20"><Users className="h-5 w-5 text-amber-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.totalCompletedProfiles}</p>
                    <p className="text-xs text-slate-400">Completed Profiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle2 className="h-5 w-5 text-emerald-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{groups.length}</p>
                    <p className="text-xs text-slate-400">Active Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20"><Target className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.needsMentorship}</p>
                    <p className="text-xs text-slate-400">Need Mentorship</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20"><MessageSquare className="h-5 w-5 text-purple-500" /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.needsContact}</p>
                    <p className="text-xs text-slate-400">Need Contact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Target className="h-5 w-5 text-amber-500" /> Ministry Interests Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byInterest).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 8).map(([interest, count]) => (
                    <div key={interest} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-slate-300">{interest}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((count as number / analytics.totalCompletedProfiles) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><MapPin className="h-5 w-5 text-emerald-500" /> Location Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byLocation).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-300">{location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((count as number / analytics.totalCompletedProfiles) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Heart className="h-5 w-5 text-rose-500" /> Spiritual Growth Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byGrowthArea).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([area, count]) => (
                    <div key={area} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-sm text-slate-300">{area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min((count as number / analytics.totalCompletedProfiles) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Church className="h-5 w-5 text-blue-500" /> Faith Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.byFaithStatus).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-slate-300">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((count as number / analytics.totalCompletedProfiles) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>Auto-generated suggestions based on member ministry data</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion: any, index: number) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={
                      suggestion.type === 'interest' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      suggestion.type === 'location' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      suggestion.type === 'growth' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }>
                      {suggestion.type}
                    </Badge>
                    <Badge variant="outline" className={
                      suggestion.priority === 'high' ? 'border-red-500/50 text-red-400' : 'border-amber-500/50 text-amber-400'
                    }>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{suggestion.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{suggestion.memberCount} matching members</span>
                    </div>
                    {suggestion.interest && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Target className="h-4 w-4" />
                        <span>{suggestion.interest}</span>
                      </div>
                    )}
                    {suggestion.location && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span>{suggestion.location}</span>
                      </div>
                    )}
                    {suggestion.growthArea && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Heart className="h-4 w-4" />
                        <span>{suggestion.growthArea}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{suggestion.suggestedDay} at {suggestion.suggestedTime}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleCreateFromSuggestion(suggestion)} 
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-black"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <Sparkles className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-slate-400 font-medium">No suggestions available</h3>
              <p className="text-slate-500 text-sm">Complete member profiles will generate group suggestions</p>
            </div>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <>
          {deleteSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              Group deleted successfully
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id} className="bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 font-medium">
                      {group.type || 'General'}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">{group._count.members}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                          <DropdownMenuItem onClick={() => openViewMembers(group)} className="text-slate-300 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer">
                            <Users className="h-4 w-4 mr-2" /> View Members
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(group)} className="text-slate-300 hover:text-white focus:bg-slate-800 focus:text-white cursor-pointer">
                            <Pencil className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem onClick={() => { setSelectedGroup(group); setDeleteError(null); setIsDeleteDialogOpen(true); }} className="text-red-400 hover:text-red-300 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{group.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">{group.description || 'No description provided.'}</p>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <MapPin className="h-4 w-4 text-amber-500/70" />
                      <span className="truncate">{group.city ? `${group.city}, ${group.country}` : group.location || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Clock className="h-4 w-4 text-amber-500/70" />
                      <span>{group.meetingDay} at {group.meetingTime || 'TBD'}</span>
                    </div>
                  </div>
                  {group.interests && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {group.interests.split(',').slice(0, 3).map(interest => (
                        <span key={interest} className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {interest}
                        </span>
                      ))}
                      {group.interests.split(',').length > 3 && (
                        <span className="text-[10px] text-slate-500 px-1">+{group.interests.split(',').length - 3} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {groups.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <UsersRound className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-slate-400 font-medium">No groups found</h3>
              <p className="text-slate-500 text-sm">Create your first small group or check suggestions</p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Small Group
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="text-white font-medium">"{selectedGroup?.name}"</span>? 
              {selectedGroup && selectedGroup._count.members > 0 && (
                <span className="block mt-2 text-amber-500 text-sm">
                  This group has {selectedGroup._count.members} member(s). They will be removed from the group.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {deleteError}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setDeleteError(null); }} className="border-slate-700 text-white">Cancel</Button>
            <Button onClick={handleDeleteGroup} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={isViewMembersOpen} onOpenChange={setIsViewMembersOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              {selectedGroup?.name} - Members
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedGroup?._count.members} member(s) in this group
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3 py-4">
            {selectedGroup?.members && selectedGroup.members.length > 0 ? (
              selectedGroup.members.map((member: any) => (
                <div key={member.userId} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {member.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{member.user?.name || 'Unknown'}</p>
                    <p className="text-slate-400 text-xs">{member.user?.email}</p>
                  </div>
                  <Badge className={
                    member.role === 'LEADER' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-700/50 text-slate-400'
                  }>
                    {member.role}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No members in this group yet</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewMembersOpen(false)} className="border-slate-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-white">Edit Small Group</DialogTitle>
            <DialogDescription className="text-slate-400">Update group details, location, or faith profile.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-10 custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Info className="h-4 w-4" /> Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Group Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Downtown Bible Study" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Category / Type</Label>
                    <Select value={form.type || ''} onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Bible Study">Bible Study</SelectItem>
                        <SelectItem value="Youth">Youth</SelectItem>
                        <SelectItem value="Interests">Interests</SelectItem>
                        <SelectItem value="Ministry">Ministry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full min-h-[80px] rounded-md bg-slate-800 border border-slate-700 p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none" placeholder="What is this group about?" />
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Country</Label>
                    <Select value={form.country || ''} onValueChange={(v) => setForm(prev => ({ ...prev, country: v }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">City / Region</Label>
                    <Input value={form.city} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Addis Ababa" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Time Zone</Label>
                    <Select value={form.timezone || ''} onValueChange={(v) => setForm(prev => ({ ...prev, timezone: v }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select Time Zone" /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="UTC">UTC (GMT)</SelectItem>
                        <SelectItem value="UTC+3">UTC+3 (EAT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Physical Location</Label>
                    <Input value={form.location} onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g., Hall B" />
                  </div>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Target className="h-4 w-4" /> Ministry Interests</h3>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                      <Checkbox id={`edit-interest-${option}`} checked={form.interests.includes(option)} onCheckedChange={() => toggleInterest(option)} />
                      <Label htmlFor={`edit-interest-${option}`} className="text-sm text-slate-300">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-amber-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Meeting Logistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Day</Label>
                    <Select value={form.meetingDay || ''} onValueChange={(v) => setForm(prev => ({ ...prev, meetingDay: v }))}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Time</Label>
                    <Input type="time" value={form.meetingTime} onChange={(e) => setForm(prev => ({ ...prev, meetingTime: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Capacity</Label>
                    <Input type="number" value={form.maxMembers} onChange={(e) => setForm(prev => ({ ...prev, maxMembers: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-white">Cancel</Button>
            <Button onClick={handleEditGroup} disabled={isSubmitting || !form.name} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Programs Content Component
function ProgramsContent() {
  const [programs, setPrograms] = useState<Array<{
    id: string;
    name: string;
    description: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string | null;
    timezone: string;
    location: string | null;
    isOnline: boolean;
    zoomLink: string | null;
    isActive: boolean;
    createdAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<typeof programs[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    dayOfWeek: '0',
    startTime: '10:00',
    endTime: '',
    location: '',
    isOnline: false,
    zoomLink: '',
  });
  
  const [editProgram, setEditProgram] = useState({
    name: '',
    description: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    location: '',
    isOnline: false,
    zoomLink: '',
    isActive: true,
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/programs');
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProgram.name,
          description: newProgram.description,
          dayOfWeek: parseInt(newProgram.dayOfWeek),
          startTime: newProgram.startTime,
          endTime: newProgram.endTime || null,
          location: newProgram.location,
          isOnline: newProgram.isOnline,
          zoomLink: newProgram.zoomLink || null,
        }),
      });
      
      if (res.ok) {
        const created = await res.json();
        setPrograms(prev => [...prev, created]);
        setNewProgram({ name: '', description: '', dayOfWeek: '0', startTime: '10:00', endTime: '', location: '', isOnline: false, zoomLink: '' });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProgram = async () => {
    if (!selectedProgram || !editProgram.name) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${selectedProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProgram),
      });
      
      if (res.ok) {
        setPrograms(prev => prev.map(p => 
          p.id === selectedProgram.id ? { ...p, ...editProgram } : p
        ));
        setIsEditDialogOpen(false);
        setSelectedProgram(null);
      }
    } catch (error) {
      console.error('Error editing program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!selectedProgram) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${selectedProgram.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setPrograms(prev => prev.filter(p => p.id !== selectedProgram.id));
        setIsDeleteDialogOpen(false);
        setSelectedProgram(null);
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (program: typeof programs[0]) => {
    setSelectedProgram(program);
    setEditProgram({
      name: program.name,
      description: program.description || '',
      dayOfWeek: program.dayOfWeek,
      startTime: program.startTime,
      endTime: program.endTime || '',
      location: program.location || '',
      isOnline: program.isOnline,
      zoomLink: program.zoomLink || '',
      isActive: program.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (program: typeof programs[0]) => {
    setSelectedProgram(program);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Weekly Programs</h2>
          <p className="text-slate-400 text-sm">Manage recurring church programs and services</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Program</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new recurring program to the schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-white">Program Name *</Label>
                <Input
                  value={newProgram.name}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Sunday Service"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Input
                  value={newProgram.description}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Weekly worship service"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Day of Week *</Label>
                  <Select value={newProgram.dayOfWeek} onValueChange={(v) => setNewProgram(prev => ({ ...prev, dayOfWeek: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {daysOfWeek.map((day, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Start Time *</Label>
                  <Input
                    type="time"
                    value={newProgram.startTime}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, startTime: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">End Time</Label>
                  <Input
                    type="time"
                    value={newProgram.endTime}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, endTime: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Location</Label>
                  <Input
                    value={newProgram.location}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Main Sanctuary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newProgram.isOnline}
                  onCheckedChange={(checked) => setNewProgram(prev => ({ ...prev, isOnline: checked }))}
                />
                <Label className="text-white">Online/Zoom Program</Label>
              </div>
              {newProgram.isOnline && (
                <div className="space-y-2">
                  <Label className="text-white">Zoom Link</Label>
                  <Input
                    value={newProgram.zoomLink}
                    onChange={(e) => setNewProgram(prev => ({ ...prev, zoomLink: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-white">
                Cancel
              </Button>
              <Button onClick={handleCreateProgram} disabled={isSubmitting || !newProgram.name} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Program
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : programs.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Layers className="h-12 w-12 mb-4" />
            <p>No programs scheduled yet.</p>
            <p className="text-sm">Click "Add Program" to create your first program.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...programs].sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTime.localeCompare(b.startTime);
          }).map((program) => (
            <Card key={program.id} className={cn(
              "bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition",
              !program.isActive && "opacity-50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                      {daysOfWeek[program.dayOfWeek]}
                    </Badge>
                    <Badge className={cn(
                      "border text-xs",
                      program.isOnline ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"
                    )}>
                      {program.isOnline ? 'Online' : 'In-Person'}
                    </Badge>
                    {!program.isActive && (
                      <Badge variant="outline" className="border-slate-600 text-slate-500 text-xs">Inactive</Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={() => openEditDialog(program)} className="text-white hover:bg-slate-700">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(program)} className="text-red-400 hover:bg-slate-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h4 className="text-white font-semibold mb-1">{program.name}</h4>
                {program.description && (
                  <p className="text-slate-400 text-sm mb-2 line-clamp-2">{program.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{program.startTime}{program.endTime ? ` - ${program.endTime}` : ''}</span>
                  </div>
                </div>
                {program.location && (
                  <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{program.location}</span>
                  </div>
                )}
                {program.isOnline && program.zoomLink && (
                  <a 
                    href={program.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Zoom
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Program</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update program details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Program Name *</Label>
              <Input
                value={editProgram.name}
                onChange={(e) => setEditProgram(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Description</Label>
              <Input
                value={editProgram.description}
                onChange={(e) => setEditProgram(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Day of Week *</Label>
                <Select value={editProgram.dayOfWeek.toString()} onValueChange={(v) => setEditProgram(prev => ({ ...prev, dayOfWeek: parseInt(v) }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {daysOfWeek.map((day, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Start Time *</Label>
                <Input
                  type="time"
                  value={editProgram.startTime}
                  onChange={(e) => setEditProgram(prev => ({ ...prev, startTime: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">End Time</Label>
                <Input
                  type="time"
                  value={editProgram.endTime}
                  onChange={(e) => setEditProgram(prev => ({ ...prev, endTime: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Location</Label>
                <Input
                  value={editProgram.location}
                  onChange={(e) => setEditProgram(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editProgram.isOnline}
                  onCheckedChange={(checked) => setEditProgram(prev => ({ ...prev, isOnline: checked }))}
                />
                <Label className="text-white">Online</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editProgram.isActive}
                  onCheckedChange={(checked) => setEditProgram(prev => ({ ...prev, isActive: checked }))}
                />
                <Label className="text-white">Active</Label>
              </div>
            </div>
            {editProgram.isOnline && (
              <div className="space-y-2">
                <Label className="text-white">Zoom Link</Label>
                <Input
                  value={editProgram.zoomLink}
                  onChange={(e) => setEditProgram(prev => ({ ...prev, zoomLink: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-white">
              Cancel
            </Button>
            <Button onClick={handleEditProgram} disabled={isSubmitting || !editProgram.name} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Program</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{selectedProgram?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-white">
              Cancel
            </Button>
            <Button onClick={handleDeleteProgram} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Registrations Content Component
function RegistrationsContent() {
  const [registrations, setRegistrations] = useState<Array<{
    id: string;
    status: string;
    registeredAt: string;
    confirmedAt: string | null;
    cancelledAt: string | null;
    attendedAt: string | null;
    notes: string | null;
    event: {
      id: string;
      title: string;
      startDate: string;
      location: string | null;
      isOnline: boolean;
    };
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      phone: string | null;
    };
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<typeof registrations[0] | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/registrations?limit=100');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setRegistrations(prev => prev.map(r => 
          r.id === registrationId ? { ...r, status: newStatus } : r
        ));
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedRegistration) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/registrations/${selectedRegistration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      
      if (res.ok) {
        setRegistrations(prev => prev.map(r => 
          r.id === selectedRegistration.id ? { ...r, notes } : r
        ));
        setIsNotesDialogOpen(false);
        setSelectedRegistration(null);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewDialog = (registration: typeof registrations[0]) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  const openNotesDialog = (registration: typeof registrations[0]) => {
    setSelectedRegistration(registration);
    setNotes(registration.notes || '');
    setIsNotesDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ATTENDED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesStatus = filter === 'all' || r.status === filter;
    const matchesSearch = !searchQuery || 
      r.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: registrations.length,
    registered: registrations.filter(r => r.status === 'REGISTERED').length,
    confirmed: registrations.filter(r => r.status === 'CONFIRMED').length,
    attended: registrations.filter(r => r.status === 'ATTENDED').length,
    cancelled: registrations.filter(r => r.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card 
          className={cn("cursor-pointer transition-all bg-slate-900/50 border-slate-800 hover:border-amber-500/50", filter === 'all' ? "ring-2 ring-amber-500 border-amber-500" : "")}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-slate-900/50 border-slate-800 hover:border-amber-500/50", filter === 'REGISTERED' ? "ring-2 ring-amber-500 border-amber-500" : "")}
          onClick={() => setFilter(filter === 'REGISTERED' ? 'all' : 'REGISTERED')}
        >
          <CardContent className="p-4">
            <p className="text-amber-400 text-xs">Registered</p>
            <p className="text-2xl font-bold text-white">{stats.registered}</p>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-slate-900/50 border-slate-800 hover:border-blue-500/50", filter === 'CONFIRMED' ? "ring-2 ring-blue-500 border-blue-500" : "")}
          onClick={() => setFilter(filter === 'CONFIRMED' ? 'all' : 'CONFIRMED')}
        >
          <CardContent className="p-4">
            <p className="text-blue-400 text-xs">Confirmed</p>
            <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-slate-900/50 border-slate-800 hover:border-emerald-500/50", filter === 'ATTENDED' ? "ring-2 ring-emerald-500 border-emerald-500" : "")}
          onClick={() => setFilter(filter === 'ATTENDED' ? 'all' : 'ATTENDED')}
        >
          <CardContent className="p-4">
            <p className="text-emerald-400 text-xs">Attended</p>
            <p className="text-2xl font-bold text-white">{stats.attended}</p>
          </CardContent>
        </Card>
        <Card 
          className={cn("cursor-pointer transition-all bg-slate-900/50 border-slate-800 hover:border-red-500/50", filter === 'CANCELLED' ? "ring-2 ring-red-500 border-red-500" : "")}
          onClick={() => setFilter(filter === 'CANCELLED' ? 'all' : 'CANCELLED')}
        >
          <CardContent className="p-4">
            <p className="text-red-400 text-xs">Cancelled</p>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* Registrations Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center h-64 text-slate-400">
            <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
            <p>No registrations found</p>
            <p className="text-sm">Registrations will appear here when people sign up for events.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRegistrations.map((registration) => (
            <Card key={registration.id} className="bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getStatusColor(registration.status)}>
                    {registration.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={() => openViewDialog(registration)} className="text-white hover:bg-slate-700">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openNotesDialog(registration)} className="text-white hover:bg-slate-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Edit Notes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      {registration.status !== 'CONFIRMED' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(registration.id, 'CONFIRMED')}
                          className="text-blue-400 hover:bg-slate-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirm
                        </DropdownMenuItem>
                      )}
                      {registration.status !== 'ATTENDED' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(registration.id, 'ATTENDED')}
                          className="text-emerald-400 hover:bg-slate-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Attended
                        </DropdownMenuItem>
                      )}
                      {registration.status !== 'CANCELLED' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(registration.id, 'CANCELLED')}
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9 border border-slate-700">
                    <AvatarImage src={registration.user.image || undefined} />
                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-sm">
                      {registration.user.name?.charAt(0) || registration.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate text-sm">
                      {registration.user.name || 'Unknown'}
                    </p>
                    <p className="text-slate-400 text-xs truncate">{registration.user.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-white truncate">{registration.event.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>Registered {formatDate(registration.registeredAt)}</span>
                  </div>
                  {registration.event.isOnline ? (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <Video className="h-3 w-3 shrink-0" />
                      <span>Online Event</span>
                    </div>
                  ) : registration.event.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{registration.event.location}</span>
                    </div>
                  )}
                </div>

                {registration.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-slate-400 text-xs line-clamp-2">{registration.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
                <Avatar className="h-12 w-12 border border-slate-700">
                  <AvatarImage src={selectedRegistration.user.image || undefined} />
                  <AvatarFallback className="bg-amber-500/20 text-amber-400">
                    {selectedRegistration.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{selectedRegistration.user.name || 'Unknown'}</p>
                  <p className="text-slate-400 text-sm">{selectedRegistration.user.email}</p>
                  {selectedRegistration.user.phone && (
                    <p className="text-slate-500 text-xs">{selectedRegistration.user.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Event</span>
                  <span className="text-white">{selectedRegistration.event.title}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Status</span>
                  <Badge className={getStatusColor(selectedRegistration.status)}>
                    {selectedRegistration.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Registered</span>
                  <span className="text-white">{formatDateTime(selectedRegistration.registeredAt)}</span>
                </div>
                {selectedRegistration.confirmedAt && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Confirmed</span>
                    <span className="text-white">{formatDateTime(selectedRegistration.confirmedAt)}</span>
                  </div>
                )}
                {selectedRegistration.attendedAt && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Attended</span>
                    <span className="text-white">{formatDateTime(selectedRegistration.attendedAt)}</span>
                  </div>
                )}
                {selectedRegistration.cancelledAt && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Cancelled</span>
                    <span className="text-white">{formatDateTime(selectedRegistration.cancelledAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Event Date</span>
                  <span className="text-white">{formatDate(selectedRegistration.event.startDate)}</span>
                </div>
                {selectedRegistration.notes && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-sm">Notes</span>
                    <p className="text-white mt-1 p-3 rounded-lg bg-slate-800/50">{selectedRegistration.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Notes</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add or update notes for this registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about this registration..."
              className="w-full h-32 p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleUpdateNotes} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Coming Soon Component
function ComingSoonContent({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Sparkles className="h-10 w-10 text-amber-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2 capitalize">{feature}</h2>
      <p className="text-slate-400 text-center max-w-md">
        This section is coming soon. We&apos;re working hard to bring you the best church management experience.
      </p>
    </div>
  );
}

// Settings Content Component
function SettingsContent() {
  const { user, settings: globalSettings, setSettings: setGlobalSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'logo' | 'seo' | 'api' | 'site' | 'features' | 'social' | 'verification' | 'security' | 'language' | 'sms'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Grace Community Church',
    siteTagline: 'Welcome Home',
    siteDescription: 'A welcoming community of faith dedicated to spreading God\'s love.',
    siteUrl: 'https://gracecommunity.church',
    contactEmail: 'info@gracecommunity.church',
    contactPhone: '(555) 123-4567',
    address: '123 Faith Street, Grace City, GC 12345',
    logoUrl: '',
    faviconUrl: '',
    metaTitle: 'Grace Community Church - Welcome Home',
    metaDescription: 'Join us for worship, fellowship, and spiritual growth at Grace Community Church.',
    metaKeywords: 'church, worship, community, faith, grace, fellowship',
    socialFacebook: 'https://facebook.com/gracecommunity',
    socialTiktok: 'https://tiktok.com/@gracechurch',
    socialInstagram: 'https://instagram.com/gracechurch',
    socialYoutube: 'https://youtube.com/gracecommunity',
    googleAnalyticsId: '',
    zoomApiKey: '',
    zoomApiSecret: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paypalClientId: '',
    paypalClientSecret: '',
    paypalMode: 'sandbox' as 'sandbox' | 'live',
    mailchimpApiKey: '',
    // Site Mode Settings
    siteMode: 'live' as 'live' | 'coming_soon' | 'maintenance' | 'private',
    statusHeadline: '',
    statusMessage: '',
    launchDate: '',
    collectEmails: true,
    showProgress: false,
    statusBackgroundImage: '',
    statusContactEmail: '',
    allowRegistration: true,
    showLoginForm: true,
    privateMessage: '',
    // Site Mode Settings
    heroBackgroundImage: '',
    // Feature Flags
    features: {
      eventsEnabled: true,
      sermonsEnabled: true,
      prayerEnabled: true,
      donationsEnabled: true,
      smallGroupsEnabled: true,
      contactEnabled: true,
      aboutEnabled: true,
      registrationEnabled: true,
      memberDashboardEnabled: true,
      notificationsEnabled: true,
    },
    // Language Settings
    language: {
      enabled: false,
      showInNavbar: true,
      showInFooter: true,
      defaultLanguage: 'en',
      availableLanguages: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load settings from database on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...prev,
            ...data,
            // Convert string values to proper types
            collectEmails: data.collectEmails === 'true' || data.collectEmails === true,
            showProgress: data.showProgress === 'true' || data.showProgress === true,
            allowRegistration: data.allowRegistration === 'true' || data.allowRegistration === true,
            showLoginForm: data.showLoginForm === 'true' || data.showLoginForm === true,
            // Parse features
            features: {
              eventsEnabled: data.features?.eventsEnabled !== false && data.features?.eventsEnabled !== 'false',
              sermonsEnabled: data.features?.sermonsEnabled !== false && data.features?.sermonsEnabled !== 'false',
              prayerEnabled: data.features?.prayerEnabled !== false && data.features?.prayerEnabled !== 'false',
              donationsEnabled: data.features?.donationsEnabled !== false && data.features?.donationsEnabled !== 'false',
              smallGroupsEnabled: data.features?.smallGroupsEnabled !== false && data.features?.smallGroupsEnabled !== 'false',
              contactEnabled: data.features?.contactEnabled !== false && data.features?.contactEnabled !== 'false',
              aboutEnabled: data.features?.aboutEnabled !== false && data.features?.aboutEnabled !== 'false',
              registrationEnabled: data.features?.registrationEnabled !== false && data.features?.registrationEnabled !== 'false',
              memberDashboardEnabled: data.features?.memberDashboardEnabled !== false && data.features?.memberDashboardEnabled !== 'false',
              notificationsEnabled: data.features?.notificationsEnabled !== false && data.features?.notificationsEnabled !== 'false',
            },
            // Parse language settings
            language: {
              enabled: data.language?.enabled === 'true' || data.language?.enabled === true,
              showInNavbar: data.language?.showInNavbar !== false && data.language?.showInNavbar !== 'false',
              showInFooter: data.language?.showInFooter !== false && data.language?.showInFooter !== 'false',
              defaultLanguage: data.language?.defaultLanguage || 'en',
              availableLanguages: data.language?.availableLanguages || ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
            },
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (settingsToSave = settings) => {
    setIsSubmitting(true);
    setSaveMessage(null);
    try {
      console.log('handleSave - Requesting save with body keys:', Object.keys(settingsToSave));
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      });

      console.log('handleSave - Response status:', res.status);
      if (res.ok) {
        setGlobalSettings(settingsToSave);
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('handleSave - Error response:', errorData);
        setSaveMessage({ type: 'error', text: `Failed to save settings: ${errorData.error || res.statusText}` });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload for logo/favicon/hero
  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'hero') => {
    if (type === 'logo') {
      setUploadingLogo(true);
    } else if (type === 'favicon') {
      setUploadingFavicon(true);
    } else {
      setUploadingHero(true);
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'images');
      
      console.log(`handleFileUpload - Uploading ${type} to /api/upload`);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('handleFileUpload - Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('handleFileUpload - Success:', data);
        let updatedSettings = { ...settings };
        if (type === 'logo') {
          updatedSettings.logoUrl = data.url;
        } else if (type === 'favicon') {
          updatedSettings.faviconUrl = data.url;
        } else {
          updatedSettings.heroBackgroundImage = data.url;
        }
        
        setSettings(updatedSettings);
        setSaveMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully! Auto-saving changes...` });
        
        // Auto-save settings immediately with the updated data
        console.log('handleFileUpload - Triggering auto-save');
        await handleSave(updatedSettings);
        
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('handleFileUpload - Error response:', errorData);
        setSaveMessage({ type: 'error', text: `Failed to upload file: ${errorData.error || res.statusText}` });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSaveMessage({ type: 'error', text: 'Error uploading file' });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else if (type === 'favicon') {
        setUploadingFavicon(false);
      } else {
        setUploadingHero(false);
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const res = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword 
        }),
      });

      if (res.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setTimeout(() => setPasswordMessage(null), 5000);
      } else {
        const error = await res.json();
        setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password.' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Site Info', icon: Church, category: 'General' },
    { id: 'logo', label: 'Logo & Branding', icon: Sparkles, category: 'General' },
    { id: 'language', label: 'Language', icon: Globe, category: 'General' },
    { id: 'seo', label: 'SEO', icon: FileText, category: 'General' },
    { id: 'api', label: 'API Keys', icon: Settings, category: 'Integrations' },
    { id: 'site', label: 'Site Status', icon: Activity, category: 'System' },
    { id: 'features', label: 'Features', icon: Layers, category: 'System' },
    { id: 'social', label: 'Social Login', icon: Users, category: 'Authentication' },
    { id: 'email', label: 'Email Settings', icon: Mail, category: 'Integrations' },
    { id: 'security', label: 'Password & Security', icon: Lock, category: 'Authentication' },
    { id: 'sms', label: 'SMS Settings', icon: Smartphone, category: 'Integrations' },
  ] as const;

  const categories = ['General', 'Authentication', 'Integrations', 'System'];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-3 text-slate-400">Loading settings...</span>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-56 shrink-0">
            <nav className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {tabs.filter(tab => tab.category === category).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                          activeTab === tab.id 
                            ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" 
                            : "bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600"
                        )}
                      >
                        <tab.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 space-y-6">

      {/* General Settings */}
      {activeTab === 'general' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Site Information</CardTitle>
            <CardDescription className="text-slate-400">
              Basic information about your church website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Church Name</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tagline</Label>
                <Input
                  value={settings.siteTagline}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteTagline: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Input
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Website URL</Label>
                <Input
                  value={settings.siteUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Email</Label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Phone</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Address</Label>
                <Input
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logo Settings */}
      {activeTab === 'logo' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Logo & Branding</CardTitle>
            <CardDescription className="text-slate-400">
              Upload your church logo and favicon. Changes will be reflected across all pages after saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Save Message */}
            {saveMessage && (
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-2",
                saveMessage.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
              )}>
                {saveMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {saveMessage.text}
              </div>
            )}
            
             <div className="grid gap-6 md:grid-cols-3">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label className="text-slate-300">Church Logo</Label>
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                  }}
                />
                <label
                  htmlFor="logo-upload"
                  className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-amber-500 transition cursor-pointer block relative"
                >
                  {uploadingLogo ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                      <p className="text-amber-400 text-xs">Uploading...</p>
                    </div>
                  ) : settings.logoUrl ? (
                    <>
                      <img src={settings.logoUrl} alt="Logo" className="h-20 mx-auto mb-2 object-contain" />
                      <p className="text-amber-400 text-xs font-medium">Change logo</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Church className="h-8 w-8 text-amber-400" />
                      </div>
                      <p className="text-slate-400 text-xs text-center">Upload logo</p>
                    </>
                  )}
                </label>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Or enter URL manually</Label>
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="bg-slate-800 border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
              
              {/* Favicon Upload */}
              <div className="space-y-4">
                <Label className="text-slate-300">Favicon</Label>
                <input
                  type="file"
                  id="favicon-upload"
                  className="hidden"
                  accept="image/png,image/x-icon,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'favicon');
                  }}
                />
                <label
                  htmlFor="favicon-upload"
                  className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-amber-500 transition cursor-pointer block relative"
                >
                  {uploadingFavicon ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                      <p className="text-amber-400 text-xs">Uploading...</p>
                    </div>
                  ) : settings.faviconUrl ? (
                    <>
                      <img src={settings.faviconUrl} alt="Favicon" className="h-16 w-16 mx-auto mb-2 object-contain" />
                      <p className="text-amber-400 text-xs font-medium">Change favicon</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-xs text-center">Upload favicon</p>
                    </>
                  )}
                </label>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Or enter URL manually</Label>
                  <Input
                    value={settings.faviconUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                    className="bg-slate-800 border-slate-700 text-white text-sm"
                  />
                </div>
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-4">
                <Label className="text-slate-300">Hero Background</Label>
                <input
                  type="file"
                  id="hero-upload"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'hero');
                  }}
                />
                <label
                  htmlFor="hero-upload"
                  className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-amber-500 transition cursor-pointer block relative h-[140px] flex flex-col items-center justify-center overflow-hidden"
                >
                  {uploadingHero ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                      <p className="text-amber-400 text-xs">Uploading...</p>
                    </div>
                  ) : settings.heroBackgroundImage ? (
                    <div className="relative w-full h-full group">
                      <img src={settings.heroBackgroundImage} alt="Hero" className="w-full h-full object-cover rounded-md" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <p className="text-white text-xs font-medium">Change Hero Image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-slate-400 text-xs text-center">Upload hero image</p>
                    </>
                  )}
                </label>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Or enter URL manually</Label>
                  <Input
                    value={settings.heroBackgroundImage || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, heroBackgroundImage: e.target.value }))}
                    placeholder="https://example.com/hero.jpg"
                    className="bg-slate-800 border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Save Button for Logo Tab */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => handleSave()} 
                disabled={isSubmitting || uploadingLogo || uploadingFavicon}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
            
            <Separator className="bg-slate-800" />
            
            <div>
              <h4 className="text-white font-medium mb-4">Social Media Links</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    Facebook URL
                  </Label>
                  <Input
                    value={settings.socialFacebook}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialFacebook: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">TikTok URL</Label>
                  <Input
                    value={settings.socialTiktok}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialTiktok: e.target.value }))}
                    placeholder="https://tiktok.com/@yourchurch"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Instagram URL</Label>
                  <Input
                    value={settings.socialInstagram}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialInstagram: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">YouTube URL</Label>
                  <Input
                    value={settings.socialYoutube}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialYoutube: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Search Engine Optimization</CardTitle>
            <CardDescription className="text-slate-400">
              Improve your site visibility on search engines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Meta Title</Label>
              <Input
                value={settings.metaTitle}
                onChange={(e) => setSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">{settings.metaTitle.length}/60 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Meta Description</Label>
              <Input
                value={settings.metaDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">{settings.metaDescription.length}/160 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Meta Keywords</Label>
              <Input
                value={settings.metaKeywords}
                onChange={(e) => setSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="church, worship, community, faith"
              />
              <p className="text-slate-500 text-xs">Separate keywords with commas</p>
            </div>
            
            <Separator className="bg-slate-800" />
            
            <div className="space-y-2">
              <Label className="text-slate-300">Google Analytics ID</Label>
              <Input
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-slate-500 text-xs">Track visitor analytics with Google Analytics</p>
            </div>
            
            <div className="p-4 rounded-lg bg-slate-800/50">
              <h4 className="text-white font-medium mb-2">SEO Preview</h4>
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-blue-400 text-lg">{settings.metaTitle}</p>
                <p className="text-emerald-400 text-sm">{settings.siteUrl}</p>
                <p className="text-slate-400 text-sm mt-1">{settings.metaDescription}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Settings */}
      {activeTab === 'language' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              Language & Translation
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enable multilingual support using Google Translate. Visitors can translate your site into their preferred language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {saveMessage && (
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-2",
                saveMessage.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
              )}>
                {saveMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {saveMessage.text}
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
              <div>
                <h4 className="text-white font-medium">Enable Translation</h4>
                <p className="text-slate-400 text-sm">Allow visitors to translate your website using Google Translate</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  language: { ...prev.language, enabled: !prev.language.enabled } 
                }))}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  settings.language.enabled ? "bg-amber-500" : "bg-slate-600"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings.language.enabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {settings.language.enabled && (
              <>
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Display Options</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700">
                    <div>
                      <p className="text-white">Show in Navigation Bar</p>
                      <p className="text-slate-400 text-sm">Display language switcher in the main navigation</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        language: { ...prev.language, showInNavbar: !prev.language.showInNavbar } 
                      }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        settings.language.showInNavbar ? "bg-amber-500" : "bg-slate-600"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings.language.showInNavbar ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700">
                    <div>
                      <p className="text-white">Show in Footer</p>
                      <p className="text-slate-400 text-sm">Display language switcher in the website footer</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        language: { ...prev.language, showInFooter: !prev.language.showInFooter } 
                      }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        settings.language.showInFooter ? "bg-amber-500" : "bg-slate-600"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings.language.showInFooter ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Default Language</Label>
                  <Select 
                    value={settings.language.defaultLanguage} 
                    onValueChange={(value) => setSettings(prev => ({ 
                      ...prev, 
                      language: { ...prev.language, defaultLanguage: value } 
                    }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select default language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh-CN">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="am">Amharic</SelectItem>
                      <SelectItem value="om">Afaan Oromoo</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="nl">Dutch</SelectItem>
                      <SelectItem value="pl">Polish</SelectItem>
                      <SelectItem value="tr">Turkish</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                      <SelectItem value="th">Thai</SelectItem>
                      <SelectItem value="id">Indonesian</SelectItem>
                      <SelectItem value="ms">Malay</SelectItem>
                      <SelectItem value="fil">Filipino</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-slate-500 text-xs">This is the language your content is written in</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Available Languages</Label>
                  <p className="text-slate-400 text-sm mb-2">Select which languages visitors can translate to</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      { code: 'en', name: 'English', flag: 'US' },
                      { code: 'es', name: 'Spanish', flag: 'ES' },
                      { code: 'fr', name: 'French', flag: 'FR' },
                      { code: 'de', name: 'German', flag: 'DE' },
                      { code: 'pt', name: 'Portuguese', flag: 'BR' },
                      { code: 'zh-CN', name: 'Chinese', flag: 'CN' },
                      { code: 'ja', name: 'Japanese', flag: 'JP' },
                      { code: 'ko', name: 'Korean', flag: 'KR' },
                      { code: 'ar', name: 'Arabic', flag: 'SA' },
                      { code: 'hi', name: 'Hindi', flag: 'IN' },
                      { code: 'am', name: 'Amharic', flag: 'ET' },
                      { code: 'om', name: 'Afaan Oromoo', flag: 'ET' },
                      { code: 'it', name: 'Italian', flag: 'IT' },
                      { code: 'ru', name: 'Russian', flag: 'RU' },
                      { code: 'nl', name: 'Dutch', flag: 'NL' },
                      { code: 'pl', name: 'Polish', flag: 'PL' },
                      { code: 'tr', name: 'Turkish', flag: 'TR' },
                      { code: 'vi', name: 'Vietnamese', flag: 'VN' },
                      { code: 'th', name: 'Thai', flag: 'TH' },
                      { code: 'id', name: 'Indonesian', flag: 'ID' },
                      { code: 'ms', name: 'Malay', flag: 'MY' },
                      { code: 'fil', name: 'Filipino', flag: 'PH' },
                      { code: 'sw', name: 'Swahili', flag: 'KE' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          const currentLanguages = settings.language.availableLanguages || [];
                          const newLanguages = currentLanguages.includes(lang.code)
                            ? currentLanguages.filter((l) => l !== lang.code)
                            : [...currentLanguages, lang.code];
                          setSettings(prev => ({
                            ...prev,
                            language: { ...prev.language, availableLanguages: newLanguages }
                          }));
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                          settings.language.availableLanguages?.includes(lang.code)
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                        )}
                      >
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-medium">How Translation Works</h4>
                      <p className="text-slate-400 text-sm mt-1">
                        Google Translate will automatically translate your website content. 
                        For best results, ensure your content is clear and well-structured.
                        Note: Machine translation may not be 100% accurate.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => handleSave()} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-400" />
                Zoom Integration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Connect Zoom for online meetings and services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Zoom API Key</Label>
                <Input
                  type="password"
                  value={settings.zoomApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, zoomApiKey: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter your Zoom API Key"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Zoom API Secret</Label>
                <Input
                  type="password"
                  value={settings.zoomApiSecret}
                  onChange={(e) => setSettings(prev => ({ ...prev, zoomApiSecret: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter your Zoom API Secret"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  Not Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                Stripe Integration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Accept online donations via Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Stripe Public Key</Label>
                <Input
                  value={settings.stripePublicKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="pk_live_..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Stripe Secret Key</Label>
                <Input
                  type="password"
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="sk_live_..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Stripe Webhook Secret (Optional)</Label>
                <Input
                  type="password"
                  value={settings.stripeWebhookSecret}
                  onChange={(e) => setSettings(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="whsec_..."
                />
                <p className="text-slate-500 text-xs">For verifying webhook signatures</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={settings.stripeSecretKey ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/50 text-amber-400"}>
                  {settings.stripeSecretKey ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🅿️</span>
                PayPal Integration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Accept PayPal payments for donations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">PayPal Mode</Label>
                <Select 
                  value={settings.paypalMode} 
                  onValueChange={(v) => setSettings(prev => ({ ...prev, paypalMode: v as 'sandbox' | 'live' }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="live">Live (Production)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-slate-500 text-xs">Use Sandbox for testing, Live for real payments</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">PayPal Client ID</Label>
                <Input
                  value={settings.paypalClientId}
                  onChange={(e) => setSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">PayPal Client Secret</Label>
                <Input
                  type="password"
                  value={settings.paypalClientSecret}
                  onChange={(e) => setSettings(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter your PayPal Client Secret"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={settings.paypalClientId && settings.paypalClientSecret ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/50 text-amber-400"}>
                  {settings.paypalClientId && settings.paypalClientSecret ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-400" />
                Mailchimp Integration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sync members with your Mailchimp audience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Mailchimp API Key</Label>
                <Input
                  type="password"
                  value={settings.mailchimpApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, mailchimpApiKey: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Enter your Mailchimp API Key"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  Not Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Site Status */}
      {activeTab === 'site' && (
        <div className="space-y-6">
          {/* Site Mode Selection */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Site Mode</CardTitle>
              <CardDescription className="text-slate-400">
                Control how visitors see your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {/* Live Mode */}
                <div 
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    settings.siteMode === 'live' 
                      ? "border-emerald-500 bg-emerald-500/10" 
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                  onClick={() => setSettings(prev => ({ ...prev, siteMode: 'live' }))}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">Live</h4>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Recommended</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Your website is fully accessible to all visitors. Everyone can view all pages and content.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    settings.siteMode === 'live' ? "border-emerald-500" : "border-slate-600"
                  )}>
                    {settings.siteMode === 'live' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Coming Soon Mode */}
                <div 
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    settings.siteMode === 'coming_soon' 
                      ? "border-amber-500 bg-amber-500/10" 
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                  onClick={() => setSettings(prev => ({ ...prev, siteMode: 'coming_soon' }))}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Rocket className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">Coming Soon</h4>
                      <Badge className="bg-amber-500/20 text-amber-400 text-xs">Pre-Launch</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Show a countdown page with email subscription. Great for building anticipation before launch.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    settings.siteMode === 'coming_soon' ? "border-amber-500" : "border-slate-600"
                  )}>
                    {settings.siteMode === 'coming_soon' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div 
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    settings.siteMode === 'maintenance' 
                      ? "border-orange-500 bg-orange-500/10" 
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                  onClick={() => setSettings(prev => ({ ...prev, siteMode: 'maintenance' }))}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Wrench className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">Maintenance Mode</h4>
                      <Badge className="bg-orange-500/20 text-orange-400 text-xs">Temporary</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Display a maintenance message while you update your site. Admins can still access the site.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    settings.siteMode === 'maintenance' ? "border-orange-500" : "border-slate-600"
                  )}>
                    {settings.siteMode === 'maintenance' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                </div>

                {/* Private Mode */}
                <div 
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    settings.siteMode === 'private' 
                      ? "border-purple-500 bg-purple-500/10" 
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                  onClick={() => setSettings(prev => ({ ...prev, siteMode: 'private' }))}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">Private Mode</h4>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">Members Only</Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Only logged-in members can access the site. Visitors see a login page.
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    settings.siteMode === 'private' ? "border-purple-500" : "border-slate-600"
                  )}>
                    {settings.siteMode === 'private' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode-Specific Settings */}
          {(settings.siteMode === 'maintenance' || settings.siteMode === 'coming_soon') && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">
                  {settings.siteMode === 'coming_soon' ? 'Coming Soon Settings' : 'Maintenance Settings'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Customize what visitors see on the {settings.siteMode === 'coming_soon' ? 'coming soon' : 'maintenance'} page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Headline</Label>
                  <Input
                    value={settings.statusHeadline}
                    onChange={(e) => setSettings(prev => ({ ...prev, statusHeadline: e.target.value }))}
                    placeholder={settings.siteMode === 'coming_soon' ? 'Something Amazing is Coming!' : 'Under Maintenance'}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Message</Label>
                  <Input
                    value={settings.statusMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, statusMessage: e.target.value }))}
                    placeholder={settings.siteMode === 'coming_soon' 
                      ? 'We\'re building something special. Be the first to know when we launch!' 
                      : 'We\'re currently performing scheduled maintenance. Please check back soon.'}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {settings.siteMode === 'coming_soon' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Launch Date (Optional)</Label>
                      <Input
                        type="datetime-local"
                        value={settings.launchDate}
                        onChange={(e) => setSettings(prev => ({ ...prev, launchDate: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <p className="text-slate-500 text-xs">Show a countdown timer to your launch date</p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                      <div>
                        <h4 className="text-white font-medium">Email Collection</h4>
                        <p className="text-slate-400 text-sm">Allow visitors to subscribe for launch notification</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, collectEmails: !prev.collectEmails }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          settings.collectEmails ? "bg-amber-500" : "bg-slate-600"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          settings.collectEmails ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </>
                )}

                {settings.siteMode === 'maintenance' && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                    <div>
                      <h4 className="text-white font-medium">Show Progress</h4>
                      <p className="text-slate-400 text-sm">Display a progress bar to show maintenance status</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showProgress: !prev.showProgress }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        settings.showProgress ? "bg-orange-500" : "bg-slate-600"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settings.showProgress ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-300">Background Image (Optional)</Label>
                  <Input
                    value={settings.statusBackgroundImage}
                    onChange={(e) => setSettings(prev => ({ ...prev, statusBackgroundImage: e.target.value }))}
                    placeholder="https://example.com/background.jpg"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.statusContactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, statusContactEmail: e.target.value }))}
                    placeholder="support@yourchurch.org"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Private Mode Settings */}
          {settings.siteMode === 'private' && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Private Mode Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure who can access your site in private mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div>
                    <h4 className="text-white font-medium">Allow Registration</h4>
                    <p className="text-slate-400 text-sm">Let visitors create accounts to request access</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, allowRegistration: !prev.allowRegistration }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      settings.allowRegistration ? "bg-purple-500" : "bg-slate-600"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.allowRegistration ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div>
                    <h4 className="text-white font-medium">Show Login Form</h4>
                    <p className="text-slate-400 text-sm">Display login form for existing members</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showLoginForm: !prev.showLoginForm }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      settings.showLoginForm ? "bg-purple-500" : "bg-slate-600"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.showLoginForm ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Private Page Message</Label>
                  <Input
                    value={settings.privateMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, privateMessage: e.target.value }))}
                    placeholder="This site is private. Please log in to continue."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Allowed IPs for Admin Access */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Admin Access</CardTitle>
              <CardDescription className="text-slate-400">
                Admins can always access the site regardless of the current mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h4 className="text-white font-medium">Admin Bypass Enabled</h4>
                    <p className="text-emerald-400 text-sm">You can always access the admin panel and preview the site</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-slate-900/50 border-slate-800 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-400">
                Irreversible actions for your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <h4 className="text-white font-medium">Clear All Data</h4>
                  <p className="text-slate-400 text-sm">Delete all data and reset the database</p>
                </div>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  Clear Data
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                <div>
                  <h4 className="text-white font-medium">Export All Data</h4>
                  <p className="text-slate-400 text-sm">Download all your data as JSON backup</p>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                <div>
                  <h4 className="text-white font-medium">Import Data</h4>
                  <p className="text-slate-400 text-sm">Restore data from a JSON backup file</p>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                Feature Management
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enable or disable features across your website. Disabled features will be hidden from navigation and pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Events Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Events</h4>
                    <p className="text-slate-400 text-sm">Event listings, registration, and calendar</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, eventsEnabled: !prev.features.eventsEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.eventsEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.eventsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Sermons Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Sermons</h4>
                    <p className="text-slate-400 text-sm">Sermon library, audio/video, and notes</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, sermonsEnabled: !prev.features.sermonsEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.sermonsEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.sermonsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Prayer Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Prayer Requests</h4>
                    <p className="text-slate-400 text-sm">Prayer submission and tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, prayerEnabled: !prev.features.prayerEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.prayerEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.prayerEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Donations Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Donations</h4>
                    <p className="text-slate-400 text-sm">Online giving and donation tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, donationsEnabled: !prev.features.donationsEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.donationsEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.donationsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Small Groups Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <UsersRound className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Small Groups</h4>
                    <p className="text-slate-400 text-sm">Group management and membership</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, smallGroupsEnabled: !prev.features.smallGroupsEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.smallGroupsEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.smallGroupsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Contact Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Contact Page</h4>
                    <p className="text-slate-400 text-sm">Contact form and information</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, contactEnabled: !prev.features.contactEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.contactEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.contactEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* About Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">About Page</h4>
                    <p className="text-slate-400 text-sm">Church information and team</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, aboutEnabled: !prev.features.aboutEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.aboutEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.aboutEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Member Features */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" />
                Member Features
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control member-related functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Registration Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">User Registration</h4>
                    <p className="text-slate-400 text-sm">Allow new users to create accounts</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, registrationEnabled: !prev.features.registrationEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.registrationEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.registrationEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Member Dashboard Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Member Dashboard</h4>
                    <p className="text-slate-400 text-sm">Personal dashboard for members</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, memberDashboardEnabled: !prev.features.memberDashboardEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.memberDashboardEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.memberDashboardEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Notifications Feature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Notifications</h4>
                    <p className="text-slate-400 text-sm">In-app notifications for users</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    features: { ...prev.features, notificationsEnabled: !prev.features.notificationsEnabled } 
                  }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.features.notificationsEnabled ? "bg-amber-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.features.notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-900/50 border-slate-800 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium">How Feature Toggles Work</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    When you disable a feature, it will be hidden from the navigation menu and users won&apos;t be able to access it. 
                    Admins can still access all features regardless of their enabled status. Changes take effect immediately after saving.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Login Tab */}
      {activeTab === 'social' && (
        <SocialLoginSettings />
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <EmailSettingsView />
      )}

      {/* SMS Settings Tab */}
      {activeTab === 'sms' && (
        <SmsSettingsView />
      )}

      {/* Password & Security Tab */}
      {activeTab === 'security' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-400" />
              Password & Security
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your administrative password.
            </CardDescription>
          </CardHeader>
           <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Current Password</Label>
                <div className="relative group">
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                    className="bg-slate-800 border-slate-700 text-white h-11 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">New Password</Label>
                <div className="relative group">
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="At least 8 characters"
                    className="bg-slate-800 border-slate-700 text-white h-11 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                  <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Confirm New Password</Label>
                <div className="relative group">
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    className="bg-slate-800 border-slate-700 text-white h-11 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                  />
                  <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {passwordMessage && (
                <div className={cn(
                  "p-3 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                  passwordMessage.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    passwordMessage.type === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
                  )}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <span className="font-medium">{passwordMessage.text}</span>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isUpdatingPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isUpdatingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button - only show for tabs that use the main settings state */}
      {activeTab !== 'social' && activeTab !== 'verification' && activeTab !== 'security' && (
        <div className="flex items-center justify-end gap-3">
          {saveMessage && (
            <span className={cn(
              "text-sm",
              saveMessage.type === 'success' ? "text-emerald-400" : "text-red-400"
            )}>
              {saveMessage.text}
            </span>
          )}
          <Button variant="outline" className="border-slate-700 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={() => handleSave()} 
            disabled={isSubmitting || isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      )}
          </div>
        </div>
      )}
    </div>
  );
}

// Activity Log Content Component
function ActivityLogContent() {
  const [activities, setActivities] = useState([
    { id: '1', action: 'User login', user: 'Admin', entityType: 'User', createdAt: new Date().toISOString() },
    { id: '2', action: 'Event created', user: 'Pastor John', entityType: 'Event', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', action: 'Sermon published', user: 'Admin', entityType: 'Sermon', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', action: 'Donation received', user: 'System', entityType: 'Donation', createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: '5', action: 'Member registered', user: 'Visitor', entityType: 'User', createdAt: new Date(Date.now() - 14400000).toISOString() },
  ]);

  const getActionIcon = (entityType: string) => {
    switch (entityType) {
      case 'User': return Users;
      case 'Event': return Calendar;
      case 'Sermon': return BookOpen;
      case 'Donation': return DollarSign;
      default: return Activity;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-slate-400">
            Track all actions performed in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActionIcon(activity.entityType);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-slate-400 text-sm">by {activity.user}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {activity.entityType}
                      </Badge>
                      <p className="text-slate-500 text-xs mt-1">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Media interface
interface Media {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  description: string | null;
  tags: string | null;
  folder: string | null;
  createdAt: string;
}

// Testimony interface
interface Testimony {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  testimony: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Testimonies Content Component
function TestimoniesContent() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null);
  const [deletingTestimony, setDeletingTestimony] = useState<Testimony | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    testimony: '',
    rating: 5,
    isApproved: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchTestimonies();
  }, [filter]);

  const fetchTestimonies = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'approved') params.append('approved', 'true');
      
      const res = await fetch(`/api/testimonies?${params.toString()}`);
      const data = await res.json();
      setTestimonies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
      setTestimonies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'images');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.testimony) return;
    
    setIsSubmitting(true);
    try {
      if (editingTestimony) {
        const res = await fetch('/api/testimonies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTestimony.id,
            ...formData,
          }),
        });
        if (res.ok) {
          setIsDialogOpen(false);
          setEditingTestimony(null);
          resetForm();
          fetchTestimonies();
        }
      } else {
        const res = await fetch('/api/testimonies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsDialogOpen(false);
          resetForm();
          fetchTestimonies();
        }
      }
    } catch (error) {
      console.error('Error saving testimony:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTestimony) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/testimonies?id=${deletingTestimony.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsDeleteDialogOpen(false);
        setDeletingTestimony(null);
        fetchTestimonies();
      }
    } catch (error) {
      console.error('Error deleting testimony:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (testimony: Testimony) => {
    setEditingTestimony(testimony);
    setFormData({
      name: testimony.name,
      role: testimony.role || '',
      image: testimony.image || '',
      testimony: testimony.testimony,
      rating: testimony.rating,
      isApproved: testimony.isApproved,
      isFeatured: testimony.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const toggleApproval = async (testimony: Testimony) => {
    try {
      await fetch('/api/testimonies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testimony.id,
          isApproved: !testimony.isApproved,
        }),
      });
      fetchTestimonies();
    } catch (error) {
      console.error('Error toggling approval:', error);
    }
  };

  const toggleFeatured = async (testimony: Testimony) => {
    try {
      await fetch('/api/testimonies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testimony.id,
          isFeatured: !testimony.isFeatured,
        }),
      });
      fetchTestimonies();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      image: '',
      testimony: '',
      rating: 5,
      isApproved: true,
      isFeatured: false,
    });
  };

  const StarRating = ({ rating, onChange }: { rating: number; onChange?: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-colors",
            onChange ? "cursor-pointer hover:scale-110" : "cursor-default",
            star <= rating ? "text-amber-400" : "text-slate-600"
          )}
        >
          <Sparkles className="h-5 w-5" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Testimonies</h2>
          <p className="text-slate-400">Manage testimonials for your homepage</p>
        </div>
        <div className="flex gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'approved' | 'pending')}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Testimonies</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              resetForm();
              setEditingTestimony(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimony
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Total</p>
                <p className="text-white font-semibold text-xl">{testimonies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Approved</p>
                <p className="text-white font-semibold text-xl">{testimonies.filter(t => t.isApproved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Featured</p>
                <p className="text-white font-semibold text-xl">{testimonies.filter(t => t.isFeatured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : testimonies.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400">No testimonies found</p>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              variant="outline"
              className="mt-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              Add your first testimony
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonies.map((testimony) => (
            <Card key={testimony.id} className={cn(
              "bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all",
              testimony.isFeatured && "border-amber-500/50 bg-amber-500/5"
            )}>
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {testimony.image ? (
                      <img src={testimony.image} alt={testimony.name} className="h-12 w-12 rounded-full object-cover border-2 border-amber-500/30" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {testimony.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-medium">{testimony.name}</h4>
                      {testimony.role && (
                        <p className="text-slate-500 text-sm">{testimony.role}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                      <DropdownMenuItem onClick={() => handleEdit(testimony)} className="hover:bg-slate-700 cursor-pointer">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleApproval(testimony)} className="hover:bg-slate-700 cursor-pointer">
                        {testimony.isApproved ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Unapprove
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFeatured(testimony)} className="hover:bg-slate-700 cursor-pointer">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {testimony.isFeatured ? 'Unfeature' : 'Feature'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem 
                        onClick={() => {
                          setDeletingTestimony(testimony);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="hover:bg-red-500/10 text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <StarRating rating={testimony.rating} />
                </div>

                {/* Testimony Text */}
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 italic">
                  &ldquo;{testimony.testimony}&rdquo;
                </p>

                {/* Status Badges */}
                <div className="flex gap-2 mt-4">
                  {testimony.isApproved ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-400 border-0">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {testimony.isFeatured && (
                    <Badge className="bg-purple-500/20 text-purple-400 border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Date */}
                <p className="text-slate-600 text-xs mt-3">
                  {new Date(testimony.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-white max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTestimony ? 'Edit Testimony' : 'Add New Testimony'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingTestimony ? 'Update the testimony details below.' : 'Fill in the details for the new testimony.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-slate-300">Photo</Label>
              <input
                type="file"
                id="testimony-image"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="Preview" className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/30" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="testimony-image"
                    className="h-16 w-16 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-amber-500 transition"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-500" />
                    )}
                  </label>
                )}
                <div className="flex-1">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-slate-300">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-slate-300">Role / Title</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Church Member, Pastor, Visitor..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-slate-300">Rating</Label>
              <StarRating rating={formData.rating} onChange={(r) => setFormData(prev => ({ ...prev, rating: r }))} />
            </div>

            {/* Testimony */}
            <div className="space-y-2">
              <Label className="text-slate-300">Testimony *</Label>
              <textarea
                value={formData.testimony}
                onChange={(e) => setFormData(prev => ({ ...prev, testimony: e.target.value }))}
                placeholder="Share the testimony..."
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isApproved}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isApproved: checked }))}
                />
                <Label className="text-slate-300 text-sm">Approved</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label className="text-slate-300 text-sm">Featured</Label>
              </div>
            </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.testimony}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {editingTestimony ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Testimony</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this testimony from {deletingTestimony?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Media Library Content Component
function MediaLibraryContent() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tags: '',
    folder: '',
  });

  useEffect(() => {
    fetchMedia();
  }, [typeFilter]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      setMediaList(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMedia();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMediaList(prev => [data.media, ...prev]);
        setIsUploadDialogOpen(false);
        toast({
          title: "Success",
          description: "Media uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: `${data.error || "Failed to upload media."} ${data.details ? `(${data.details})` : ""}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload. Please check your connection or file size.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedMedia) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setMediaList(prev => prev.map(m => m.id === selectedMedia.id ? updated : m));
        setIsEditDialogOpen(false);
        setSelectedMedia(null);
        toast({
          title: "Success",
          description: "Media details updated.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update media details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating media:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMediaList(prev => prev.filter(m => m.id !== selectedMedia.id));
        setIsDeleteDialogOpen(false);
        setSelectedMedia(null);
        toast({
          title: "Deleted",
          description: "Media removed from library.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Delete Failed",
          description: data.error || "Failed to delete media.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const openEditDialog = (media: Media) => {
    setSelectedMedia(media);
    setEditForm({
      name: media.name,
      description: media.description || '',
      tags: media.tags || '',
      folder: media.folder || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (media: Media) => {
    setSelectedMedia(media);
    setIsDeleteDialogOpen(true);
  };

  const openPreviewDialog = (media: Media) => {
    setSelectedMedia(media);
    setIsPreviewDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-pink-400 bg-pink-500/20';
      case 'video': return 'text-blue-400 bg-blue-500/20';
      case 'audio': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-amber-400 bg-amber-500/20';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const filteredMedia = mediaList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search media..." 
              className="pl-10 w-64 bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'grid' ? 'bg-amber-500 text-black' : 'text-slate-400'}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={viewMode === 'list' ? 'bg-amber-500 text-black' : 'text-slate-400'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Upload images, videos, audio, or documents for later use.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={handleUpload}
                    className="hidden"
                    id="media-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-amber-400 animate-spin mb-4" />
                        <p className="text-slate-400">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-white font-medium mb-2">Click to upload or drag and drop</p>
                        <p className="text-slate-400 text-sm">
                          Images, Videos, Audio, Documents (max 50MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'All Files', value: mediaList.length, icon: FolderOpen, color: 'amber' },
          { label: 'Images', value: mediaList.filter(m => m.type === 'image').length, icon: ImageIcon, color: 'pink' },
          { label: 'Videos', value: mediaList.filter(m => m.type === 'video').length, icon: Video, color: 'blue' },
          { label: 'Audio', value: mediaList.filter(m => m.type === 'audio').length, icon: Music, color: 'purple' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-white text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMedia.map((media) => {
            const TypeIcon = getTypeIcon(media.type);
            const typeColor = getTypeColor(media.type);
            
            return (
              <Card 
                key={media.id} 
                className="bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition group cursor-pointer"
                onClick={() => openPreviewDialog(media)}
              >
                <CardContent className="p-3">
                  {/* Preview */}
                  <div className="aspect-square rounded-lg bg-slate-800 mb-3 overflow-hidden flex items-center justify-center relative">
                    {media.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt={media.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl ${typeColor.split(' ')[1]} flex items-center justify-center`}>
                        <TypeIcon className={`h-8 w-8 ${typeColor.split(' ')[0]}`} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); openEditDialog(media); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); copyToClipboard(media.url); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20" onClick={(e) => { e.stopPropagation(); openDeleteDialog(media); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Info */}
                  <p className="text-white font-medium truncate text-sm">{media.name}</p>
                  <p className="text-slate-400 text-xs truncate">{formatFileSize(media.size)}</p>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredMedia.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No media found</p>
              <p className="text-sm">Upload files to get started</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <table className="w-full">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Preview</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Name</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Type</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Size</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((media) => {
                    const TypeIcon = getTypeIcon(media.type);
                    const typeColor = getTypeColor(media.type);
                    
                    return (
                      <tr key={media.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                            {media.type === 'image' ? (
                              <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                            ) : (
                              <TypeIcon className={`h-5 w-5 ${typeColor.split(' ')[0]}`} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white">{media.name}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${typeColor.split(' ')[1]} ${typeColor.split(' ')[0]} border-0`}>
                            {media.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatFileSize(media.size)}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(media.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => openPreviewDialog(media)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => copyToClipboard(media.url)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => openEditDialog(media)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => openDeleteDialog(media)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredMedia.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No media found</p>
                        <p className="text-sm">Upload files to get started</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-300">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Tags (comma separated)</Label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="sermon, sunday, worship"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Folder</Label>
              <Input
                value={editForm.folder}
                onChange={(e) => setEditForm(prev => ({ ...prev, folder: e.target.value }))}
                placeholder="sermons/2024"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this file? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
                {selectedMedia.type === 'image' ? (
                  <img src={selectedMedia.url} alt={selectedMedia.name} className="w-full h-full object-cover" />
                ) : (
                  <File className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">{selectedMedia.name}</p>
                <p className="text-sm text-slate-400">{formatFileSize(selectedMedia.size)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isSubmitting} variant="destructive" className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                {selectedMedia.type === 'image' && (
                  <img src={selectedMedia.url} alt={selectedMedia.name} className="max-h-[400px] object-contain" />
                )}
                {selectedMedia.type === 'video' && (
                  <video src={selectedMedia.url} controls className="max-h-[400px] w-full" />
                )}
                {selectedMedia.type === 'audio' && (
                  <audio src={selectedMedia.url} controls className="w-full" />
                )}
                {selectedMedia.type === 'document' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <File className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-slate-400">Document preview not available</p>
                    <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-amber-400 hover:text-amber-300">
                      Download File
                    </a>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Type:</span>
                  <Badge className={`ml-2 ${getTypeColor(selectedMedia.type).split(' ')[1]} ${getTypeColor(selectedMedia.type).split(' ')[0]} border-0`}>
                    {selectedMedia.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400">Size:</span>
                  <span className="ml-2 text-white">{formatFileSize(selectedMedia.size)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">URL:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                      {selectedMedia.url}
                    </code>
                    <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => copyToClipboard(selectedMedia.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)} className="border-slate-700 text-slate-300">
              Close
            </Button>
            {selectedMedia && (
              <Button onClick={() => copyToClipboard(selectedMedia.url)} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
