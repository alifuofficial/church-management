'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Church, AlertCircle, Loader2, Globe, Facebook, Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

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
  onClose?: () => void;
}

export function AuthForm({ onClose }: AuthFormProps) {
  const { setUser, setCurrentView } = useAppStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialSettings, setSocialSettings] = useState<SocialLoginSettings | null>(null);
  const [verificationSettings, setVerificationSettings] = useState<VerificationSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
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
          console.log('Email verification settings loaded:', data.isEnabled ? 'ENABLED' : 'DISABLED');
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
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name,
            role: 'MEMBER',
          }),
        });

        if (res.ok) {
          const user = await res.json();
          
          // Check if email verification is enabled
          const isVerificationEnabled = verificationSettings?.isEnabled === true;
          console.log('Email verification enabled:', isVerificationEnabled);
          
          if (isVerificationEnabled) {
            // Send verification code
            const sendRes = await fetch('/api/auth/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            
            const sendData = await sendRes.json();
            
            // Always show verification screen when verification is enabled
            setPendingUserId(user.id);
            setPendingEmail(user.email);
            setShowVerification(true);
            setResendCooldown(verificationSettings?.resendCooldownSeconds || 60);
            
            if (sendRes.ok) {
              // Show dev code if available (for testing)
              if (sendData._devCode) {
                setVerificationCode(sendData._devCode);
              }
            } else {
              // Show error but still show verification screen
              // Show dev code if available (for testing)
              if (sendData._devCode) {
                setVerificationCode(sendData._devCode);
                setVerificationError('Email not sent. Use the code shown for testing.');
              } else {
                setVerificationError(sendData.error || 'Failed to send verification email. You can try resending the code.');
              }
            }
          } else {
            // No verification required, log in directly
            console.log('No verification required, going to dashboard');
            setUser(user);
            setCurrentView('dashboard');
            onClose?.();
          }
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create account');
        }
      } else {
        // Sign in - use proper login API with password validation
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // Include cookies for session
        });
        
        const data = await res.json();
        
        if (res.ok) {
          // Check if verification is enabled and user is not verified
          if (verificationSettings?.isEnabled && !data.user?.isVerified && data.user?.id) {
            // Resend verification code
            const sendRes = await fetch('/api/auth/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.user.id }),
            });
            
            const sendData = await sendRes.json();
            
            // Show verification screen
            setPendingUserId(data.user.id);
            setPendingEmail(data.user.email);
            setShowVerification(true);
            setResendCooldown(verificationSettings.resendCooldownSeconds || 60);
            
            // Show dev code if available
            if (sendData._devCode) {
              setVerificationCode(sendData._devCode);
            }
            
            if (!sendRes.ok && !sendData._devCode) {
              setVerificationError(sendData.error || 'Please verify your email to continue.');
            }
            setIsLoading(false);
            return;
          }
          
          setUser(data.user);
          setCurrentView(data.user.role === 'ADMIN' ? 'admin' : 'dashboard');
          onClose?.();
        } else {
          setError(data.error || 'Invalid email or password');
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
        onClose?.();
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
        // Show dev code if available
        if (data._devCode) {
          setVerificationCode(data._devCode);
        }
      } else {
        // Show dev code if available even on error
        if (data._devCode) {
          setVerificationCode(data._devCode);
          setVerificationError('Email not sent. Use the code shown for testing.');
        } else {
          setVerificationError(data.error || 'Failed to resend code');
        }
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setVerificationError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/api/auth/facebook';
  };

  const hasSocialLogin = socialSettings?.googleEnabled || socialSettings?.facebookEnabled;

  // Verification screen
  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-600 p-3 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We sent a {verificationSettings?.codeLength || 6}-digit code to<br />
              <span className="font-medium text-foreground">{pendingEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, verificationSettings?.codeLength || 6))}
                className="text-center text-2xl tracking-widest h-14"
                maxLength={verificationSettings?.codeLength || 6}
              />
            </div>
            
            <Button 
              onClick={handleVerifyCode}
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isVerifying || verificationCode.length !== (verificationSettings?.codeLength || 6)}
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Verify Email
            </Button>
            
            <div className="flex items-center justify-between text-sm">
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
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
                className="text-muted-foreground"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              Code expires in {verificationSettings?.codeExpirationMinutes || 10} minutes
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-600 p-3 rounded-full">
              <Church className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Digital Church</CardTitle>
          <CardDescription>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            {hasSocialLogin && (
              <div className="space-y-3 mb-4">
                {socialSettings?.googleEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Continue with Google
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
                    Continue with Facebook
                  </Button>
                )}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading || !settingsLoaded}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {verificationSettings?.isEnabled && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    You&apos;ll need to verify your email after registration
                  </p>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading || !settingsLoaded}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
