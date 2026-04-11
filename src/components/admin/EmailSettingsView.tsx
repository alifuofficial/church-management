'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TestTube,
  Megaphone,
  Settings,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  Send,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
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

interface VerificationSettings {
  id: string;
  isEnabled: boolean;
  codeLength: number;
  codeExpirationMinutes: number;
  resendCooldownSeconds: number;
  maxAttempts: number;
  emailSubject: string;
  emailFromName: string;
}

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
}

// --- Main Component ---
export function EmailSettingsView() {
  const { setSettings } = useAppStore();
  const [activeMainTab, setActiveMainTab] = useState('config');
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [verificationSettings, setVerificationSettings] = useState<VerificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const [emailRes, verificationRes] = await Promise.all([
        fetch('/api/email-settings'),
        fetch('/api/settings/email-verification')
      ]);
      
      if (emailRes.ok) {
        const data = await emailRes.json();
        setEmailSettings(data);
      }
      
      if (verificationRes.ok) {
        const data = await verificationRes.json();
        setVerificationSettings(data);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<Response>[] = [];
      if (emailSettings) {
        promises.push(fetch('/api/email-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailSettings),
        }));
      }
      if (verificationSettings) {
        promises.push(fetch('/api/settings/email-verification', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationSettings),
        }));
      }

      if (emailSettings) {
        setSettings({ emailEnabled: emailSettings.isActive });
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="h-6 w-6 text-amber-500" />
          Email Control Center
        </h2>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6">
          <TabsTrigger value="config" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Users className="h-4 w-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="newsletters" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Megaphone className="h-4 w-4 mr-2" />
            Newsletters
          </TabsTrigger>
        </TabsList>

        {/* --- Configuration Tab --- */}
        <TabsContent value="config" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 border-amber-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Global Email Status</CardTitle>
                  <CardDescription className="text-slate-400">Master switch for all outgoing mail</CardDescription>
                </div>
                <Switch
                  checked={emailSettings?.isActive ?? true}
                  onCheckedChange={(checked) => emailSettings && setEmailSettings({ ...emailSettings, isActive: checked })}
                />
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Provider Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select 
                  value={emailSettings?.provider || 'smtp'} 
                  onValueChange={(v) => emailSettings && setEmailSettings({...emailSettings, provider: v})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="smtp">Custom SMTP Server</SelectItem>
                    <SelectItem value="mailchimp">Mailchimp Integration</SelectItem>
                  </SelectContent>
                </Select>

                {emailSettings?.provider === 'smtp' ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Host</Label>
                        <Input
                          value={emailSettings.smtpHost || ''}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Port</Label>
                        <Input
                          type="number"
                          value={emailSettings.smtpPort || ''}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex flex-col">
                        <span className="text-slate-300 text-sm font-medium">Secure Connection</span>
                        <span className="text-slate-500 text-[10px]">Enable SSL/TLS (required for port 465)</span>
                      </div>
                      <Switch
                        checked={emailSettings.smtpSecure}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, smtpSecure: checked })}
                      />
                    </div>
                    <Input
                      value={emailSettings.smtpUser || ''}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Username"
                    />
                    <Input
                      type="password"
                      value={emailSettings.smtpPassword || ''}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Password"
                    />
                  </div>
                ) : (
                   <div className="space-y-3 animate-in fade-in duration-300">
                    <Input
                      type="password"
                      value={emailSettings?.mailchimpApiKey || ''}
                      onChange={(e) => emailSettings && setEmailSettings({ ...emailSettings, mailchimpApiKey: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Mailchimp API Key"
                    />
                    <Input
                      value={emailSettings?.mailchimpServer || ''}
                      onChange={(e) => emailSettings && setEmailSettings({ ...emailSettings, mailchimpServer: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Server Prefix (e.g., us1)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Security & Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <span className="text-slate-300 text-sm">Require Email Verification</span>
                  <Switch
                    checked={verificationSettings?.isEnabled ?? false}
                    onCheckedChange={(checked) => verificationSettings && setVerificationSettings({...verificationSettings, isEnabled: checked})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Code Length</Label>
                    <Input
                      type="number"
                      value={verificationSettings?.codeLength || 6}
                      onChange={(e) => verificationSettings && setVerificationSettings({...verificationSettings, codeLength: parseInt(e.target.value)})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Expires (Min)</Label>
                    <Input
                      type="number"
                      value={verificationSettings?.codeExpirationMinutes || 10}
                      onChange={(e) => verificationSettings && setVerificationSettings({...verificationSettings, codeExpirationMinutes: parseInt(e.target.value)})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
             <div className="flex gap-3 flex-1 max-w-md">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button 
                  onClick={async () => {
                    setIsTesting(true);
                    try {
                      const res = await fetch('/api/email-settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ testEmail }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setTestResult({ success: true, message: data.message || 'Test email sent successfully' });
                      } else {
                        setTestResult({ success: false, message: data.error || 'Failed to send test email' });
                      }
                    } finally { setIsTesting(false); }
                  }} 
                  disabled={isTesting || !testEmail}
                  variant="outline"
                  className="border-slate-700 text-white"
                >
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  Test
                </Button>
              </div>
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 h-12 rounded-xl"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Save Configuration
              </Button>
          </div>
          {testResult && (
            <p className={cn("text-center text-sm font-medium", testResult.success ? "text-emerald-400" : "text-red-400")}>
              {testResult.message}
            </p>
          )}
        </TabsContent>

        {/* --- Subscribers Tab --- */}
        <TabsContent value="subscribers">
          <SubscribersTab />
        </TabsContent>

        {/* --- Newsletters Tab --- */}
        <TabsContent value="newsletters">
          <NewslettersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Sub-components (Logic migrated from EmailSubscriptionContent) ---

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchSubscribers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/subscribers?search=${searchQuery}`);
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchSubscribers();
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search subscribers..." 
            className="pl-10 bg-slate-900/50 border-slate-800 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" /></TableCell></TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-500">No subscribers found</TableCell></TableRow>
            ) : (
              subscribers.map((s) => (
                <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/30">
                  <TableCell className="text-white font-medium">{s.email}</TableCell>
                  <TableCell className="text-slate-400">{s.name || 'Anonymous'}</TableCell>
                  <TableCell>
                    {s.isSubscribed ? 
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge> :
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Unsubscribed</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function NewslettersTab() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/newsletters');
        const data = await res.json();
        setNewsletters(data.newsletters || []);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchNewsletters();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Newsletter Campaigns</h3>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" /></div>
        ) : newsletters.length === 0 ? (
           <Card className="bg-slate-900/50 border-slate-800 flex flex-col items-center justify-center p-12 text-slate-500">
              <Megaphone className="h-12 w-12 mb-4 opacity-20" />
              <p>Your campaigns will appear here</p>
           </Card>
        ) : (
          newsletters.map((n) => (
            <Card key={n.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">{n.title}</h4>
                  <p className="text-slate-400 text-sm">{n.subject}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-slate-800">{n.status}</Badge>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
