'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

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

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Request</CardTitle>
            <CardDescription className="text-slate-400">
              The password reset link is missing or invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      setError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/'); // Redirect to home so they can sign in
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Premium Animated Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-lg bg-slate-900/40 border-slate-800/50 backdrop-blur-2xl shadow-2xl relative z-10 border-t-amber-500/20">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-3xl shadow-lg shadow-amber-500/20 transform hover:scale-110 transition-transform duration-300">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-slate-400 text-lg mt-2">
            Choose a secure password for your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          {success ? (
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Password Reset!</h3>
                <p className="text-slate-400">
                  Your password has been successfully updated. Redirecting you to sign in...
                </p>
              </div>
              <Button asChild variant="outline" className="border-slate-800 text-slate-300 hover:text-white">
                <Link href="/">Return to Sign In Now</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium ml-1">New Password</Label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-slate-950/50 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white h-14 rounded-2xl transition-all duration-300 pr-12 text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 mt-2 px-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Strength:</span>
                        <span className={cn(
                          "font-bold",
                          passwordStrength <= 25 && "text-red-500",
                          passwordStrength <= 50 && "text-orange-500",
                          passwordStrength <= 75 && "text-amber-500",
                          passwordStrength > 75 && "text-emerald-500"
                        )}>
                          {passwordFeedback}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 ease-out rounded-full",
                            passwordStrength <= 25 && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                            passwordStrength <= 50 && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
                            passwordStrength <= 75 && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                            passwordStrength > 75 && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          )}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        Use 8+ characters with uppercase, numbers and symbols
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium ml-1">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-slate-950/50 border-slate-800 focus:border-amber-500/50 focus:ring-amber-500/20 text-white h-14 rounded-2xl transition-all duration-300 text-lg"
                    />
                    <ShieldCheck className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300",
                      confirmPassword && password === confirmPassword ? "text-emerald-500" : "text-slate-800"
                    )} />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || passwordStrength < 50}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold h-14 rounded-2xl shadow-xl shadow-amber-500/20 transition-all duration-300 transform active:scale-[0.98] text-lg uppercase tracking-wider"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-3" />
                    Reset Password
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Button asChild variant="ghost" className="text-slate-500 hover:text-white hover:bg-white/5 rounded-xl">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      {/* Decorative Elements */}
      <div className="fixed bottom-10 left-10 text-slate-900 font-black text-9xl pointer-events-none select-none opacity-10">
        FAITH
      </div>
      <div className="fixed top-10 right-10 text-slate-900 font-black text-9xl pointer-events-none select-none opacity-10 rotate-180">
        HOPE
      </div>
    </div>
  );
}
