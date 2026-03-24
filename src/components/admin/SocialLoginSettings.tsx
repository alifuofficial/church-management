'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Save, Key, Globe, Facebook, CheckCircle2, XCircle, 
  ExternalLink, Info, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLoginSettings {
  id: string;
  googleEnabled: boolean;
  googleClientId: string | null;
  googleClientSecret: string | null;
  googleRedirectUri: string | null;
  facebookEnabled: boolean;
  facebookAppId: string | null;
  facebookAppSecret: string | null;
  facebookRedirectUri: string | null;
  telegramEnabled: boolean;
  telegramBotName: string | null;
  telegramBotToken: string | null;
  allowAccountLinking: boolean;
}

export function SocialLoginSettings() {
  const [settings, setSettings] = useState<SocialLoginSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<{ google?: { valid: boolean; message: string }; facebook?: { valid: boolean; message: string }; telegram?: { valid: boolean; message: string } }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/social-login-settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching social login settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/social-login-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error saving social login settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestProvider = async (provider: 'google' | 'facebook' | 'telegram') => {
    try {
      const res = await fetch('/api/social-login-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      
      setTestResults(prev => ({
        ...prev,
        [provider]: { valid: data.valid, message: data.message || data.error }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { valid: false, message: 'Test failed' }
      }));
    }
  };

  const updateSettings = (updates: Partial<SocialLoginSettings>) => {
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
      {/* Google OAuth Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Google OAuth
                  {settings?.googleEnabled ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
                  ) : (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Disabled</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Allow users to sign in with their Google account
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={settings?.googleEnabled ?? false}
              onCheckedChange={(checked) => updateSettings({ googleEnabled: checked })}
            />
          </div>
        </CardHeader>
        
        {settings?.googleEnabled && (
          <>
            <Separator className="bg-slate-700" />
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Client ID
                  </Label>
                  <Input
                    value={settings.googleClientId || ''}
                    onChange={(e) => updateSettings({ googleClientId: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="your-client-id.apps.googleusercontent.com"
                  />
                  <p className="text-xs text-slate-500">Get from Google Cloud Console</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Client Secret
                  </Label>
                  <Input
                    type="password"
                    value={settings.googleClientSecret || ''}
                    onChange={(e) => updateSettings({ googleClientSecret: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="GOCSPX-..."
                  />
                  <p className="text-xs text-slate-500">Keep this secret!</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Redirect URI
                </Label>
                <Input
                  value={settings.googleRedirectUri || ''}
                  onChange={(e) => updateSettings({ googleRedirectUri: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback/google`}
                />
                <p className="text-xs text-slate-500">Add this URI to your Google OAuth authorized redirect URIs</p>
              </div>
              
              {testResults.google && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  testResults.google.valid ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {testResults.google.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={testResults.google.valid ? "text-green-400" : "text-red-400"}>
                    {testResults.google.message}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestProvider('google')}
                  className="border-slate-700 text-white"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Test Configuration
                </Button>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Facebook OAuth Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Facebook OAuth
                  {settings?.facebookEnabled ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
                  ) : (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Disabled</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Allow users to sign in with their Facebook account
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={settings?.facebookEnabled ?? false}
              onCheckedChange={(checked) => updateSettings({ facebookEnabled: checked })}
            />
          </div>
        </CardHeader>
        
        {settings?.facebookEnabled && (
          <>
            <Separator className="bg-slate-700" />
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    App ID
                  </Label>
                  <Input
                    value={settings.facebookAppId || ''}
                    onChange={(e) => updateSettings({ facebookAppId: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-slate-500">Get from Facebook Developer Portal</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    App Secret
                  </Label>
                  <Input
                    type="password"
                    value={settings.facebookAppSecret || ''}
                    onChange={(e) => updateSettings({ facebookAppSecret: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="abc123..."
                  />
                  <p className="text-xs text-slate-500">Keep this secret!</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Redirect URI
                </Label>
                <Input
                  value={settings.facebookRedirectUri || ''}
                  onChange={(e) => updateSettings({ facebookRedirectUri: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback/facebook`}
                />
                <p className="text-xs text-slate-500">Add this URI to your Facebook App Settings</p>
              </div>
              
              {testResults.facebook && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  testResults.facebook.valid ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {testResults.facebook.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={testResults.facebook.valid ? "text-green-400" : "text-red-400"}>
                    {testResults.facebook.message}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestProvider('facebook')}
                  className="border-slate-700 text-white"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Test Configuration
                </Button>
                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Facebook Developer Portal <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Telegram Login Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Send className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Telegram Login
                  {settings?.telegramEnabled ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
                  ) : (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Disabled</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Allow users to sign in with their Telegram account using a Bot
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={settings?.telegramEnabled ?? false}
              onCheckedChange={(checked) => updateSettings({ telegramEnabled: checked })}
            />
          </div>
        </CardHeader>
        
        {settings?.telegramEnabled && (
          <>
            <Separator className="bg-slate-700" />
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Bot Name
                  </Label>
                  <Input
                    value={settings.telegramBotName || ''}
                    onChange={(e) => updateSettings({ telegramBotName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="my_church_bot"
                  />
                  <p className="text-xs text-slate-500">The username of your Telegram Bot (without @)</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Bot Token
                  </Label>
                  <Input
                    type="password"
                    value={settings.telegramBotToken || ''}
                    onChange={(e) => updateSettings({ telegramBotToken: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="123456789:ABCDE..."
                  />
                  <p className="text-xs text-slate-500">Keep this secret! Get it from @BotFather</p>
                </div>
              </div>
              
              {testResults.telegram && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  testResults.telegram.valid ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {testResults.telegram.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={testResults.telegram.valid ? "text-green-400" : "text-red-400"}>
                    {testResults.telegram.message}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestProvider('telegram')}
                  className="border-slate-700 text-white"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Test Configuration
                </Button>
                <a
                  href="https://core.telegram.org/widgets/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Telegram Login Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Account Linking Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Account Settings</CardTitle>
          <CardDescription className="text-slate-400">
            Configure how social login accounts are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Allow Account Linking</Label>
              <p className="text-slate-500 text-sm">
                If enabled, users with existing accounts can link their social logins.
                If disabled, social login will only work for new accounts.
              </p>
            </div>
            <Switch
              checked={settings?.allowAccountLinking ?? true}
              onCheckedChange={(checked) => updateSettings({ allowAccountLinking: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
