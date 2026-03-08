'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, FileText, Send, BarChart3, Smartphone, MessageSquare, 
  TestTube, Plus, Bell, Pencil, Trash2, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// SMS Center Content Component
export function SmsContent() {
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'send' | 'logs'>('config');
  const [isLoading, setIsLoading] = useState(false);
  
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
    setIsLoading(true);
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
        alert('SMS configuration saved successfully!');
        fetchConfig();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  // Default SMS templates
  const defaultTemplates = [
    { name: 'Event Reminder (1 hour before)', triggerType: 'event_reminder', triggerOffset: -1, template: '🔔 Reminder: {{event_title}} starts in 1 hour at {{event_location}}. We look forward to seeing you!', recipientType: 'registrants' },
    { name: 'Event Reminder (1 day before)', triggerType: 'event_reminder', triggerOffset: -24, template: '🔔 Reminder: {{event_title}} is tomorrow at {{event_time}}. Location: {{event_location}}. Don\'t forget!', recipientType: 'registrants' },
    { name: 'Event Started', triggerType: 'event_started', triggerOffset: 0, template: '🎉 {{event_title}} has started! Join now at {{event_location}}', recipientType: 'registrants' },
    { name: 'Event Registration Confirmed', triggerType: 'event_registration', triggerOffset: 0, template: '✅ You\'re registered for {{event_title}} on {{event_date}} at {{event_location}}. See you there!', recipientType: 'registrants' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'templates', label: 'Notification Templates', icon: FileText },
          { id: 'send', label: 'Send SMS', icon: Send },
          { id: 'logs', label: 'SMS Logs', icon: BarChart3 },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            className={cn(
              "whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-amber-500 hover:bg-amber-600 text-black" 
                : "border-slate-700 text-slate-300 hover:bg-slate-800"
            )}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={cn(
            "border-2",
            config.smsEnabled ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/50 border-slate-800"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    config.smsEnabled ? "bg-emerald-500/20" : "bg-slate-800"
                  )}>
                    <Smartphone className={cn(
                      "h-6 w-6",
                      config.smsEnabled ? "text-emerald-400" : "text-slate-400"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">SMS Service</h3>
                    <p className={config.smsEnabled ? "text-emerald-400 text-sm" : "text-slate-400 text-sm"}>
                      {config.smsEnabled ? 'Enabled and ready' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, smsEnabled: !prev.smsEnabled }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    config.smsEnabled ? "bg-emerald-500" : "bg-slate-600"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    config.smsEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Twilio Configuration */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-400" />
                Twilio Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter your Twilio credentials to enable SMS notifications
              </CardDescription>
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
                  placeholder="Enter your Twilio Auth Token"
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
                <p className="text-slate-500 text-xs">Include country code (e.g., +1 for US)</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveConfig} disabled={isLoading} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Configuration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestSms} 
                  disabled={isLoading || !config.twilioAccountSid || !config.twilioPhoneNumber}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test SMS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Send className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Sent</p>
                    <p className="text-white font-semibold text-xl">{logsStats.sent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Failed</p>
                    <p className="text-white font-semibold text-xl">{logsStats.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Templates</p>
                    <p className="text-white font-semibold text-xl">{templates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Notification Templates</h3>
              <p className="text-slate-400 text-sm">Configure automatic SMS notifications for events</p>
            </div>
            <Button 
              onClick={() => { setEditingTemplate(null); setIsTemplateDialogOpen(true); }}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          {/* Default Templates Suggestion */}
          {templates.length === 0 && (
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Get Started with Default Templates</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      We have pre-made templates for common use cases. Click below to add them.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
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
                      className="mt-3 border-blue-500 text-blue-400 hover:bg-blue-500/20"
                    >
                      Add Default Templates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        template.isEnabled ? "bg-amber-500/20" : "bg-slate-800"
                      )}>
                        <Bell className={cn(
                          "h-5 w-5",
                          template.isEnabled ? "text-amber-400" : "text-slate-400"
                        )} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <p className="text-slate-400 text-sm mt-1">{template.template.substring(0, 80)}...</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {template.triggerType.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {template.triggerOffset < 0 ? `${Math.abs(template.triggerOffset)}h before` : 
                             template.triggerOffset > 0 ? `${template.triggerOffset}h after` : 'Immediate'}
                          </Badge>
                          <Badge className={template.isEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}>
                            {template.isEnabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setEditingTemplate(template); setIsTemplateDialogOpen(true); }}
                        className="text-slate-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Send SMS Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Send Custom SMS</CardTitle>
              <CardDescription className="text-slate-400">
                Send an SMS message to a specific phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Phone Number</Label>
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
                  className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 resize-none"
                />
                <p className="text-slate-500 text-xs">{sendForm.message.length}/160 characters</p>
              </div>
              <Button 
                onClick={handleSendSms} 
                disabled={isLoading || !sendForm.to || !sendForm.message}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">SMS History</CardTitle>
              <CardDescription className="text-slate-400">
                View all sent and failed SMS messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="bg-slate-800 sticky top-0">
                    <tr>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Phone</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Message</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-slate-300 text-sm">{log.phone}</td>
                        <td className="px-4 py-3 text-slate-300 text-sm max-w-xs truncate">{log.message}</td>
                        <td className="px-4 py-3">
                          <Badge className={cn(
                            log.status === 'sent' ? "bg-emerald-500/20 text-emerald-400" :
                            log.status === 'failed' ? "bg-red-500/20 text-red-400" :
                            "bg-amber-500/20 text-amber-400"
                          )}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          No SMS logs yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id ? 'Edit Template' : 'Add New Template'}</DialogTitle>
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

// Template Form Component
function TemplateForm({ template, onSave, onCancel, isLoading }: { 
  template: any; 
  onSave: (t: any) => void; 
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: template?.name || '',
    triggerType: template?.triggerType || 'event_reminder',
    triggerOffset: template?.triggerOffset || -1,
    template: template?.template || '',
    recipientType: template?.recipientType || 'registrants',
    isEnabled: template?.isEnabled ?? true,
    ...template
  });

  const triggerTypes = [
    { value: 'event_reminder', label: 'Event Reminder' },
    { value: 'event_started', label: 'Event Started' },
    { value: 'event_registration', label: 'Event Registration' },
    { value: 'event_cancelled', label: 'Event Cancelled' },
    { value: 'prayer_request', label: 'Prayer Request' },
    { value: 'custom', label: 'Custom' },
  ];

  const recipientTypes = [
    { value: 'registrants', label: 'Event Registrants' },
    { value: 'all_members', label: 'All Members' },
    { value: 'admins', label: 'Admins Only' },
    { value: 'custom', label: 'Custom Phone Number' },
  ];

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-300">Template Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Event Reminder 1 Hour"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Trigger Type</Label>
          <Select value={form.triggerType} onValueChange={(v) => setForm(prev => ({ ...prev, triggerType: v }))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {triggerTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-300">Timing</Label>
          <Select 
            value={String(form.triggerOffset)} 
            onValueChange={(v) => setForm(prev => ({ ...prev, triggerOffset: parseInt(v) }))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="-72">3 days before</SelectItem>
              <SelectItem value="-48">2 days before</SelectItem>
              <SelectItem value="-24">1 day before</SelectItem>
              <SelectItem value="-1">1 hour before</SelectItem>
              <SelectItem value="0">Immediately</SelectItem>
              <SelectItem value="1">1 hour after</SelectItem>
              <SelectItem value="24">1 day after</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Recipients</Label>
          <Select value={form.recipientType} onValueChange={(v) => setForm(prev => ({ ...prev, recipientType: v }))}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {recipientTypes.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Message Template</Label>
        <textarea
          value={form.template}
          onChange={(e) => setForm(prev => ({ ...prev, template: e.target.value }))}
          placeholder="Use {{event_title}}, {{event_date}}, {{event_time}}, {{event_location}} as placeholders"
          className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 resize-none"
        />
        <p className="text-slate-500 text-xs">
          Available placeholders: {`{{event_title}}, {{event_date}}, {{event_time}}, {{event_location}}`}
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
        <div>
          <h4 className="text-white font-medium">Enable Template</h4>
          <p className="text-slate-400 text-sm">Active templates will send automatically</p>
        </div>
        <button
          onClick={() => setForm(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            form.isEnabled ? "bg-amber-500" : "bg-slate-600"
          )}
        >
          <span className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            form.isEnabled ? "translate-x-6" : "translate-x-1"
          )} />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300">
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(form)} 
          disabled={isLoading || !form.name || !form.template}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Template
        </Button>
      </div>
    </div>
  );
}
