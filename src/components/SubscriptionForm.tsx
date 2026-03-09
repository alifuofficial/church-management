'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Check, Loader2 } from 'lucide-react';

interface SubscriptionFormProps {
  source?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export function SubscriptionForm({ 
  source = 'website', 
  className = '',
  variant = 'default'
}: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center gap-2 text-green-400 ${className}`}>
        <Check className="h-5 w-5" />
        <span>Thanks for subscribing!</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-amber-500 hover:bg-amber-600 text-black whitespace-nowrap"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
        </Button>
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </form>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          </Button>
        </div>
        {error && <span className="text-red-400 text-sm mt-1 block">{error}</span>}
      </form>
    );
  }

  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${className}`}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Subscribe to our Newsletter</h3>
          </div>
          
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
          
          {error && <span className="text-red-400 text-sm">{error}</span>}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
          
          <p className="text-slate-500 text-xs text-center">
            By subscribing, you agree to receive email updates. You can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
