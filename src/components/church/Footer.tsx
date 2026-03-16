'use client';

import { useState, useMemo } from 'react';
import { Church, Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, CheckCircle2, Loader2, Music2 } from 'lucide-react';
import { GoogleTranslate } from './GoogleTranslate';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { useAppStore, ViewType } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterLink {
  label: string;
  view: ViewType;
  feature?: keyof ReturnType<typeof useAppStore>['settings']['features'];
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const allFooterLinks: FooterSection[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', view: 'home' },
      { label: 'Events', view: 'events', feature: 'eventsEnabled' },
      { label: 'Sermons', view: 'sermons', feature: 'sermonsEnabled' },
      { label: 'Prayer Wall', view: 'prayer', feature: 'prayerEnabled' },
    ],
  },
  {
    title: 'Get Involved',
    links: [
      { label: 'Small Groups', view: 'about', feature: 'smallGroupsEnabled' },
      { label: 'Contact Us', view: 'contact', feature: 'contactEnabled' },
      { label: 'Give Online', view: 'contact', feature: 'donationsEnabled' },
      { label: 'About Us', view: 'about', feature: 'aboutEnabled' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Bible Study', view: 'sermons', feature: 'sermonsEnabled' },
      { label: 'Devotionals', view: 'sermons', feature: 'sermonsEnabled' },
      { label: 'Newsletter', view: 'contact', feature: 'contactEnabled' },
      { label: 'FAQs', view: 'about', feature: 'aboutEnabled' },
    ],
  },
];

export function Footer() {
  const { setCurrentView, settings } = useAppStore();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter footer links based on enabled features
  const footerLinks = useMemo(() => {
    return allFooterLinks.map(section => ({
      title: section.title,
      links: section.links.filter(link => {
        if (!link.feature) return true;
        return settings.features[link.feature];
      }),
    })).filter(section => section.links.length > 0);
  }, [settings.features]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="h-10 w-10 mx-auto text-amber-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
            <p className="text-slate-400 mb-6">
              Get weekly devotionals, event updates, and spiritual encouragement delivered to your inbox.
            </p>
            
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading} className="bg-amber-500 hover:bg-amber-600">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            )}
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-12 w-12 object-contain" />
              ) : (
                <Church className="h-12 w-12 text-amber-500" />
              )}
              <span className="font-bold text-2xl">{settings.siteName || 'Digital Church'}</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              {settings.siteDescription || 'A vibrant community of faith, hope, and love. Join us as we grow together in our journey with Christ.'}
            </p>
            <div className="flex gap-4">
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {settings.socialTiktok && (
                <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
              {!settings.socialFacebook && !settings.socialInstagram && !settings.socialYoutube && !settings.socialTiktok && (
                <>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                    <TikTokIcon className="h-5 w-5" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => setCurrentView(link.view)}
                      className="text-slate-400 hover:text-amber-500 transition-colors text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Location</p>
              <p className="text-sm">{settings.address || '123 Church Street, City, State 12345'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Phone className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="text-sm">{settings.contactPhone || '(555) 123-4567'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Mail className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-sm">{settings.contactEmail || 'info@church.org'}</p>
            </div>
          </div>
        </div>

        {/* Service Times */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-center">Service Times</h3>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-amber-500 font-medium">Sunday</p>
              <p className="text-slate-400">10:00 AM & 6:00 PM</p>
            </div>
            <div className="text-center">
              <p className="text-amber-500 font-medium">Wednesday</p>
              <p className="text-slate-400">7:30 PM</p>
            </div>
            <div className="text-center">
              <p className="text-amber-500 font-medium">Online</p>
              <p className="text-slate-400">Live Stream Available</p>
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center">
          <GoogleTranslate variant="footer" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} {settings.siteName || 'Digital Church'}. All rights reserved. 
            <span className="ml-2 pl-2 border-l border-slate-800">
              Developed by <a href="https://t.me/dmalifu" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 font-medium">AlifXperience</a>
            </span>
          </p>
          <div className="text-sm text-slate-400">
            version 0.1
          </div>
        </div>
      </div>
    </footer>
  );
}
