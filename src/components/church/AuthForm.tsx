'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Church, AlertCircle, Loader2, Globe, Facebook, 
  ArrowLeft, RefreshCw, CheckCircle2, User, MapPin, 
  Heart, Shield, ChevronRight, ChevronLeft, X, Smartphone,
  Sparkles, Lock, Mail as MailIcon, Key, Info, LogIn, AtSign, Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SocialLoginSettings {
  googleEnabled: boolean;
  facebookEnabled: boolean;
}

interface VerificationSettings {
  isEnabled: boolean;
  codeLength: number;
  codeExpirationMinutes: number;
  resendCooldownSeconds: number;
}

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  onClose?: () => void;
}

export function AuthForm({ initialMode = 'signin', onClose }: AuthFormProps) {
  const { setUser, setCurrentView, settings } = useAppStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialSettings, setSocialSettings] = useState<SocialLoginSettings | null>(null);
  const [verificationSettings, setVerificationSettings] = useState<VerificationSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  
  // Signup Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationError, setVerificationError] = useState('');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [socialRes, verificationRes] = await Promise.all([
          fetch('/api/social-login-settings'),
          fetch('/api/settings/email-verification')
        ]);
        
        if (socialRes.ok) {
          const data = await socialRes.json();
          setSocialSettings(data);
        }
        if (verificationRes.ok) {
          const data = await verificationRes.json();
          setVerificationSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };
    fetchSettings();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    // Wait for settings to load
    if (!settingsLoaded) {
      setError('Please wait while settings load...');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Final validation

        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: '',
            city: '',
            timezone: '',
            denomination: '',
            faithStatus: '',
            localChurch: '',
            interests: '',
            acceptedTerms: true,
            acceptedPrivacy: true,
            acceptedStatementOfFaith: true,
            role: 'MEMBER',
          }),
        });

        if (res.ok) {
          const user = await res.json();
          
          // Check if email verification is enabled
          const isVerificationEnabled = verificationSettings?.isEnabled === true;
          
          if (isVerificationEnabled) {
            // Send verification code
            const sendRes = await fetch('/api/auth/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            
            const sendData = await sendRes.json();
            
            setPendingUserId(user.id);
            setPendingEmail(user.email);
            setShowVerification(true);
            setResendCooldown(verificationSettings?.resendCooldownSeconds || 60);
            
            if (sendRes.ok && sendData._devCode) {
              setVerificationCode(sendData._devCode);
            }
          } else {
            setUser(user);
            setCurrentView('dashboard');
            if (onClose) onClose();
          }
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create account');
        }
      } else {
        // Sign in
        const res = await fetch('/api/users');
        const users = await res.json();
        
        const user = users.find((u: { email: string }) => u.email === signInEmail);
        
        if (user) {
          if (verificationSettings?.isEnabled && !user.isVerified) {
            const sendRes = await fetch('/api/auth/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            
            const sendData = await sendRes.json();
            
            setPendingUserId(user.id);
            setPendingEmail(user.email);
            setShowVerification(true);
            setResendCooldown(verificationSettings.resendCooldownSeconds || 60);
            
            if (sendData._devCode) {
              setVerificationCode(sendData._devCode);
            }
            
            setIsLoading(false);
            return;
          }
          
          setUser(user);
          setCurrentView(user.role === 'ADMIN' ? 'admin' : 'dashboard');
          if (onClose) onClose();
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !pendingUserId) return;
    
    setIsVerifying(true);
    setVerificationError('');
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUserId,
          code: verificationCode,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
        setCurrentView('dashboard');
        if (onClose) onClose();
      } else {
        setVerificationError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setVerificationError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    
    setIsResending(true);
    setVerificationError('');
    
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResendCooldown(verificationSettings?.resendCooldownSeconds || 60);
        if (data._devCode) {
          setVerificationCode(data._devCode);
        }
      } else {
        setVerificationError(data.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setVerificationError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'PASTOR' | 'MEMBER') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      
      const user = users.find((u: { role: string }) => u.role === role);
      
      if (user) {
        setUser(user);
        setCurrentView(role === 'ADMIN' ? 'admin' : 'dashboard');
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/api/auth/facebook';
  };

  const hasSocialLogin = socialSettings?.googleEnabled || socialSettings?.facebookEnabled;

  const signUpMinistries = [
    { id: 'bible_study', label: 'Bible Study' },
    { id: 'prayer_groups', label: 'Prayer Groups' },
    { id: 'evangelism', label: 'Evangelism' },
    { id: 'online_fellowship', label: 'Online Fellowship' },
    { id: 'volunteering', label: 'Volunteering' },
  ];

  // Verification screen
  if (showVerification) {
    return (
      <div className="w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-950/80 backdrop-blur-xl shadow-2xl relative p-1">
        {/* Premium Gradient Backgrounds */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[80px]" />
        </div>

        <Card className="bg-transparent border-0 shadow-none relative z-10 overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-4">
              {settings.logoUrl && typeof settings.logoUrl === 'string' && settings.logoUrl.trim() !== '' ? (
                <div className="bg-slate-900 border border-slate-700 p-1 rounded-2xl shadow-lg relative overflow-hidden group">
                  <img src={settings.logoUrl} alt={settings.siteName} className="h-12 w-12 object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg shadow-amber-500/20">
                  <MailIcon className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              We've sent a <span className="text-amber-500 font-bold">{verificationSettings?.codeLength || 6}</span>-digit code to<br />
              <span className="font-medium text-white underline decoration-amber-500/30 underline-offset-4">{pendingEmail}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6 pb-10 px-8">
            {verificationError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3 text-center">
              <Label htmlFor="verification-code" className="text-slate-300 font-medium">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, verificationSettings?.codeLength || 6))}
                className="text-center text-3xl font-bold tracking-[0.5em] h-16 bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-800 rounded-2xl backdrop-blur-md transition-all duration-300"
                maxLength={verificationSettings?.codeLength || 6}
              />
            </div>
            
            <Button 
              onClick={handleVerifyCode}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-14 rounded-2xl shadow-xl shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98]"
              disabled={isVerifying || verificationCode.length !== (verificationSettings?.codeLength || 6)}
            >
              {isVerifying ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              Verify Email Address
            </Button>
            
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowVerification(false);
                  setPendingUserId(null);
                  setPendingEmail('');
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl px-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Change Email
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
                className="text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl px-4 transition-colors"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-slate-800/50">
              <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest font-medium">
                Code expires in {verificationSettings?.codeExpirationMinutes || 10} minutes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-950/80 backdrop-blur-xl shadow-2xl relative">
      {/* Premium Gradient Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[80px]" />
      </div>

      <Card className="bg-transparent border-0 shadow-none relative z-10 overflow-hidden">
        <CardHeader className="text-center pb-2 pt-6 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="flex justify-center mb-3">
            <div className="relative">
              {settings.logoUrl && typeof settings.logoUrl === 'string' && settings.logoUrl.trim() !== '' ? (
                <div className="bg-slate-900 border border-slate-700 p-1 rounded-2xl shadow-lg relative overflow-hidden group">
                  <img src={settings.logoUrl} alt={settings.siteName} className="h-12 w-12 object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
                    <Church className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 animate-pulse">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </>
              )}
            </div>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
            {settings.siteName || 'Voices of Hope'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            {mode === 'signin' ? 'Welcome back to our community' : 'Member Registration'}
          </CardDescription>
        </CardHeader>
        
        <ScrollArea className="max-h-[75vh] overflow-y-auto">
          <CardContent className="pt-2 pb-8 px-6">
          <Tabs value={mode} onValueChange={(v) => {
            setMode(v as 'signin' | 'signup');
            setError('');
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
              <TabsTrigger 
                value="signin"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-semibold transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-semibold transition-all duration-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-white font-medium flex items-center gap-2 mb-1">
                    <MailIcon className="h-4 w-4 text-amber-500" />
                    Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300 group-hover:border-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-white font-medium flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-amber-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300 group-hover:border-slate-700"
                    />
                  </div>
                </div>
                
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98]"
                    disabled={isLoading || !settingsLoaded}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                    Sign In
                  </Button>

                {hasSocialLogin && (
                  <div className="space-y-3 mt-6">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {socialSettings?.googleEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleLogin}
                        >
                          <Globe className="h-5 w-5 mr-2" />
                          Google
                        </Button>
                      )}
                      {socialSettings?.facebookEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleFacebookLogin}
                        >
                          <Facebook className="h-5 w-5 mr-2" />
                          Facebook
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Simplified Personal Information */}
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        <User className="h-5 w-5 text-amber-500" />
                      </div>
                      <h3 className="font-bold text-lg text-white">Basic Personal Information</h3>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="signup-name" className="text-white font-medium flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-amber-500/70" />
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        placeholder="John Doe (Your message of voices of hope)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-white font-medium flex items-center gap-2 mb-1">
                        <MailIcon className="h-4 w-4 text-amber-500/70" />
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300"
                      />
                      <p className="text-[10px] text-slate-500 ml-1">Required for login and communication</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="signup-username" className="text-white font-medium flex items-center gap-2 mb-1">
                          <AtSign className="h-4 w-4 text-amber-500/70" />
                          Username
                        </Label>
                        <Input
                          id="signup-username"
                          placeholder="johndoe"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="signup-password" className="text-white font-medium flex items-center gap-2 mb-1">
                          <Key className="h-4 w-4 text-amber-500/70" />
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                {/* Footer buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98]"
                    disabled={isLoading || !settingsLoaded}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                    Complete Registration
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Demo Accounts Removed for Production */}
        </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
