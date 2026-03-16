'use client';

import { useEffect, useState } from 'react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Settings, FileText, Send, BarChart3, Smartphone, MessageSquare, 
  TestTube, Plus, Bell, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SmsSettingsView() {
  const [activeTab, setActiveTab] = useState('config');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // SMS Configuration state
  const [config, setConfig] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    smsEnabled: false,
    hasAuthToken: 'false'
  });
  
  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  
  // Send SMS state
  const [sendForm, setSendForm] = useState({
    to: '',
    message: '',
    eventType: 'custom'
  });
  
  // SMS Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [logsStats, setLogsStats] = useState({ total: 0, sent: 0, failed: 0 });

  useEffect(() => {
    if (activeTab === 'config') {
      fetchConfig();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sms/config');
      if (res.ok) {
        const data = await res.json();
        setConfig({
          twilioAccountSid: data.twilioAccountSid || '',
          twilioAuthToken: data.hasAuthToken === 'true' ? '••••••••' : '',
          twilioPhoneNumber: data.twilioPhoneNumber || '',
          smsEnabled: data.smsEnabled === 'true',
          hasAuthToken: data.hasAuthToken || 'false'
        });
      }
    } catch (error) {
      console.error('Error fetching SMS config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sms/templates');
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sms/logs?limit=50');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogsStats({
          total: data.stats?.total || 0,
          sent: data.stats?.byStatus?.sent || 0,
          failed: data.stats?.byStatus?.failed || 0
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twilioAccountSid: config.twilioAccountSid,
          twilioAuthToken: config.twilioAuthToken.includes('•') ? undefined : config.twilioAuthToken,
          twilioPhoneNumber: config.twilioPhoneNumber,
          smsEnabled: config.smsEnabled
        })
      });
      
      if (res.ok) {
        fetchConfig();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSms = async () => {
    const phone = prompt('Enter phone number to send test SMS (with country code, e.g., +1234567890):');
    if (!phone) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sms/send?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        alert(`Test SMS sent successfully! SID: ${data.sid}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send test SMS');
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      alert('Failed to send test SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!sendForm.to || !sendForm.message) {
      alert('Please enter phone number and message');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sendForm.to,
          message: sendForm.message
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`SMS sent! Sent: ${data.sent}, Failed: ${data.failed}`);
        setSendForm({ to: '', message: '', eventType: 'custom' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: any) => {
    setIsLoading(true);
    try {
      const method = template.id ? 'PUT' : 'POST';
      const res = await fetch('/api/sms/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      
      if (res.ok) {
        setIsTemplateDialogOpen(false);
        setEditingTemplate(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sms/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Default SMS templates
  const defaultTemplates = [
    { name: 'Event Reminder (1 hour before)', triggerType: 'event_reminder', triggerOffset: -1, template: '🔔 Reminder: {{event_title}} starts in 1 hour at {{event_location}}. We look forward to seeing you!', recipientType: 'registrants' },
    { name: 'Event Reminder (1 day before)', triggerType: 'event_reminder', triggerOffset: -24, template: '🔔 Reminder: {{event_title}} is tomorrow at {{event_time}}. Location: {{event_location}}. Don\'t forget!', recipientType: 'registrants' },
    { name: 'Event Started', triggerType: 'event_started', triggerOffset: 0, template: '🎉 {{event_title}} has started! Join now at {{event_location}}', recipientType: 'registrants' },
    { name: 'Event Registration Confirmed', triggerType: 'event_registration', triggerOffset: 0, template: '✅ You\'re registered for {{event_title}} on {{event_date}} at {{event_location}}. See you there!', recipientType: 'registrants' },
  ];

  if (isLoading && activeTab === 'config' && !config.twilioAccountSid) {
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
          <Smartphone className="h-6 w-6 text-amber-500" />
          SMS Control Center
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6">
          <TabsTrigger value="config" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="send" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Send className="h-4 w-4 mr-2" />
            Send SMS
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <BarChart3 className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Configuration Content */}
        <TabsContent value="config" className="space-y-6">
          <Card className={cn(
            "bg-slate-900/50 border-slate-800",
            config.smsEnabled && "border-amber-500/20"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Global SMS Status</CardTitle>
                  <CardDescription className="text-slate-400">Master switch for all SMS notifications</CardDescription>
                </div>
                <Switch
                  checked={config.smsEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, smsEnabled: checked })}
                />
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-amber-400" />
                  Twilio Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Account SID</Label>
                  <Input
                    value={config.twilioAccountSid}
                    onChange={(e) => setConfig(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                    placeholder="AC..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Auth Token</Label>
                  <Input
                    type="password"
                    value={config.twilioAuthToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                    placeholder="Enter Twilio Token"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  {config.hasAuthToken === 'true' && config.twilioAuthToken.includes('•') && (
                    <p className="text-slate-500 text-xs">Token is saved. Enter a new token to update.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Twilio Phone Number</Label>
                  <Input
                    value={config.twilioPhoneNumber}
                    onChange={(e) => setConfig(prev => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                    placeholder="+1234567890"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                  Service Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                    <p className="text-slate-500 text-xs mb-1">Total Sent</p>
                    <p className="text-white font-bold text-lg">{logsStats.sent}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                    <p className="text-slate-500 text-xs mb-1">Failed</p>
                    <p className="text-red-400 font-bold text-lg">{logsStats.failed}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                    <p className="text-slate-500 text-xs mb-1">Templates</p>
                    <p className="text-amber-400 font-bold text-lg">{templates.length}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleTestSms} 
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:text-white"
                  disabled={!config.twilioAccountSid || !config.twilioPhoneNumber}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test SMS
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 h-12 rounded-xl"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </TabsContent>

        {/* Templates Content */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Notification Templates</h3>
            <Button 
              onClick={() => { setEditingTemplate(null); setIsTemplateDialogOpen(true); }}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          {templates.length === 0 && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="text-white font-medium">No Templates Found</h4>
                <p className="text-slate-400 text-sm mb-4">Would you like to start with our default event templates?</p>
                <Button 
                  onClick={async () => {
                    for (const t of defaultTemplates) {
                      await fetch('/api/sms/templates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(t)
                      });
                    }
                    fetchTemplates();
                  }}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400"
                >
                  Add Default Templates
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        template.isEnabled ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500"
                      )}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4 border-slate-700">
                            {template.triggerType}
                          </Badge>
                          <Badge className={cn("text-[10px] h-4", template.isEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400")}>
                            {template.isEnabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => { setEditingTemplate(template); setIsTemplateDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm italic line-clamp-2">&quot;{template.template}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Send Content */}
        <TabsContent value="send" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Quick SMS</CardTitle>
              <CardDescription>Send an immediate message to a member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Recipient Phone</Label>
                <Input
                  value={sendForm.to}
                  onChange={(e) => setSendForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="+1234567890"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Message</Label>
                <textarea
                  value={sendForm.message}
                  onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here..."
                  className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 resize-none focus:border-amber-500 outline-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 text-[10px]">{sendForm.message.length}/160 characters</p>
                  <p className="text-slate-500 text-[10px]">Standard SMS rates apply</p>
                </div>
              </div>
              <Button 
                onClick={handleSendSms} 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-12"
                disabled={!sendForm.to || !sendForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Dispatch Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Content */}
        <TabsContent value="logs">
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Recipient</TableHead>
                  <TableHead className="text-slate-400">Message</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Sent Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-500">No history found</TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/30">
                      <TableCell className="text-white font-medium">{log.phone}</TableCell>
                      <TableCell className="text-slate-400 max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[10px] px-2 h-5",
                          log.status === 'sent' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          log.status === 'failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id ? 'Edit Notification' : 'New Notification'}</DialogTitle>
          </DialogHeader>
          <TemplateForm 
            template={editingTemplate} 
            onSave={handleSaveTemplate}
            onCancel={() => { setIsTemplateDialogOpen(false); setEditingTemplate(null); }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Form Component (Localized to this view)
function TemplateForm({ template, onSave, onCancel, isLoading }: any) {
  const [form, setForm] = useState({
    name: template?.name || '',
    triggerType: template?.triggerType || 'event_reminder',
    triggerOffset: template?.triggerOffset || -1,
    template: template?.template || '',
    recipientType: template?.recipientType || 'registrants',
    isEnabled: template?.isEnabled ?? true,
    ...template
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-300">Display Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., 1h Reminder"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Trigger Event</Label>
          <Select value={form.triggerType} onValueChange={(v) => setForm(prev => ({ ...prev, triggerType: v }))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="event_reminder">Event Reminder</SelectItem>
              <SelectItem value="event_started">Event Started</SelectItem>
              <SelectItem value="event_registration">Registration Confirmed</SelectItem>
              <SelectItem value="prayer_request">Prayer Request Received</SelectItem>
              <SelectItem value="custom">Custom Trigger</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-300">Timing Relative to Event</Label>
          <Select 
            value={String(form.triggerOffset)} 
            onValueChange={(v) => setForm(prev => ({ ...prev, triggerOffset: parseInt(v) }))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="-24">24 Hours Before</SelectItem>
              <SelectItem value="-1">1 Hour Before</SelectItem>
              <SelectItem value="0">Immediately</SelectItem>
              <SelectItem value="1">1 Hour After</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Audience</Label>
          <Select value={form.recipientType} onValueChange={(v) => setForm(prev => ({ ...prev, recipientType: v }))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="registrants">Registrants</SelectItem>
              <SelectItem value="admins">Admins</SelectItem>
              <SelectItem value="all_members">Full Membership</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">SMS Body Template</Label>
        <textarea
          value={form.template}
          onChange={(e) => setForm(prev => ({ ...prev, template: e.target.value }))}
          className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white resize-none outline-none focus:border-amber-500"
        />
        <p className="text-slate-500 text-[10px]">Placeholders: {'{{event_title}}, {{event_date}}, {{event_location}}'}</p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
        <div>
          <h4 className="text-white text-sm font-medium">Notification Active</h4>
          <p className="text-slate-400 text-xs">Enable/disable this automatic message</p>
        </div>
        <Switch
          checked={form.isEnabled}
          onCheckedChange={(checked) => setForm(prev => ({ ...prev, isEnabled: checked }))}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="border-slate-700">Cancel</Button>
        <Button onClick={() => onSave(form)} className="bg-amber-500 text-black">Save Template</Button>
      </div>
    </div>
  );
}
