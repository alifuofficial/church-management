'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Church, Rocket, Wrench, Lock, Mail, Clock, 
  ArrowRight, CheckCircle2, AlertTriangle, Loader2, Shield
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteMode: 'live' | 'coming_soon' | 'maintenance' | 'private';
  statusHeadline: string;
  statusMessage: string;
  launchDate: string;
  collectEmails: boolean;
  showProgress: boolean;
  statusBackgroundImage: string;
  statusContactEmail: string;
  allowRegistration: boolean;
  showLoginForm: boolean;
  privateMessage: string;
  logoUrl: string;
}

interface ComingSoonPageProps {
  settings: SiteSettings;
  onAdminLogin: () => void;
}

export function ComingSoonPage({ settings, onAdminLogin }: ComingSoonPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer
  useEffect(() => {
    if (!settings.launchDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(settings.launchDate).getTime() - Date.now();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [settings.launchDate]);

  const handleSubscribe = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsSubmitting(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: settings.statusBackgroundImage 
          ? `url(${settings.statusBackgroundImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    >
      {/* Overlay */}
      {settings.statusBackgroundImage && (
        <div className="absolute inset-0 bg-slate-900/80" />
      )}
      
      {/* Admin Login Link - Top Right */}
      <button
        onClick={onAdminLogin}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
      >
        <Shield className="h-4 w-4" />
        <span className="text-sm">Admin</span>
      </button>
      
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Church className="h-10 w-10 text-amber-400" />
            </div>
          )}
        </div>

        {/* Rocket Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Rocket className="h-12 w-12 text-amber-400" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {settings.statusHeadline || 'Something Amazing is Coming!'}
        </h1>

        {/* Message */}
        <p className="text-xl text-slate-300 mb-8">
          {settings.statusMessage || "We're building something special. Be the first to know when we launch!"}
        </p>

        {/* Countdown Timer */}
        {settings.launchDate && (
          <div className="grid grid-cols-4 gap-4 mb-8 max-w-md mx-auto">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Seconds' },
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-amber-400">{item.value}</div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Email Subscription */}
        {settings.collectEmails && !isSubscribed && (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 flex-1"
            />
            <Button 
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Notify Me <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {isSubscribed && (
          <Card className="bg-emerald-500/10 border-emerald-500/30 max-w-md mx-auto mb-8">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-emerald-300">Thanks! We'll notify you when we launch.</p>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {settings.statusContactEmail && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${settings.statusContactEmail}`} className="hover:text-amber-400 transition">
              {settings.statusContactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface MaintenancePageProps {
  settings: SiteSettings;
  onAdminLogin: () => void;
}

export function MaintenancePage({ settings, onAdminLogin }: MaintenancePageProps) {
  const [progress] = useState(65);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: settings.statusBackgroundImage 
          ? `url(${settings.statusBackgroundImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    >
      {/* Overlay */}
      {settings.statusBackgroundImage && (
        <div className="absolute inset-0 bg-slate-900/80" />
      )}
      
      {/* Admin Login Link - Top Right */}
      <button
        onClick={onAdminLogin}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
      >
        <Shield className="h-4 w-4" />
        <span className="text-sm">Admin</span>
      </button>
      
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Church className="h-10 w-10 text-orange-400" />
            </div>
          )}
        </div>

        {/* Wrench Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Wrench className="h-12 w-12 text-orange-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {settings.statusHeadline || 'Under Maintenance'}
        </h1>

        {/* Message */}
        <p className="text-xl text-slate-300 mb-8">
          {settings.statusMessage || "We're currently performing scheduled maintenance. Please check back soon."}
        </p>

        {/* Progress Bar */}
        {settings.showProgress && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Maintenance Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-8">
          <Clock className="h-4 w-4" />
          <span>Estimated time: 30 minutes</span>
        </div>

        {/* Contact */}
        {settings.statusContactEmail && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${settings.statusContactEmail}`} className="hover:text-orange-400 transition">
              {settings.statusContactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface PrivateModePageProps {
  settings: SiteSettings;
  onLogin: () => void;
  onAdminLogin: () => void;
}

export function PrivateModePage({ settings, onLogin, onAdminLogin }: PrivateModePageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: settings.statusBackgroundImage 
          ? `url(${settings.statusBackgroundImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    >
      {/* Overlay */}
      {settings.statusBackgroundImage && (
        <div className="absolute inset-0 bg-slate-900/80" />
      )}
      
      {/* Admin Login Link - Top Right */}
      <button
        onClick={onAdminLogin}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
      >
        <Shield className="h-4 w-4" />
        <span className="text-sm">Admin</span>
      </button>
      
      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Church className="h-10 w-10 text-purple-400" />
            </div>
          )}
        </div>

        {/* Lock Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Lock className="h-10 w-10 text-purple-400" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {settings.siteName || 'Private Site'}
        </h1>

        {/* Message */}
        <p className="text-slate-400 text-center mb-8">
          {settings.privateMessage || 'This site is private. Please log in to continue.'}
        </p>

        {/* Login Form */}
        {settings.showLoginForm && (
          <Card className="bg-slate-800/50 border-slate-700 mb-4">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <Button 
                onClick={onLogin}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Register Link */}
        {settings.allowRegistration && (
          <p className="text-center text-slate-400">
            Don&apos;t have an account?{' '}
            <button onClick={onLogin} className="text-purple-400 hover:text-purple-300 transition">
              Request Access
            </button>
          </p>
        )}

        {/* Contact */}
        {settings.statusContactEmail && (
          <div className="flex items-center justify-center gap-2 text-slate-400 mt-6">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${settings.statusContactEmail}`} className="hover:text-purple-400 transition">
              {settings.statusContactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
