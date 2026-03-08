'use client';

import { useEffect, useState } from 'react';
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
  Users, Calendar, BookOpen, DollarSign, Heart, Church, Home, Settings,
  TrendingUp, Activity, Clock, CheckCircle2, AlertCircle, Video,
  BarChart3, ArrowUpRight, ArrowDownRight, Plus, Search, Bell,
  Mail, UserPlus, ChevronRight, Layers, MessageSquare, UsersRound,
  Megaphone, FileText, PieChart as PieChartIcon, FolderOpen, Play,
  MonitorPlay, MapPin, ZoomIn, Globe, Gift, Target, Award, Sparkles,
  MoreHorizontal, Pencil, Trash2, Eye, Loader2, Download, Upload,
  Rocket, Wrench, Lock, Shield, AlertTriangle, Archive, LayoutDashboard,
  Smartphone, Send, TestTube, Pause, Play as PlayIcon, RefreshCw,
  Image as ImageIcon, Music, File, FolderClosed, Grid, List, X, Check, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmsContent } from './SmsContent';
import { MediaPicker } from './MediaPicker';
import { EmailSubscriptionContent } from './EmailSubscriptionContent';
import { SocialLoginSettings } from './SocialLoginSettings';
import { EmailVerificationSettings } from './EmailVerificationSettings';

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
}

interface ChartData {
  donationTrends: Array<{ month: string; amount: number; donors: number }>;
  memberGrowth: Array<{ month: string; newMembers: number }>;
  eventsByType: Array<{ name: string; value: number }>;
  usersByRole: Array<{ name: string; value: number }>;
  prayersByStatus: Array<{ name: string; value: number }>;
  registrationsByStatus: Array<{ name: string; value: number }>;
}

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  isActive: boolean;
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
  viewCount: number;
  downloadCount: number;
  publishedAt: string | null;
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
  type: string | null;
  location: string | null;
  meetingDay: string | null;
  _count: { members: number };
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
      { id: 'sms', label: 'SMS Center', icon: MessageSquare },
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
  const { user, isAuthenticated, setCurrentView } = useAppStore();
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
    totalGroups: 0, activeGroups: 0, groupMembers: 0, totalVisitors: 0
  });
  const [charts, setCharts] = useState<ChartData>({
    donationTrends: [], memberGrowth: [], eventsByType: [], usersByRole: [],
    prayersByStatus: [], registrationsByStatus: []
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
      
      setStats(data.stats);
      setCharts(data.charts);
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
      case 'groups':
        return <GroupsContent groups={groups} />;
      case 'settings':
        return <SettingsContent />;
      case 'activity':
        return <ActivityLogContent />;
      case 'sms':
        return <SmsContent />;
      case 'email-subscriptions':
        return <EmailSubscriptionContent />;
      case 'media':
        return <MediaLibraryContent />;
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
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Church className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">GraceAdmin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
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
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'MEMBER' });
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
        setNewMember({ name: '', email: '', role: 'MEMBER' });
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
                <p className="text-purple-200 text-sm font-medium">Prayer Requests</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pendingPrayers}</p>
                <p className="text-purple-300 text-xs mt-2 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {stats.answeredPrayers} answered
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Heart className="h-7 w-7 text-purple-400" />
              </div>
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
    role: 'MEMBER',
    phone: '',
  });

  // Form state for edit member
  const [editMember, setEditMember] = useState({
    name: '',
    email: '',
    role: 'MEMBER',
    isActive: true,
  });

  useEffect(() => {
    setMemberList(members);
  }, [members]);

  const filteredMembers = memberList.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          password: 'password123', // Default password
        }),
      });
      
      if (res.ok) {
        const createdMember = await res.json();
        setMemberList(prev => [createdMember, ...prev]);
        setNewMember({ name: '', email: '', role: 'MEMBER', phone: '' });
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
        body: JSON.stringify(editMember),
      });
      
      if (res.ok) {
        setMemberList(prev => prev.map(m => 
          m.id === selectedMember.id 
            ? { ...m, ...editMember }
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
      role: member.role,
      isActive: member.isActive,
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
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the details for the new member. They will receive an email to set their password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-slate-300">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-slate-300">Role</Label>
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
                {filteredMembers.map((member) => (
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Role</p>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 mt-1">
                    {selectedMember.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <Badge className={selectedMember.isActive ? "bg-emerald-500/20 text-emerald-400 mt-1" : "bg-red-500/20 text-red-400 mt-1"}>
                    {selectedMember.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-white">{formatDate(selectedMember.createdAt)}</p>
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the member&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-slate-300">Full Name</Label>
              <Input
                id="edit-name"
                value={editMember.name}
                onChange={(e) => setEditMember(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-slate-300">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editMember.email}
                onChange={(e) => setEditMember(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role" className="text-slate-300">Role</Label>
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

// Sermons Content Component
function SermonsContent({ sermons, formatDate }: { sermons: Sermon[]; formatDate: (date: string) => string }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sermonList, setSermonList] = useState<Sermon[]>(sermons);
  const [filter, setFilter] = useState<'popular' | 'recent' | 'all'>('popular');
  
  // Media Picker states
  const [isVideoPickerOpen, setIsVideoPickerOpen] = useState(false);
  const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
  const [isEditVideoPickerOpen, setIsEditVideoPickerOpen] = useState(false);
  const [isEditAudioPickerOpen, setIsEditAudioPickerOpen] = useState(false);

  useEffect(() => {
    setSermonList(sermons);
  }, [sermons]);

  // Form state for new sermon
  const [newSermon, setNewSermon] = useState({
    title: '',
    description: '',
    speakerName: '',
    scripture: '',
    videoUrl: '',
    audioUrl: '',
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
    if (!newSermon.title || !newSermon.speakerName) return;
    
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
      
      if (res.ok) {
        const createdSermon = await res.json();
        setSermonList(prev => [createdSermon, ...prev]);
        setNewSermon({ title: '', description: '', speakerName: '', scripture: '', videoUrl: '', audioUrl: '', seriesId: '', tags: '', isFeatured: false });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating sermon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSermon = async () => {
    if (!selectedSermon || !editSermon.title) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/sermons/${selectedSermon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSermon),
      });
      
      if (res.ok) {
        setSermonList(prev => prev.map(s => 
          s.id === selectedSermon.id 
            ? { ...s, ...editSermon }
            : s
        ));
        setIsEditDialogOpen(false);
        setSelectedSermon(null);
      }
    } catch (error) {
      console.error('Error editing sermon:', error);
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
      }
    } catch (error) {
      console.error('Error deleting sermon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setEditSermon({
      title: sermon.title,
      description: '',
      speakerName: sermon.speakerName,
      scripture: '',
      videoUrl: '',
      audioUrl: '',
      isFeatured: false,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant={filter === 'popular' ? 'default' : 'outline'}
            className={filter === 'popular' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('popular')}
          >
            Most Popular
          </Button>
          <Button 
            variant={filter === 'recent' ? 'default' : 'outline'}
            className={filter === 'recent' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'border-slate-600 text-slate-300'}
            onClick={() => setFilter('recent')}
          >
            Recently Published
          </Button>
        </div>
        
        {/* Add Sermon Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Sermon</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the details for the new sermon.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sermon-title" className="text-slate-300">Sermon Title</Label>
                <Input
                  id="sermon-title"
                  value={newSermon.title}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Walking in Faith"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-speaker" className="text-slate-300">Speaker Name</Label>
                <Input
                  id="sermon-speaker"
                  value={newSermon.speakerName}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, speakerName: e.target.value }))}
                  placeholder="Pastor John Smith"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-scripture" className="text-slate-300">Scripture Reference</Label>
                <Input
                  id="sermon-scripture"
                  value={newSermon.scripture}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, scripture: e.target.value }))}
                  placeholder="John 3:16-17"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-description" className="text-slate-300">Description</Label>
                <Input
                  id="sermon-description"
                  value={newSermon.description}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A message about faith and trust in God..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-video" className="text-slate-300">Video</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      id="sermon-video"
                      value={newSermon.videoUrl}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-amber-500/50 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'video');
                            try {
                              const res = await fetch('/api/upload', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.url) {
                                setNewSermon(prev => ({ ...prev, videoUrl: data.url }));
                              }
                            } catch (err) {
                              console.error('Upload error:', err);
                            }
                          }
                        }}
                        className="hidden"
                        id="video-upload-create"
                      />
                      <label htmlFor="video-upload-create" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-400">Click to upload video</p>
                        <p className="text-xs text-slate-500">MP4, WebM, MOV (max 50MB)</p>
                      </label>
                    </div>
                  </TabsContent>
                  <TabsContent value="library" className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSermon.videoUrl}
                        onChange={(e) => setNewSermon(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="Select from media library..."
                        className="bg-slate-800 border-slate-700 text-white"
                        readOnly
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        className="border-slate-700 text-slate-300 shrink-0"
                        onClick={() => setIsVideoPickerOpen(true)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-audio" className="text-slate-300">Audio</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      id="sermon-audio"
                      value={newSermon.audioUrl}
                      onChange={(e) => setNewSermon(prev => ({ ...prev, audioUrl: e.target.value }))}
                      placeholder="https://example.com/audio.mp3"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-amber-500/50 transition-colors">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'audio');
                            try {
                              const res = await fetch('/api/upload', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.url) {
                                setNewSermon(prev => ({ ...prev, audioUrl: data.url }));
                              }
                            } catch (err) {
                              console.error('Upload error:', err);
                            }
                          }
                        }}
                        className="hidden"
                        id="audio-upload-create"
                      />
                      <label htmlFor="audio-upload-create" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-400">Click to upload audio</p>
                        <p className="text-xs text-slate-500">MP3, WAV, M4A (max 50MB)</p>
                      </label>
                    </div>
                  </TabsContent>
                  <TabsContent value="library" className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSermon.audioUrl}
                        onChange={(e) => setNewSermon(prev => ({ ...prev, audioUrl: e.target.value }))}
                        placeholder="Select from media library..."
                        className="bg-slate-800 border-slate-700 text-white"
                        readOnly
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        className="border-slate-700 text-slate-300 shrink-0"
                        onClick={() => setIsAudioPickerOpen(true)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sermon-tags" className="text-slate-300">Tags (comma separated)</Label>
                <Input
                  id="sermon-tags"
                  value={newSermon.tags}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="faith, trust, prayer"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sermon-featured"
                  checked={newSermon.isFeatured}
                  onChange={(e) => setNewSermon(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                />
                <Label htmlFor="sermon-featured" className="text-slate-300">Featured Sermon</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button onClick={handleCreateSermon} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Sermon
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
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Sermon</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Speaker</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Views</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Downloads</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Published</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSermons.map((sermon) => (
                  <tr key={sermon.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Play className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-white font-medium">{sermon.title}</span>
                          {sermon.viewCount > 500 && (
                            <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-xs">Popular</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{sermon.speakerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Video className="h-4 w-4" />
                        {sermon.viewCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ArrowDownRight className="h-4 w-4" />
                        {sermon.downloadCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {sermon.publishedAt ? formatDate(sermon.publishedAt) : 'Draft'}
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
                            onClick={() => openViewDialog(sermon)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            onClick={() => openEditDialog(sermon)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Sermon
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem 
                            className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                            onClick={() => openDeleteDialog(sermon)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Sermon
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {sortedSermons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No sermons found</p>
                      <p className="text-sm">Add your first sermon to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Sermon Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Sermon Details</DialogTitle>
          </DialogHeader>
          {selectedSermon && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Play className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSermon.title}</h3>
                  <p className="text-slate-400">by {selectedSermon.speakerName}</p>
                </div>
              </div>
              <Separator className="bg-slate-800" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Views</p>
                  <p className="text-white flex items-center gap-1">
                    <Video className="h-4 w-4 text-amber-400" />
                    {selectedSermon.viewCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Downloads</p>
                  <p className="text-white flex items-center gap-1">
                    <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                    {selectedSermon.downloadCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Published</p>
                  <p className="text-white">
                    {selectedSermon.publishedAt ? formatDate(selectedSermon.publishedAt) : 'Draft'}
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
              if (selectedSermon) openEditDialog(selectedSermon);
            }} className="bg-amber-500 hover:bg-amber-600 text-black">
              Edit Sermon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sermon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Sermon</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the sermon information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-sermon-title" className="text-slate-300">Sermon Title</Label>
              <Input
                id="edit-sermon-title"
                value={editSermon.title}
                onChange={(e) => setEditSermon(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sermon-speaker" className="text-slate-300">Speaker Name</Label>
              <Input
                id="edit-sermon-speaker"
                value={editSermon.speakerName}
                onChange={(e) => setEditSermon(prev => ({ ...prev, speakerName: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sermon-scripture" className="text-slate-300">Scripture Reference</Label>
              <Input
                id="edit-sermon-scripture"
                value={editSermon.scripture}
                onChange={(e) => setEditSermon(prev => ({ ...prev, scripture: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Video</Label>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <Input
                    id="edit-sermon-video"
                    value={editSermon.videoUrl}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-amber-500/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', 'video');
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setEditSermon(prev => ({ ...prev, videoUrl: data.url }));
                            }
                          } catch (err) {
                            console.error('Upload error:', err);
                          }
                        }
                      }}
                      className="hidden"
                      id="video-upload-edit"
                    />
                    <label htmlFor="video-upload-edit" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-400">Click to upload video</p>
                      <p className="text-xs text-slate-500">MP4, WebM, MOV (max 50MB)</p>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-300">Audio</Label>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-2">
                  <Input
                    id="edit-sermon-audio"
                    value={editSermon.audioUrl}
                    onChange={(e) => setEditSermon(prev => ({ ...prev, audioUrl: e.target.value }))}
                    placeholder="https://example.com/audio.mp3"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-amber-500/50 transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', 'audio');
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setEditSermon(prev => ({ ...prev, audioUrl: data.url }));
                            }
                          } catch (err) {
                            console.error('Upload error:', err);
                          }
                        }
                      }}
                      className="hidden"
                      id="audio-upload-edit"
                    />
                    <label htmlFor="audio-upload-edit" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-400">Click to upload audio</p>
                      <p className="text-xs text-slate-500">MP3, WAV, M4A (max 50MB)</p>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-sermon-featured"
                checked={editSermon.isFeatured}
                onChange={(e) => setEditSermon(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              <Label htmlFor="edit-sermon-featured" className="text-slate-300">Featured Sermon</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditSermon} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
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
            <DialogTitle>Delete Sermon</DialogTitle>
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
function GroupsContent({ groups }: { groups: SmallGroup[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-cyan-500/20 text-cyan-400">{group.type || 'General'}</Badge>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{group._count.members}</span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">{group.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="h-4 w-4" />
                {group.location || 'Location TBD'}
              </div>
              {group.meetingDay && (
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
                  <Clock className="h-4 w-4" />
                  {group.meetingDay}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
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
  const { settings: globalSettings, setSettings: setGlobalSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'logo' | 'seo' | 'api' | 'site' | 'features' | 'social' | 'verification'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
    socialTwitter: 'https://twitter.com/gracechurch',
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
  });

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

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        // Update global settings so Navbar and Footer reflect changes immediately
        setGlobalSettings({
          siteName: settings.siteName,
          siteTagline: settings.siteTagline,
          siteDescription: settings.siteDescription,
          siteUrl: settings.siteUrl,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          address: settings.address,
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl,
          metaTitle: settings.metaTitle,
          metaDescription: settings.metaDescription,
          metaKeywords: settings.metaKeywords,
          socialFacebook: settings.socialFacebook,
          socialTwitter: settings.socialTwitter,
          socialInstagram: settings.socialInstagram,
          socialYoutube: settings.socialYoutube,
          siteMode: settings.siteMode,
          statusHeadline: settings.statusHeadline,
          statusMessage: settings.statusMessage,
          launchDate: settings.launchDate,
          collectEmails: settings.collectEmails,
          showProgress: settings.showProgress,
          statusBackgroundImage: settings.statusBackgroundImage,
          statusContactEmail: settings.statusContactEmail,
          allowRegistration: settings.allowRegistration,
          showLoginForm: settings.showLoginForm,
          privateMessage: settings.privateMessage,
          features: settings.features,
        });
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Site Info', icon: Church, category: 'General' },
    { id: 'logo', label: 'Logo & Branding', icon: Sparkles, category: 'General' },
    { id: 'seo', label: 'SEO', icon: FileText, category: 'General' },
    { id: 'api', label: 'API Keys', icon: Settings, category: 'Integrations' },
    { id: 'site', label: 'Site Status', icon: Activity, category: 'System' },
    { id: 'features', label: 'Features', icon: Layers, category: 'System' },
    { id: 'social', label: 'Social Login', icon: Users, category: 'Authentication' },
    { id: 'verification', label: 'Email Verification', icon: Mail, category: 'Authentication' },
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
              Upload your church logo and favicon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Label className="text-slate-300">Church Logo</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-amber-500 transition cursor-pointer">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-24 mx-auto mb-4" />
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Church className="h-12 w-12 text-amber-400" />
                    </div>
                  )}
                  <p className="text-slate-400 text-sm">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-xs mt-1">PNG, JPG or SVG (max 2MB)</p>
                </div>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="Or enter logo URL"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-slate-300">Favicon</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-amber-500 transition cursor-pointer">
                  {settings.faviconUrl ? (
                    <img src={settings.faviconUrl} alt="Favicon" className="h-16 w-16 mx-auto mb-4" />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <p className="text-slate-400 text-sm">Click to upload favicon</p>
                  <p className="text-slate-500 text-xs mt-1">ICO, PNG (32x32 or 64x64)</p>
                </div>
                <Input
                  value={settings.faviconUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                  placeholder="Or enter favicon URL"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
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
                  <Label className="text-slate-300">Twitter/X URL</Label>
                  <Input
                    value={settings.socialTwitter}
                    onChange={(e) => setSettings(prev => ({ ...prev, socialTwitter: e.target.value }))}
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

      {/* Email Verification Tab */}
      {activeTab === 'verification' && (
        <EmailVerificationSettings />
      )}

      {/* Save Button - only show for tabs that use the main settings state */}
      {activeTab !== 'social' && activeTab !== 'verification' && (
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
            onClick={handleSave} 
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

// Media Library Content Component
function MediaLibraryContent() {
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

      if (res.ok) {
        const data = await res.json();
        setMediaList(prev => [data.media, ...prev]);
        setIsUploadDialogOpen(false);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
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
      }
    } catch (error) {
      console.error('Error updating media:', error);
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
      }
    } catch (error) {
      console.error('Error deleting media:', error);
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
