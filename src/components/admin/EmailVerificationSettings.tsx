'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Mail,
  Shield,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function EmailVerificationSettings() {
  const [settings, setSettings] = useState<VerificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/settings/email-verification');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setLoadError(errorData.error || 'Failed to load verification settings');
      }
    } catch (error) {
      console.error('Error fetching verification settings:', error);
      setLoadError('Network error - please check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const res = await fetch('/api/settings/email-verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSaveMessage({ type: 'error', text: errorData.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Network error - please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setIsTesting(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/settings/email-verification/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSaveMessage({ 
          type: 'success', 
          text: `Test email sent! Code: ${data.code}` 
        });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setSaveMessage({ type: 'error', text: 'Network error - please try again' });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-slate-400">Loading settings...</span>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <p className="text-white font-medium mb-2">Failed to load verification settings</p>
          <p className="text-slate-400 text-sm mb-4">{loadError || 'Unknown error occurred'}</p>
          <Button onClick={fetchSettings} variant="outline" className="border-slate-700 text-slate-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Email Verification
          </CardTitle>
          <CardDescription className="text-slate-400">
            Require users to verify their email address after registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                settings.isEnabled ? "bg-emerald-500/20" : "bg-slate-700"
              )}>
                <Mail className={cn(
                  "h-6 w-6",
                  settings.isEnabled ? "text-emerald-400" : "text-slate-400"
                )} />
              </div>
              <div>
                <h4 className="text-white font-medium">
                  {settings.isEnabled ? 'Email Verification Enabled' : 'Email Verification Disabled'}
                </h4>
                <p className="text-slate-400 text-sm">
                  {settings.isEnabled 
                    ? 'New users must verify their email before accessing the site'
                    : 'Users can access the site immediately after registration'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settings.isEnabled && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              )}
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-400" />
            Code Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure the verification code parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                Code Length
              </Label>
              <Input
                type="number"
                min={4}
                max={8}
                value={settings.codeLength}
                onChange={(e) => setSettings({ ...settings, codeLength: parseInt(e.target.value) || 6 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">Number of digits (4-8)</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expiration (minutes)
              </Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.codeExpirationMinutes}
                onChange={(e) => setSettings({ ...settings, codeExpirationMinutes: parseInt(e.target.value) || 10 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">How long the code is valid</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Resend Cooldown (seconds)
              </Label>
              <Input
                type="number"
                min={30}
                max={300}
                value={settings.resendCooldownSeconds}
                onChange={(e) => setSettings({ ...settings, resendCooldownSeconds: parseInt(e.target.value) || 60 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">Wait time before resending</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Max Attempts
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={settings.maxAttempts}
                onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value) || 5 })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-slate-500 text-xs">Maximum wrong attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Template Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-400" />
            Email Template
          </CardTitle>
          <CardDescription className="text-slate-400">
            Customize the verification email appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Email Subject</Label>
              <Input
                value={settings.emailSubject}
                onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
                placeholder="Verify Your Email Address"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Sender Name</Label>
              <Input
                value={settings.emailFromName}
                onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                placeholder="Grace Community Church"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TestTube className="h-5 w-5 text-amber-400" />
            Test Verification Email
          </CardTitle>
          <CardDescription className="text-slate-400">
            Send a test verification email to check your configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="bg-slate-800 border-slate-700 text-white flex-1"
            />
            <Button
              onClick={handleTestEmail}
              disabled={isTesting || !testEmail || !settings.isEnabled}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          {!settings.isEnabled && (
            <p className="text-amber-400 text-sm mt-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Enable email verification to send test emails
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status Info */}
      {settings.isEnabled && (
        <Card className="bg-slate-900/50 border-slate-800 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium">Email Verification Flow</h4>
                <ul className="text-slate-400 text-sm mt-2 space-y-1">
                  <li>1. User registers with email and password</li>
                  <li>2. A {settings.codeLength}-digit code is sent to their email</li>
                  <li>3. User enters the code to verify their email</li>
                  <li>4. Code expires after {settings.codeExpirationMinutes} minutes</li>
                  <li>5. User can request new code after {settings.resendCooldownSeconds} seconds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saveMessage && (
          <span className={cn(
            "text-sm",
            saveMessage.type === 'success' ? "text-emerald-400" : "text-red-400"
          )}>
            {saveMessage.text}
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
