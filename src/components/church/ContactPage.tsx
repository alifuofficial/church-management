'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Heart,
  CreditCard,
  DollarSign,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Globe,
  Users,
  Cross,
  Loader2
} from 'lucide-react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us a message anytime',
    value: 'info@voiceofhope.org',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak with our team',
    value: '+1 (555) 123-4567',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Globe,
    title: 'Virtual Fellowship',
    description: 'Join our online services',
    value: 'Weekly Zoom Meetings',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with believers',
    value: 'Global Network',
    color: 'from-rose-500 to-pink-500'
  },
];

const campaigns = [
  {
    id: '1',
    name: 'Ministry Outreach',
    description: 'Spreading the Gospel in Ethiopia and beyond.',
    raised: 125000,
    goal: 500000,
  },
  {
    id: '2',
    name: 'Leader Training',
    description: 'Equipping leaders and evangelists for ministry.',
    raised: 18750,
    goal: 25000,
  },
  {
    id: '3',
    name: 'Discipleship Program',
    description: 'Helping believers grow in their faith.',
    raised: 52000,
    goal: 75000,
  },
];

const serviceTimes = [
  { day: 'Sunday', name: 'Virtual Worship', time: '8:00 AM & 10:30 AM', type: 'online' },
  { day: 'Wednesday', name: 'Bible Study', time: '7:30 PM', type: 'online' },
  { day: 'Friday', name: 'Prayer Meeting', time: '7:00 PM', type: 'online' },
];

export function ContactPage() {
  const { user, isAuthenticated } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Donation state
  const [donationAmount, setDonationAmount] = useState('50');
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [selectedCampaign, setSelectedCampaign] = useState('general');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'contact' | 'give' | 'info'>('contact');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    // In a real app, this would redirect to payment gateway
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact <span className="text-amber-500">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Have questions, prayer requests, or want to connect? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-12 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card 
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 group cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <method.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{method.title}</h3>
                  <p className="text-slate-500 text-sm mb-2">{method.description}</p>
                  <p className="text-amber-400 font-medium text-sm">{method.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-6 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              variant={activeTab === 'contact' ? 'default' : 'outline'}
              className={activeTab === 'contact' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('contact')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Form
            </Button>
            <Button
              variant={activeTab === 'give' ? 'default' : 'outline'}
              className={activeTab === 'give' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('give')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Give Online
            </Button>
            <Button
              variant={activeTab === 'info' ? 'default' : 'outline'}
              className={activeTab === 'info' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('info')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Service Times
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      {activeTab === 'contact' && (
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
              {/* Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                      <p className="text-slate-400 mb-6">
                        Thank you for reaching out. We&apos;ll respond within 24-48 hours.
                      </p>
                      <Button 
                        onClick={() => setSubmitted(false)}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Send className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Send a Message</h2>
                          <p className="text-slate-500 text-sm">We&apos;ll get back to you soon</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-300">Name</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-300">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-500">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="prayer">Prayer Request</SelectItem>
                            <SelectItem value="volunteer">Volunteer Opportunities</SelectItem>
                            <SelectItem value="membership">Membership</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-300">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={5}
                          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold py-6 rounded-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-500" />
                      About Voice of Hope
                    </h3>
                    <p className="text-slate-400 leading-relaxed mb-4">
                      Voice of Hope is a Christian ministry dedicated to strengthening believers 
                      and helping them be firmly rooted in Christ. Since 2014, we have reached 
                      thousands around the world through virtual fellowship and discipleship.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-amber-500" />
                        <span className="text-slate-400">Virtual Ministry - Global Reach</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-amber-500" />
                        <span className="text-slate-400">Ethiopian Oromo Community Focus</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      Response Time
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">General Inquiries</span>
                        <span className="text-white">24-48 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prayer Requests</span>
                        <span className="text-white">Same day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Urgent Matters</span>
                        <span className="text-emerald-400">Immediate</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                  <CardContent className="p-6 text-center">
                    <Cross className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Need Prayer?</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Our prayer team is available 24/7 to lift you up in prayer.
                    </p>
                    <Button 
                      variant="outline"
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => {
                        const store = useAppStore.getState();
                        store.setCurrentView('prayer');
                      }}
                    >
                      Submit Prayer Request
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Give Online Section */}
      {activeTab === 'give' && (
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Support the Ministry</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Your generous giving helps us continue spreading the Gospel and strengthening believers worldwide.
                </p>
              </div>

              {/* Donation Form */}
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Donation Type */}
                    <div className="space-y-3">
                      <Label className="text-slate-300">Donation Type</Label>
                      <div className="flex gap-3">
                        <Button
                          variant={donationType === 'one-time' ? 'default' : 'outline'}
                          onClick={() => setDonationType('one-time')}
                          className={donationType === 'one-time' 
                            ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                            : 'flex-1 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                          }
                        >
                          One-Time
                        </Button>
                        <Button
                          variant={donationType === 'recurring' ? 'default' : 'outline'}
                          onClick={() => setDonationType('recurring')}
                          className={donationType === 'recurring' 
                            ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                            : 'flex-1 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                          }
                        >
                          Monthly
                        </Button>
                      </div>
                    </div>

                    {/* Amount Selection */}
                    <div className="space-y-3">
                      <Label className="text-slate-300">Select Amount</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {['25', '50', '100', '250'].map((amount) => (
                          <Button
                            key={amount}
                            variant={donationAmount === amount ? 'default' : 'outline'}
                            onClick={() => setDonationAmount(amount)}
                            className={donationAmount === amount 
                              ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                              : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                            }
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <div className="relative mt-3">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                          type="number"
                          placeholder="Other amount"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="pl-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-12"
                        />
                      </div>
                    </div>

                    {/* Designation */}
                    <div className="space-y-3">
                      <Label className="text-slate-300">Designation</Label>
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-500 h-12">
                          <SelectValue placeholder="Select a fund" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="general">General Fund</SelectItem>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold py-6 rounded-xl"
                      onClick={handleDonation}
                      disabled={isProcessing || !donationAmount}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Give ${donationAmount}
                          {donationType === 'recurring' && '/month'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Campaigns */}
              <h3 className="text-xl font-bold text-white mb-6">Current Campaigns</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {campaigns.map((campaign) => {
                  const progress = (campaign.raised / campaign.goal) * 100;
                  return (
                    <Card key={campaign.id} className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-white">{campaign.name}</h4>
                          <Badge className="bg-amber-500/10 text-amber-400 border-0">
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">{campaign.description}</p>
                        <Progress value={progress} className="h-2 mb-3 bg-slate-700" />
                        <div className="flex justify-between text-sm">
                          <span className="text-white font-medium">${campaign.raised.toLocaleString()}</span>
                          <span className="text-slate-500">of ${campaign.goal.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Service Times Section */}
      {activeTab === 'info' && (
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Service Times</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Join us for virtual fellowship, worship, and teaching throughout the week.
                </p>
              </div>

              {/* Service Schedule */}
              <div className="grid gap-4 mb-12">
                {serviceTimes.map((service, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex flex-col items-center justify-center">
                            <span className="text-xs text-amber-400 font-medium">{service.day.slice(0, 3).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                            <Badge className={service.type === 'online' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-0 mt-1' 
                              : 'bg-amber-500/10 text-amber-400 border-0 mt-1'
                            }>
                              {service.type === 'online' ? 'Virtual' : 'In-Person'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-500">{service.time}</p>
                          <p className="text-slate-500 text-sm">EST</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Info Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="h-6 w-6 text-amber-500" />
                      <h3 className="text-lg font-bold text-white">Virtual Fellowship</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      All our services are held virtually via Zoom, allowing believers from around 
                      the world to join us in worship, teaching, and fellowship. Meeting links are 
                      shared through our community channels.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-amber-500" />
                      <h3 className="text-lg font-bold text-white">Community Focus</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We have a special focus on reaching the Ethiopian Oromo community with the 
                      Gospel, while welcoming believers from all backgrounds to join our global 
                      family of faith.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Cross className="h-12 w-12 mx-auto text-amber-500 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              We&apos;re Here for You
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Whether you need prayer, have questions about faith, or want to get involved, 
              we&apos;re here to support you on your spiritual journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
                onClick={() => setActiveTab('contact')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Send a Message
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800 hover:text-white px-8"
                onClick={() => setActiveTab('give')}
              >
                <Heart className="mr-2 h-5 w-5" />
                Support Ministry
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
