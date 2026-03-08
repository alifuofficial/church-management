'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Mail, Users, Send, Settings, Plus, Search, MoreHorizontal,
  Eye, Pencil, Trash2, CheckCircle2, XCircle, Clock, Loader2,
  TestTube, RefreshCw, BarChart3, Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  isVerified: boolean;
  isSubscribed: boolean;
  subscribedAt: string;
  createdAt: string;
}

interface EmailSettings {
  id: string;
  provider: string;
  isActive: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
  smtpSecure: boolean;
  mailchimpApiKey: string | null;
  mailchimpServer: string | null;
  mailchimpListId: string | null;
  mailchimpFromEmail: string | null;
  mailchimpFromName: string | null;
  defaultFrequency: string;
  includeUnsubscribeLink: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
}

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  frequency: string;
  scheduledFor: string | null;
  status: string;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  sentAt: string | null;
  createdAt: string;
  _count?: { logs: number };
}

// Main Component
export function EmailSubscriptionContent() {
  const [activeTab, setActiveTab] = useState('subscribers');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Subscriptions</h2>
          <p className="text-slate-400">Manage subscribers, configure email settings, and send newsletters</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Users className="h-4 w-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="newsletters" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Megaphone className="h-4 w-4 mr-2" />
            Newsletters
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Settings className="h-4 w-4 mr-2" />
            Email Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <SubscribersTab />
        </TabsContent>

        <TabsContent value="newsletters">
          <NewslettersTab />
        </TabsContent>

        <TabsContent value="settings">
          <EmailSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Subscribers Tab
function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '', phone: '' });

  useEffect(() => {
    fetchSubscribers();
  }, [searchQuery, statusFilter]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const res = await fetch(`/api/subscribers?${params}`);
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSubscriber, source: 'manual' }),
      });
      
      if (res.ok) {
        fetchSubscribers();
        setNewSubscriber({ email: '', name: '', phone: '' });
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubscribed = async (subscriber: Subscriber) => {
    try {
      await fetch(`/api/subscribers/${subscriber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSubscribed: !subscriber.isSubscribed }),
      });
      fetchSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    try {
      await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const stats = {
    total: subscribers.length,
    subscribed: subscribers.filter(s => s.isSubscribed).length,
    verified: subscribers.filter(s => s.isVerified).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Total Subscribers</p>
                <p className="text-white font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Active</p>
                <p className="text-white font-semibold">{stats.subscribed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Verified</p>
                <p className="text-white font-semibold">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search subscribers..." 
              className="pl-10 w-80 bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="subscribed">Subscribed</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Subscriber</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new email subscriber manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-white">Email *</Label>
                <Input
                  type="email"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Name</Label>
                <Input
                  value={newSubscriber.name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Phone</Label>
                <Input
                  value={newSubscriber.phone}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, phone: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-700 text-white">
                Cancel
              </Button>
              <Button onClick={handleAddSubscriber} disabled={isSubmitting || !newSubscriber.email} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Subscriber
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Source</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Subscribed</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-white">{subscriber.email}</TableCell>
                      <TableCell className="text-slate-300">{subscriber.name || '-'}</TableCell>
                      <TableCell className="text-slate-300">
                        <Badge variant="outline" className="border-slate-600">
                          {subscriber.source || 'website'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {subscriber.isSubscribed ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Subscribed</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Unsubscribed</Badge>
                          )}
                          {subscriber.isVerified && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Verified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{formatDate(subscriber.subscribedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSubscribed(subscriber)}
                            className={cn(
                              "text-slate-400 hover:text-white",
                              subscriber.isSubscribed ? "hover:bg-red-500/10" : "hover:bg-green-500/10"
                            )}
                          >
                            {subscriber.isSubscribed ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Newsletters Tab
function NewslettersTab() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    subject: '',
    content: '',
    frequency: 'one_time',
    scheduledFor: '',
  });
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletters');
      const data = await res.json();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.title || !newNewsletter.subject || !newNewsletter.content) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNewsletter),
      });
      
      if (res.ok) {
        fetchNewsletters();
        setNewNewsletter({ title: '', subject: '', content: '', frequency: 'one_time', scheduledFor: '' });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNewsletter = async (testMode: boolean = false) => {
    if (!selectedNewsletter) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId: selectedNewsletter.id,
          testEmail: testMode ? testEmail : undefined,
        }),
      });
      
      if (res.ok) {
        fetchNewsletters();
        if (!testMode) {
          setIsSendDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;
    
    try {
      await fetch(`/api/newsletters/${id}`, { method: 'DELETE' });
      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      sending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      sent: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create Newsletter</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new newsletter to send to your subscribers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={newNewsletter.title}
                    onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Newsletter title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Subject *</Label>
                  <Input
                    value={newNewsletter.subject}
                    onChange={(e) => setNewNewsletter({ ...newNewsletter, subject: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Email subject line"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Content *</Label>
                <Textarea
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white min-h-[200px]"
                  placeholder="HTML content for the newsletter..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Frequency</Label>
                  <Select value={newNewsletter.frequency} onValueChange={(v) => setNewNewsletter({ ...newNewsletter, frequency: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Schedule (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newNewsletter.scheduledFor}
                    onChange={(e) => setNewNewsletter({ ...newNewsletter, scheduledFor: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-700 text-white">
                Cancel
              </Button>
              <Button onClick={handleCreateNewsletter} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Newsletter List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : newsletters.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Megaphone className="h-12 w-12 mb-4" />
              <p>No newsletters yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          newsletters.map((newsletter) => (
            <Card key={newsletter.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{newsletter.title}</h3>
                      <Badge className={getStatusBadge(newsletter.status)}>
                        {newsletter.status}
                      </Badge>
                      {newsletter.frequency !== 'one_time' && (
                        <Badge variant="outline" className="border-slate-600">
                          {newsletter.frequency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400">{newsletter.subject}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                      <span>Created: {formatDate(newsletter.createdAt)}</span>
                      {newsletter.scheduledFor && (
                        <span>Scheduled: {formatDate(newsletter.scheduledFor)}</span>
                      )}
                      {newsletter.status === 'sent' && (
                        <span>Sent: {formatDate(newsletter.sentAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {newsletter.status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedNewsletter(newsletter);
                            setIsSendDialogOpen(true);
                          }}
                          className="border-slate-700 text-white"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNewsletter(newsletter.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {newsletter.status === 'sent' && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-400">
                          <Send className="h-4 w-4" />
                          <span>{newsletter.sentCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                          <Eye className="h-4 w-4" />
                          <span>{newsletter.openedCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Send Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Send Newsletter</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review and send this newsletter to your subscribers.
            </DialogDescription>
          </DialogHeader>
          {selectedNewsletter && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-slate-800/50 space-y-2">
                <p className="text-white font-medium">{selectedNewsletter.title}</p>
                <p className="text-slate-400 text-sm">{selectedNewsletter.subject}</p>
                <p className="text-slate-500 text-xs">Recipients: {selectedNewsletter.totalRecipients}</p>
              </div>
              <Separator className="bg-slate-700" />
              <div className="space-y-2">
                <Label className="text-white">Test Email (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="test@example.com"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleSendNewsletter(true)}
                    disabled={isSubmitting || !testEmail}
                    className="border-slate-700 text-white"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)} className="border-slate-700 text-white">
              Cancel
            </Button>
            <Button onClick={() => handleSendNewsletter(false)} disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send to All Subscribers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Email Settings Tab
function EmailSettingsTab() {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/email-settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setSaveResult({ success: true, message: 'Settings saved successfully!' });
        setTimeout(() => setSaveResult(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveResult({ success: false, message: errorData.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      setSaveResult({ success: false, message: 'Network error - please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setIsSaving(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setTestResult({ success: true, message: data.message || 'Test email sent successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setTestResult({ success: false, message: 'Network error - please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<EmailSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Email Provider</CardTitle>
          <CardDescription className="text-slate-400">Choose between custom SMTP or Mailchimp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={settings?.provider === 'smtp' ? 'default' : 'outline'}
              onClick={() => updateSettings({ provider: 'smtp' })}
              className={cn(
                "h-24 flex-col",
                settings?.provider === 'smtp' 
                  ? "bg-amber-500 hover:bg-amber-600 text-black" 
                  : "border-slate-700 text-white hover:bg-slate-800"
              )}
            >
              <Mail className="h-6 w-6 mb-2" />
              <span className="font-semibold">Custom SMTP</span>
              <span className="text-xs opacity-75">Use your own email server</span>
            </Button>
            <Button
              variant={settings?.provider === 'mailchimp' ? 'default' : 'outline'}
              onClick={() => updateSettings({ provider: 'mailchimp' })}
              className={cn(
                "h-24 flex-col",
                settings?.provider === 'mailchimp' 
                  ? "bg-amber-500 hover:bg-amber-600 text-black" 
                  : "border-slate-700 text-white hover:bg-slate-800"
              )}
            >
              <Megaphone className="h-6 w-6 mb-2" />
              <span className="font-semibold">Mailchimp</span>
              <span className="text-xs opacity-75">Professional email marketing</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      {settings?.provider === 'smtp' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">SMTP Configuration</CardTitle>
            <CardDescription className="text-slate-400">Configure your SMTP server settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">SMTP Host</Label>
                <Input
                  value={settings.smtpHost || ''}
                  onChange={(e) => updateSettings({ smtpHost: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">SMTP Port</Label>
                <Input
                  type="number"
                  value={settings.smtpPort || ''}
                  onChange={(e) => updateSettings({ smtpPort: parseInt(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Username</Label>
                <Input
                  value={settings.smtpUser || ''}
                  onChange={(e) => updateSettings({ smtpUser: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  value={settings.smtpPassword || ''}
                  onChange={(e) => updateSettings({ smtpPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">From Email</Label>
                <Input
                  value={settings.smtpFromEmail || ''}
                  onChange={(e) => updateSettings({ smtpFromEmail: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="noreply@church.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">From Name</Label>
                <Input
                  value={settings.smtpFromName || ''}
                  onChange={(e) => updateSettings({ smtpFromName: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Church Name"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.smtpSecure}
                onCheckedChange={(checked) => updateSettings({ smtpSecure: checked })}
              />
              <Label className="text-white">Use TLS/SSL</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mailchimp Settings */}
      {settings?.provider === 'mailchimp' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Mailchimp Configuration</CardTitle>
            <CardDescription className="text-slate-400">Connect your Mailchimp account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <Input
                  type="password"
                  value={settings.mailchimpApiKey || ''}
                  onChange={(e) => updateSettings({ mailchimpApiKey: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Your Mailchimp API key"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Server Prefix</Label>
                <Input
                  value={settings.mailchimpServer || ''}
                  onChange={(e) => updateSettings({ mailchimpServer: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="us1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Audience/List ID</Label>
                <Input
                  value={settings.mailchimpListId || ''}
                  onChange={(e) => updateSettings({ mailchimpListId: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Your audience ID"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">From Name</Label>
                <Input
                  value={settings.mailchimpFromName || ''}
                  onChange={(e) => updateSettings({ mailchimpFromName: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Church Name"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Default Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Default Settings</CardTitle>
          <CardDescription className="text-slate-400">Configure default newsletter behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Default Frequency</Label>
              <Select 
                value={settings?.defaultFrequency || 'weekly'} 
                onValueChange={(v) => updateSettings({ defaultFrequency: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Active</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={settings?.isActive ?? true}
                  onCheckedChange={(checked) => updateSettings({ isActive: checked })}
                />
                <Label className="text-white">Enable email sending</Label>
              </div>
            </div>
          </div>
          <Separator className="bg-slate-700" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Include Unsubscribe Link</Label>
                <p className="text-slate-500 text-sm">Add an unsubscribe link to all emails</p>
              </div>
              <Switch
                checked={settings?.includeUnsubscribeLink ?? true}
                onCheckedChange={(checked) => updateSettings({ includeUnsubscribeLink: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Track Opens</Label>
                <p className="text-slate-500 text-sm">Track when emails are opened</p>
              </div>
              <Switch
                checked={settings?.trackOpens ?? true}
                onCheckedChange={(checked) => updateSettings({ trackOpens: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Track Clicks</Label>
                <p className="text-slate-500 text-sm">Track link clicks in emails</p>
              </div>
              <Switch
                checked={settings?.trackClicks ?? true}
                onCheckedChange={(checked) => updateSettings({ trackClicks: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test & Save */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Enter email to send test"
              />
              <Button
                variant="outline"
                onClick={handleTestEmail}
                disabled={isSaving || !testEmail}
                className="border-slate-700 text-white"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                Send Test
              </Button>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Settings
            </Button>
          </div>
          {testResult && (
            <p className={cn("mt-2 text-sm", testResult.success ? "text-green-400" : "text-red-400")}>
              {testResult.message}
            </p>
          )}
          {saveResult && (
            <p className={cn("mt-2 text-sm", saveResult.success ? "text-green-400" : "text-red-400")}>
              {saveResult.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
