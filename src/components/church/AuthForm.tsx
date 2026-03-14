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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Church, AlertCircle, Loader2, Globe, Facebook, Mail, 
  ArrowLeft, RefreshCw, CheckCircle2, User, MapPin, 
  Heart, Shield, ChevronRight, ChevronLeft, X, Smartphone,
  Sparkles
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
  const { setUser, setCurrentView } = useAppStore();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [signupStep, setSignupStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialSettings, setSocialSettings] = useState<SocialLoginSettings | null>(null);
  const [verificationSettings, setVerificationSettings] = useState<VerificationSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Signup Form state
  // Step 1: Basic
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: Location
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState('');
  
  // Step 3: Faith
  const [denomination, setDenomination] = useState('');
  const [faithStatus, setFaithStatus] = useState('');
  const [localChurch, setLocalChurch] = useState('');
  
  // Step 4: Interests
  const [interests, setInterests] = useState<string[]>([]);
  
  // Step 5: Agreements
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedStatementOfFaith, setAcceptedStatementOfFaith] = useState(false);
  
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

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleNextStep = () => {
    if (signupStep === 1) {
      if (!name || !email || !username || !password) {
        setError('Please fill in all basic information');
        return;
      }
    }
    if (signupStep === 2) {
      if (!country || !city || !timezone) {
        setError('Please fill in all location information');
        return;
      }
    }
    setError('');
    setSignupStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setSignupStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && signupStep < 5) {
      handleNextStep();
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
        if (!acceptedTerms || !acceptedPrivacy || !acceptedStatementOfFaith) {
          setError('Please accept all agreements to continue');
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
            country,
            city,
            timezone,
            denomination,
            faithStatus,
            localChurch,
            interests: interests.join(','),
            acceptedTerms,
            acceptedPrivacy,
            acceptedStatementOfFaith,
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
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
                <Church className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 animate-pulse">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
            Digital Sanctuary
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">
            {mode === 'signin' ? 'Welcome back to our community' : `Member Registration • Step ${signupStep} of 5`}
          </CardDescription>
        </CardHeader>
        
        <ScrollArea className="max-h-[75vh] overflow-y-auto">
          <CardContent className="pt-2 pb-8 px-6">
          <Tabs value={mode} onValueChange={(v) => {
            setMode(v as 'signin' | 'signup');
            setSignupStep(1);
            setError('');
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
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
                {/* Step 1: Basic Information */}
                {signupStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Basic Personal Information</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300">Email Address (required for login and communication)</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                  </div>
                )}

                {/* Step 2: Location Information */}
                {signupStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Location Information</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-country">Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="signup-country">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="signup-city" className="text-slate-700 dark:text-slate-300">City / Region</Label>
                      <Input
                        id="signup-city"
                        placeholder="Nairobi / Addis Ababa"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-timezone">Time Zone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="signup-timezone">
                          <SelectValue placeholder="Select Time Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC+3">UTC+3 (East Africa Time)</SelectItem>
                          <SelectItem value="UTC+1">UTC+1 (West Africa Time)</SelectItem>
                          <SelectItem value="UTC+0">UTC (Greenwich Mean Time)</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Faith Information */}
                {signupStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <Church className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Church / Faith Information</h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-denomination">Denomination (Optional)</Label>
                      <Select value={denomination} onValueChange={setDenomination}>
                        <SelectTrigger id="signup-denomination">
                          <SelectValue placeholder="Select Denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baptist">Baptist</SelectItem>
                          <SelectItem value="Anglican">Anglican</SelectItem>
                          <SelectItem value="Lutheran">Lutheran</SelectItem>
                          <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 pt-2">
                      <Label>Are you a Christian?</Label>
                      <div className="space-y-2">
                        {['Yes', 'Exploring Faith', 'New Believer'].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`faith-${option}`} 
                              checked={faithStatus === option}
                              onCheckedChange={() => setFaithStatus(option)}
                            />
                            <Label 
                              htmlFor={`faith-${option}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="signup-localchurch">Local Church Name (Optional)</Label>
                      <Input
                        id="signup-localchurch"
                        placeholder="Grace Community Church"
                        value={localChurch}
                        onChange={(e) => setLocalChurch(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Interests */}
                {signupStep === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <Heart className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Interests or Ministries</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the areas you are interested in:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {signUpMinistries.map((ministry) => (
                        <div key={ministry.id} className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <Checkbox 
                            id={`interest-${ministry.id}`} 
                            checked={interests.includes(ministry.label)}
                            onCheckedChange={() => toggleInterest(ministry.label)}
                          />
                          <Label 
                            htmlFor={`interest-${ministry.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {ministry.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Agreements */}
                {signupStep === 5 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Agreement and Consent</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <Checkbox 
                          id="terms" 
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                            I accept the Terms of Use
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I agree to follow the community guidelines and rules.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <Checkbox 
                          id="privacy" 
                          checked={acceptedPrivacy}
                          onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="privacy" className="text-sm font-medium leading-none cursor-pointer">
                            I accept the Privacy Policy
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I understand how my data will be used and protected.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <Checkbox 
                          id="faith-statement" 
                          checked={acceptedStatementOfFaith}
                          onCheckedChange={(checked) => setAcceptedStatementOfFaith(checked as boolean)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="faith-statement" className="text-sm font-medium leading-none cursor-pointer">
                            I agree with the Statement of Faith
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I align with the core spiritual beliefs of this church.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center gap-3 pt-4">
                  {signupStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handlePrevStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  
                  <Button 
                    type="submit" 
                    className={`flex-[2] bg-amber-600 hover:bg-amber-700 ${signupStep === 1 ? 'w-full' : ''}`}
                    disabled={isLoading || !settingsLoaded}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {signupStep === 5 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Registration
                      </>
                    ) : (
                      <>
                        Next Step
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
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
