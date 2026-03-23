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
  Sparkles, Lock, Mail as MailIcon, Key, Info, LogIn, AtSign, Clock, Send
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signIn } from 'next-auth/react';

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
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
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

  // Username check state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Registration fix notice
  const [showFixNotice, setShowFixNotice] = useState(false);

  useEffect(() => {
    // Disable after 7 days (March 30, 2026)
    const expiryDate = new Date('2026-03-30T23:59:59Z');
    if (new Date() < expiryDate) {
      setShowFixNotice(true);
    }
  }, []);

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

  // Username availability check with debounce
  useEffect(() => {
    if (mode !== 'signup' || !username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameAvailable(data.available);
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, mode]);

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);

    if (strength === 0) setPasswordFeedback('');
    else if (strength <= 25) setPasswordFeedback('Weak');
    else if (strength <= 50) setPasswordFeedback('Fair');
    else if (strength <= 75) setPasswordFeedback('Good');
    else setPasswordFeedback('Strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot-password') {
      await handleForgotPassword();
      return;
    }

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
        if (!email || !password || !name || !username) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name,
            username,
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
        // Sign in using NextAuth
        const result = await signIn('credentials', {
          redirect: false,
          email: signInEmail,
          password: signInPassword,
        });

        if (result?.error) {
          setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
        } else {
          // Fetch user data after successful sign in to update store
          const res = await fetch('/api/auth/session');
          if (res.ok) {
            const session = await res.json();
            if (session.user) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
                image: session.user.image,
              });
              setCurrentView(session.user.role === 'ADMIN' ? 'admin' : 'dashboard');
              if (onClose) onClose();
            }
          }
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

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      if (res.ok) {
        setForgotSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleFacebookLogin = () => {
    signIn('facebook', { callbackUrl: '/dashboard' });
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
                      placeholder="you@example.com (Voices of hope)"
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
                      placeholder="•••••••• (Your hope)"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300 group-hover:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setError('');
                    }}
                    className="text-xs text-amber-500 hover:text-amber-400 hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
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
                {showFixNotice && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-xl animate-in fade-in slide-in-from-top-4 mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="leading-relaxed">
                      Dhiifama gudda wajjin rakko registration website keenyaan walqabatee ture amma furameera. Yoo amma illee rakkon isin mudate ykn register gochuuf gargaarsa barbaaddan nu quunnama. Guyyaa eebba! 
                    </AlertDescription>
                  </Alert>
                )}
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
                        placeholder="john@example.com (Voices of hope)"
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
                        <div className="relative group">
                          <Input
                            id="signup-username"
                            placeholder="johndoe (Voice of hope)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className={`bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300 pr-10 ${
                              usernameAvailable === true ? 'border-emerald-500/50' : 
                              usernameAvailable === false ? 'border-red-500/50' : ''
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            {isCheckingUsername ? (
                              <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
                            ) : usernameAvailable === true ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : usernameAvailable === false ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                        {usernameAvailable === false && (
                          <p className="text-[10px] text-red-400 ml-1">Username is already taken</p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="signup-password" title="Password must be at least 8 characters with upper, number, and symbol" className="text-white font-medium flex items-center gap-2 mb-1">
                          <Key className="h-4 w-4 text-amber-500/70" />
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="•••••••• (Secure hope)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md transition-all duration-300"
                        />
                        {password && (
                          <div className="space-y-1.5 ml-1">
                            <div className="flex justify-between items-center text-[10px] h-3">
                              <span className="text-slate-500 uppercase tracking-wider font-bold">Strength</span>
                              <span className={`font-bold transition-colors ${
                                passwordStrength <= 25 ? 'text-red-400' :
                                passwordStrength <= 50 ? 'text-orange-400' :
                                passwordStrength <= 75 ? 'text-yellow-400' : 'text-emerald-400'
                              }`}>{passwordFeedback}</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  passwordStrength <= 25 ? 'bg-red-500' :
                                  passwordStrength <= 50 ? 'bg-orange-500' :
                                  passwordStrength <= 75 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Footer buttons */}
                <div className="flex items-center gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98]"
                      disabled={isLoading || !settingsLoaded || usernameAvailable === false || passwordStrength < 50}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                      Complete Registration
                    </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="forgot-password">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">Reset Password</h3>
                  <p className="text-slate-400 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-emerald-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-bold">Check your email</h4>
                      <p className="text-slate-400 text-sm">
                        If an account exists for {forgotEmail}, you will receive a password reset link shortly.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setMode('signin')}
                      className="border-slate-800 text-slate-300 hover:text-white"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="forgot-email" className="text-white font-medium flex items-center gap-2 mb-1">
                        <MailIcon className="h-4 w-4 text-amber-500" />
                        Email Address
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="bg-slate-900/40 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white placeholder:text-slate-600 h-12 rounded-xl backdrop-blur-md"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                      Send Reset link
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMode('signin')}
                      className="w-full text-slate-500 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Demo Accounts Removed for Production */}
        </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
