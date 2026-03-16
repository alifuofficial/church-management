'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Globe,
  Users,
  Cross,
  Loader2,
  Compass,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
  Twitter
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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ContactPage() {
  const { settings } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch('/api/programs');
        if (res.ok) {
          const data = await res.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setIsLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after delay
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 5000);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Our team is here to help',
      value: settings.contactEmail || 'info@gracecommunity.church',
      color: 'from-amber-500 to-orange-500',
      action: () => window.location.href = `mailto:${settings.contactEmail || 'info@gracecommunity.church'}`
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri 9am - 5pm',
      value: settings.contactPhone || '(555) 123-4567',
      color: 'from-emerald-500 to-teal-500',
      action: () => window.location.href = `tel:${settings.contactPhone}`
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Join our local community',
      value: settings.address || '123 Faith St, Grace City',
      color: 'from-blue-500 to-cyan-500',
      action: () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || '')}`, '_blank')
    }
  ];

  return (
    <div className="flex flex-col bg-slate-950 min-h-screen">
      {/* Hero Section - Premium Design */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">We're Here for You</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Get in <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Have questions or need prayer? Our ministry team is dedicated to supporting your spiritual journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            
            {/* Left Column: Contact Methods & Socials (4 columns) */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                  <div className="h-8 w-1 bg-amber-500 rounded-full" />
                  Contact Information
                </h2>

                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <Card 
                      key={index}
                      onClick={method.action}
                      className="bg-slate-900/50 border-slate-800 hover:border-amber-500/40 transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-5">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                            <method.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg mb-1">{method.title}</h3>
                            <p className="text-slate-500 text-sm mb-2">{method.description}</p>
                            <p className="text-amber-400 font-medium break-all">{method.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Social Links */}
                <div className="pt-8">
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-500" />
                    Follow Our Ministry
                  </h3>
                  <div className="flex gap-4">
                    {[
                      { icon: Facebook, href: settings.socialFacebook },
                      { icon: Youtube, href: settings.socialYoutube },
                      { icon: Instagram, href: settings.socialInstagram },
                      { icon: Twitter, href: '#' }
                    ].map((social, i) => (
                      <Button
                        key={i}
                        size="icon"
                        variant="outline"
                        className="w-12 h-12 rounded-xl border-slate-800 bg-slate-900 hover:bg-amber-500 hover:text-black transition-all group"
                        onClick={() => social.href && social.href !== '#' && window.open(social.href, '_blank')}
                      >
                        <social.icon className="w-5 h-5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Middle Column: Contact Form (5 columns) */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                  <CardContent className="p-8 md:p-10">
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center py-16"
                        >
                          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Thank you for reaching out to us. Our team will get back to you within 24-48 hours.
                          </p>
                          <Button 
                            onClick={() => setSubmitted(false)}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-6 rounded-xl transition-all"
                          >
                            Send Another Message
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.form 
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmit} 
                          className="space-y-6"
                        >
                          <div className="mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Send a Message</h2>
                            <p className="text-slate-500 font-medium">How can we support you today?</p>
                          </div>

                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-slate-300 font-semibold ml-1">Full Name</Label>
                              <Input
                                id="name"
                                placeholder="E.g. John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 h-14 rounded-xl px-5 transition-all"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-slate-300 font-semibold ml-1">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 h-14 rounded-xl px-5 transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subject" className="text-slate-300 font-semibold ml-1">Inquiry Type</Label>
                            <Select value={subject} onValueChange={setSubject}>
                              <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white focus:border-amber-500 h-14 rounded-xl px-5 transition-all">
                                <SelectValue placeholder="What is this regarding?" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="prayer">Prayer Request</SelectItem>
                                <SelectItem value="volunteer">Volunteer Opportunities</SelectItem>
                                <SelectItem value="membership">Membership</SelectItem>
                                <SelectItem value="events">Events & Programs</SelectItem>
                                <SelectItem value="pastoral">Pastoral Guidance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message" className="text-slate-300 font-semibold ml-1">Your Message</Label>
                            <Textarea
                              id="message"
                              placeholder="Type your message here..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={6}
                              className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 rounded-xl px-5 py-4 transition-all resize-none"
                              required
                            />
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-black py-8 rounded-xl shadow-lg transition-all group overflow-hidden relative"
                            disabled={isSubmitting}
                          >
                            <AnimatePresence mode="wait">
                              {isSubmitting ? (
                                <motion.div 
                                  key="loading"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center"
                                >
                                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                  Processing...
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="submit"
                                  initial={{ opacity: 0, y: -20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center"
                                >
                                  <Send className="mr-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                  Send Your Message
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Service Times (3 columns) */}
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                  <div className="h-8 w-1 bg-amber-500 rounded-full" />
                  Service Schedule
                </h2>

                <div className="space-y-4">
                  {isLoadingPrograms ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="h-28 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />
                    ))
                  ) : programs.length > 0 ? (
                    programs.map((program) => (
                      <Card key={program.id} className="bg-slate-900/30 border-slate-800 hover:border-amber-500/20 transition-all group overflow-hidden backdrop-blur-sm">
                         <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Clock className="w-4 h-4 text-amber-500" />
                         </div>
                        <CardContent className="p-5">
                          <Badge variant="outline" className="border-amber-500/30 text-amber-500 mb-2 py-0 text-[10px] uppercase font-bold tracking-widest">
                            {dayNames[program.dayOfWeek]}
                          </Badge>
                          <h4 className="text-white font-bold leading-tight mb-2">{program.name}</h4>
                          <div className="flex items-center text-slate-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                            {formatTime(program.startTime)}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-sm text-center py-8">No scheduled programs found.</p>
                  )}
                </div>

                {/* Additional Info Cards */}
                <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-blue-500/20 mt-8 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
                  <CardContent className="p-6">
                    <Users className="w-10 h-10 text-blue-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Our Community</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We focus on reaching the Oromo community globally while welcoming believers from all backgrounds.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                  <CardContent className="p-6">
                    <Cross className="w-10 h-10 text-amber-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Private Support</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      All messages and prayer requests are handled with absolute confidentiality and care.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 bg-slate-900 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Compass className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Your <span className="text-amber-500">Sanctuary</span> Awaits
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                Whether you're exploring faith for the first time or looking for a church home, 
                our doors and hearts are always open to you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-black font-black px-10 py-7 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ArrowRight className="mr-3 h-6 w-6" />
                  Connect Now
                </Button>
                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  Est. 2014 &bull; Global Ministry
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
