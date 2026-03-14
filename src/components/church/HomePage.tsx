'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Calendar,
  Heart,
  ArrowRight,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  BookOpen,
  Cross,
  Users,
  Loader2,
  Target,
  Sparkles,
  Church,
  Compass,
  Star,
  Mail,
  Quote,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string | null;
  dayOfWeek: number;
  startTime: string;
  location: string | null;
  isOnline: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  zoomJoinUrl: string | null;
}

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  speakerName: string;
  scripture: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  publishedAt: string;
  series?: { name: string } | null;
}

interface Campaign {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  goal: number | null;
  raised: number;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface Testimony {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  testimony: string;
  rating: number;
  isFeatured: boolean;
  createdAt: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HomePage() {
  const { setCurrentView, settings } = useAppStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimony, setActiveTestimony] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchPromises = [];
        
        if (settings.features.eventsEnabled) {
          fetchPromises.push(
            fetch('/api/programs').then(res => res.json()).then(data => setPrograms(data))
          );
          fetchPromises.push(
            fetch('/api/events?upcoming=true&limit=3').then(res => res.json()).then(data => setEvents(data))
          );
        }
        
        if (settings.features.sermonsEnabled) {
          fetchPromises.push(
            fetch('/api/sermons?limit=3&featured=true').then(res => res.json()).then(data => setSermons(data))
          );
        }
        
        if (settings.features.donationsEnabled) {
          fetchPromises.push(
            fetch('/api/campaigns?active=true&stats=true').then(res => res.json()).then(data => setCampaigns(data))
          );
        }
        
        // Always fetch testimonies
        fetchPromises.push(
          fetch('/api/testimonies?approved=true').then(res => res.json()).then(data => setTestimonies(Array.isArray(data) ? data : []))
        );
        
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTestimonies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [settings.features.eventsEnabled, settings.features.sermonsEnabled, settings.features.donationsEnabled]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Modern & Creative */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Layer */}
        {settings.heroBackgroundImage ? (
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 opacity-60"
              style={{ backgroundImage: `url(${settings.heroBackgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0" />
        )}
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Mesh Gradient Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-[80px] animate-[pulse_10s_ease-in-out_infinite_1s]" />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-gradient-to-bl from-yellow-500/10 via-amber-400/5 to-transparent rounded-full blur-[60px] animate-[pulse_12s_ease-in-out_infinite_2s]" />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 10}s`,
              }}
            />
          ))}
          
          {/* Decorative Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500/30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Glowing Cross Silhouette */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
              <path d="M40 10 L60 10 L60 40 L90 40 L90 60 L60 60 L60 90 L40 90 L40 60 L10 60 L10 40 L40 40 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Welcome Home</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">Find Your</span>
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    Spiritual Home
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" strokeWidth="3" strokeLinecap="round" className="text-amber-500/50" stroke="url(#paint0_linear)" />
                    <defs>
                      <linearGradient id="paint0_linear" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="0.5" stopColor="#f59e0b" stopOpacity="0.6" />
                        <stop offset="1" stopColor="#f59e0b" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                <span className="text-white">at</span>
                <br />
                <span className="text-amber-500">{settings.siteName || 'Our Church'}</span>
              </h1>
              
              {/* Description */}
              <p className="text-base md:text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {settings.siteDescription || 'A community of faith, hope, and love. Join us on a journey of spiritual growth and meaningful connections.'}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="group relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25"
                  onClick={() => setCurrentView('events')}
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Join Our Service
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group border-2 border-slate-700 text-white hover:bg-slate-800/50 hover:border-amber-500/30 px-8 py-6 rounded-2xl backdrop-blur-sm transition-all duration-300"
                  onClick={() => setCurrentView('about')}
                >
                  <Compass className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Explore Faith
                </Button>
              </div>
              
              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                {/* Members Count */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-black"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-semibold">500+</p>
                    <p className="text-slate-500 text-sm">Active Members</p>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="hidden sm:block w-px h-12 bg-slate-800" />
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-semibold">4.9/5</p>
                    <p className="text-slate-500 text-sm">Community Rating</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Creative Card Layout */}
            <div className="order-1 lg:order-2 relative">
              {/* Main Feature Card */}
              <div className="relative">
                {/* Glassmorphism Card */}
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                  {/* Decorative Corner */}
                  <div className="absolute -top-px -right-px w-24 h-24 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-tr-3xl" />
                  
                  {/* Church Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                    <Church className="w-10 h-10 text-black" />
                  </div>
                  
                  {/* Card Content */}
                  <h3 className="text-2xl font-bold text-white mb-3">Join Us This Sunday</h3>
                  <p className="text-slate-400 mb-6">Experience worship, community, and spiritual growth with us.</p>
                  
                  {/* Service Times */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">First Service</p>
                          <p className="text-slate-500 text-sm">8:00 AM</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0">Live</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Second Service</p>
                          <p className="text-slate-500 text-sm">10:30 AM</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-0">Online</Badge>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-6 group">
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                {/* Floating Decorative Cards Removed */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-500 text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center pt-2 bg-slate-800/50 backdrop-blur-sm">
            <div className="w-1.5 h-3 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full animate-scroll-indicator" />
          </div>
        </div>
      </section>

      {/* Quick Stats - Minimal */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
              <div className="text-slate-500 text-sm">Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">39</div>
              <div className="text-slate-500 text-sm">Years</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
              <div className="text-slate-500 text-sm">Countries</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-slate-500 text-sm">Prayer Line</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section className="py-32 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Our Ministries & Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience church in a fresh, modern way with our comprehensive digital ministry and community resources.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {settings.features.eventsEnabled && (
              <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Video className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Live Streaming</h3>
                  <p className="text-slate-500 text-sm">Join services from anywhere with HD streaming</p>
                </CardContent>
              </Card>
            )}
            
            {settings.features.sermonsEnabled && (
              <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sermons</h3>
                  <p className="text-slate-500 text-sm">Access our library of messages anytime</p>
                </CardContent>
              </Card>
            )}
            
            {settings.features.smallGroupsEnabled && (
              <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Small Groups</h3>
                  <p className="text-slate-500 text-sm">Connect with others in community groups</p>
                </CardContent>
              </Card>
            )}
            
            {settings.features.prayerEnabled && (
              <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Heart className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prayer Support</h3>
                  <p className="text-slate-500 text-sm">24/7 prayer line and request system</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Testimonies Section - Modern & Creative */}
      {testimonies.length > 0 && (
      <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Life-Changing Stories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Voices of <span className="text-amber-500">Transformation</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Real stories from our community members whose lives have been touched by faith and fellowship
            </p>
          </div>

          {/* Featured Testimony - Large Card */}
          {testimonies.filter(t => t.isFeatured).length > 0 && (
            <div className="mb-16 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Person Info */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      {testimonies.find(t => t.isFeatured)?.image ? (
                        <img 
                          src={testimonies.find(t => t.isFeatured)?.image || ''} 
                          alt={testimonies.find(t => t.isFeatured)?.name}
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-amber-500/30 shadow-xl mx-auto md:mx-0"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl md:text-4xl font-bold text-black shadow-xl mx-auto md:mx-0">
                          {testimonies.find(t => t.isFeatured)?.name.charAt(0)}
                        </div>
                      )}
                      <div className="mt-4">
                        <h4 className="text-xl font-bold text-white">
                          {testimonies.find(t => t.isFeatured)?.name}
                        </h4>
                        {testimonies.find(t => t.isFeatured)?.role && (
                          <p className="text-amber-400 text-sm mt-1">
                            {testimonies.find(t => t.isFeatured)?.role}
                          </p>
                        )}
                      </div>
                      {/* Rating */}
                      <div className="flex gap-1 justify-center md:justify-start mt-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < (testimonies.find(t => t.isFeatured)?.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Quote */}
                    <div className="flex-1">
                      <Quote className="w-12 h-12 text-amber-500/30 mb-4" />
                      <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed italic">
                        &ldquo;{testimonies.find(t => t.isFeatured)?.testimony}&rdquo;
                      </blockquote>
                      <Badge className="mt-6 bg-amber-500/10 text-amber-400 border-amber-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured Testimony
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Testimony Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => setActiveTestimony(prev => prev === 0 ? testimonies.length - 1 : prev - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-amber-500/50 transition-all hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTestimony(prev => prev === testimonies.length - 1 ? 0 : prev + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-amber-500/50 transition-all hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden px-8 md:px-16">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeTestimony * 100}%)` }}
              >
                {testimonies.map((testimony) => (
                  <div key={testimony.id} className="w-full flex-shrink-0 px-4">
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors max-w-2xl mx-auto">
                      <CardContent className="p-8">
                        {/* Rating Stars */}
                        <div className="flex gap-1 mb-6 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < testimony.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                        
                        {/* Quote */}
                        <blockquote className="text-lg md:text-xl text-slate-200 text-center leading-relaxed mb-6 italic">
                          &ldquo;{testimony.testimony}&rdquo;
                        </blockquote>
                        
                        {/* Author */}
                        <div className="flex flex-col items-center">
                          {testimony.image ? (
                            <img 
                              src={testimony.image} 
                              alt={testimony.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30 mb-3"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl font-bold text-black mb-3">
                              {testimony.name.charAt(0)}
                            </div>
                          )}
                          <h4 className="text-lg font-semibold text-white">{testimony.name}</h4>
                          {testimony.role && (
                            <p className="text-slate-500 text-sm">{testimony.role}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimony(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeTestimony === index 
                      ? 'bg-amber-500 w-8' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-16 border-t border-slate-800">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">{testimonies.length}+</div>
              <div className="text-slate-500 text-sm">Life Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">500+</div>
              <div className="text-slate-500 text-sm">Lives Changed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">4.9</div>
              <div className="text-slate-500 text-sm">Avg. Rating</div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Latest Sermons - Clean Cards */}
      {settings.features.sermonsEnabled && sermons.length > 0 && (
      <section className="py-32 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Spiritual Growth & Messages</h2>
              <p className="text-slate-400 text-lg">Deepen your faith with our latest curated sermons and teachings.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('sermons')}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-8"
            >
              View All Sermons
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {sermons.map((sermon) => (
                <Card 
                  key={sermon.id} 
                  className="group bg-slate-800/50 border-slate-700 overflow-hidden hover:border-amber-500/30 transition-all"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden bg-slate-700">
                      <img
                        src={sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800'}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <Button 
                        size="icon"
                        className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-7 w-7 text-black ml-1" />
                      </Button>
                      {sermon.duration && (
                        <Badge className="absolute bottom-3 right-3 bg-black/70 text-white border-0">
                          {Math.floor(sermon.duration / 60)} min
                        </Badge>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {sermon.title}
                      </h3>
                      <p className="text-slate-500 text-sm">{sermon.speakerName}</p>
                      {sermon.scripture && (
                        <Badge variant="secondary" className="mt-3 bg-slate-700 text-slate-300 border-0">
                          {sermon.scripture}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Weekly Schedule - Simple List */}
      {settings.features.eventsEnabled && programs.length > 0 && (
      <section className="py-32 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Weekly Ministry Schedule</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Join our community gatherings and services held throughout the week.</p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-5 max-w-5xl mx-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-5 max-w-5xl mx-auto">
              {programs.slice(0, 5).map((program) => (
                <Card 
                  key={program.id} 
                  className="bg-slate-900 border-slate-800 hover:border-amber-500/50 transition-colors text-center"
                >
                  <CardContent className="p-5">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 mb-3">
                      {dayNames[program.dayOfWeek]}
                    </Badge>
                    <h3 className="text-white font-semibold mb-2">{program.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatTime(program.startTime)}
                    </div>
                    {program.isOnline && (
                      <Badge variant="secondary" className="mt-2 bg-slate-800 text-slate-400 border-0 text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('events')}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              View All Events
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Upcoming Events - Clean Timeline */}
      {settings.features.eventsEnabled && events.length > 0 && (
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-slate-400">Don&apos;t miss these special gatherings</p>
          </div>

          {isLoading ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-800 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {events.slice(0, 3).map((event) => (
                <Card 
                  key={event.id} 
                  className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-center justify-center bg-amber-500 rounded-xl w-16 h-16 shrink-0">
                        <span className="text-2xl font-bold text-black">
                          {new Date(event.startDate).getDate()}
                        </span>
                        <span className="text-xs font-medium text-black/70 uppercase">
                          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            {event.type.replace('_', ' ')}
                          </Badge>
                          {event.isOnline && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white truncate">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-black shrink-0"
                        onClick={() => setCurrentView('events')}
                      >
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Active Campaigns Section */}
      {settings.features.donationsEnabled && campaigns.length > 0 && (
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Support Our Mission</h2>
            <p className="text-slate-400">Help us make a difference through these campaigns</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {campaigns.slice(0, 3).map((campaign) => {
                const progress = campaign.goal && campaign.goal > 0 
                  ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) 
                  : 0;
                
                return (
                  <Card 
                    key={campaign.id} 
                    className="group bg-slate-800/50 border-slate-700 overflow-hidden hover:border-amber-500/30 transition-all cursor-pointer"
                    onClick={() => window.location.href = `/campaign/${campaign.slug || campaign.id}`}
                  >
                    {campaign.imageUrl ? (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                        <Target className="h-16 w-16 text-amber-500/50" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {campaign.name}
                      </h3>
                      {campaign.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                      )}
                      
                      {campaign.goal && campaign.goal > 0 && (
                        <div className="space-y-2">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>${campaign.raised.toLocaleString()} raised</span>
                            <span>{progress}% of ${campaign.goal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/campaign/${campaign.slug || campaign.id}`;
                        }}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Donate Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Final CTA - Simple & Clean */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Cross className="h-12 w-12 mx-auto text-amber-500 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Whether you&apos;re exploring faith for the first time or looking for a church home, we welcome you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {settings.features.eventsEnabled && (
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
                  onClick={() => setCurrentView('events')}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Attend a Service
                </Button>
              )}
              {settings.features.contactEnabled && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-600 text-white hover:bg-slate-800 hover:text-white px-8"
                  onClick={() => setCurrentView('contact')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
