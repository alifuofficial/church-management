'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Heart, 
  Clock, 
  User, 
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  HandHeart,
  Lock,
  Shield,
  Send,
  Loader2,
  Sparkles,
  Cross,
  BookOpen,
  Users,
  Flame
} from 'lucide-react';

interface PrayerRequest {
  id: string;
  title: string;
  request: string;
  isPublic: boolean;
  isUrgent: boolean;
  status: string;
  prayerCount: number;
  testimony?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email?: string;
    image: string | null;
  } | null;
  responses?: {
    id: string;
    message: string;
    responderName: string | null;
    createdAt: string;
  }[];
}

const prayerFeatures = [
  {
    icon: Shield,
    title: 'Private & Confidential',
    description: 'Your requests are only seen by our pastoral team',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: HandHeart,
    title: '24/7 Prayer Support',
    description: 'Our team is committed to praying for you',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: Flame,
    title: 'Urgent Requests',
    description: 'Mark urgent needs for immediate attention',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: BookOpen,
    title: 'Biblical Guidance',
    description: 'Receive scripture-based encouragement',
    color: 'from-violet-500 to-purple-500'
  },
];

export function PrayerPage() {
  const { user, isAuthenticated, setCurrentView } = useAppStore();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [request, setRequest] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [response, setResponse] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PASTOR';

  useEffect(() => {
    // Only fetch prayers if user is authenticated and we have user data
    if (isAuthenticated && user?.id) {
      fetchPrayers();
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const fetchPrayers = async () => {
    if (!user?.id) return; // Safety check
    setIsLoading(true);
    try {
      // ALWAYS pass userId - the API will determine role and return appropriate prayers
      const res = await fetch(`/api/prayers?limit=50&userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPrayers(data);
      } else if (res.status === 401) {
        // Not authenticated
        setPrayers([]);
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = async () => {
    if (!user || !title || !request) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          request,
          isUrgent,
        }),
      });
      
      if (res.ok) {
        setTitle('');
        setRequest('');
        setIsUrgent(false);
        setSubmitSuccess(true);
        // Refresh prayers to show the new one
        fetchPrayers();
      } else {
        const error = await res.json();
        console.error('Error submitting prayer:', error);
      }
    } catch (error) {
      console.error('Error submitting prayer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (prayerId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/prayers/${prayerId}?userId=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error updating prayer status:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedPrayer || !response.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prayers/${selectedPrayer.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          message: response,
          responderName: user?.name || 'Prayer Team',
        }),
      });
      
      if (res.ok) {
        setResponseDialogOpen(false);
        setResponse('');
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-0"><CheckCircle2 className="h-3 w-3 mr-1" />Answered</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-500/10 text-amber-400 border-0"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'PENDING':
        return <Badge className="bg-slate-500/10 text-slate-400 border-0">Pending</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-slate-700 text-slate-500 border-0">Archived</Badge>;
      default:
        return null;
    }
  };

  // Not authenticated view
  if (!isAuthenticated) {
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
                Prayer Support
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Prayer <span className="text-amber-500">Requests</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Our prayer team is dedicated to lifting up your needs to God in faith and love.
              </p>
            </div>
          </div>
        </section>

        {/* Sign In Prompt */}
        <section className="py-20 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Lock className="h-10 w-10 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
                  <p className="text-slate-400 mb-6">
                    Please sign in to submit your prayer requests and receive updates from our prayer team.
                  </p>
                  <Button 
                    onClick={() => setCurrentView('home')} 
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
                  >
                    Sign In to Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-slate-950 border-t border-slate-800">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {prayerFeatures.map((feature, index) => (
                <Card 
                  key={index}
                  className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Non-admin user view (submission only)
  if (!isAdmin) {
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
                <Heart className="w-4 h-4 mr-1" />
                Prayer Support
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Submit a <span className="text-amber-500">Prayer Request</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Share your prayer needs with our team. Your request is private and confidential.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Success message */}
              {submitSuccess && (
                <Card className="mb-8 bg-emerald-500/10 border-emerald-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-400">Prayer Request Submitted</p>
                        <p className="text-sm text-emerald-400/70">
                          Our prayer team will be praying for you. Your request is private and only visible to administrators.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submission Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Share Your Request</h2>
                      <p className="text-slate-500 text-sm">We&apos;re here to pray for you</p>
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 mb-6">
                    <Shield className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-400 mb-1">Private & Confidential</p>
                      <p className="text-slate-400">
                        Your prayer request will only be seen by our pastoral team. 
                        We are committed to keeping your requests confidential.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-300">Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief title for your prayer request"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="request" className="text-slate-300">Prayer Request</Label>
                      <Textarea
                        id="request"
                        placeholder="Share your prayer request in detail..."
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        rows={5}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                      <div>
                        <Label htmlFor="urgent" className="text-white">Urgent Request</Label>
                        <p className="text-xs text-slate-500">
                          Mark as urgent for immediate prayer attention
                        </p>
                      </div>
                      <Switch
                        id="urgent"
                        checked={isUrgent}
                        onCheckedChange={setIsUrgent}
                      />
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold py-6 rounded-xl"
                      onClick={handleSubmit}
                      disabled={!title || !request || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Prayer Request
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User's own prayers */}
              {prayers.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-white mb-6">Your Prayer Requests</h2>
                  <div className="space-y-4">
                    {prayers.map((prayer) => (
                      <Card key={prayer.id} className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white">{prayer.title}</h3>
                            {getStatusBadge(prayer.status)}
                          </div>
                          <p className="text-slate-500 text-sm mb-4">
                            {formatDate(prayer.createdAt)}
                          </p>
                          <p className="text-slate-400 leading-relaxed">{prayer.request}</p>
                          
                          {prayer.testimony && (
                            <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <p className="text-sm font-medium text-emerald-400 mb-1">Testimony</p>
                              <p className="text-sm text-emerald-400/80">{prayer.testimony}</p>
                            </div>
                          )}
                          
                          {prayer.responses && prayer.responses.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm font-medium text-amber-400">Response from Prayer Team</p>
                              {prayer.responses.map((r) => (
                                <div key={r.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                  <p className="text-slate-300">{r.message}</p>
                                  <p className="text-xs text-slate-500 mt-2">
                                    {formatDate(r.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Admin view
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                  <Lock className="w-3 h-3 mr-1" />
                  Admin Only
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Prayer Requests Management</h1>
              <p className="text-slate-400 mt-2">Review and respond to prayer requests</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                <HandHeart className="h-5 w-5 text-amber-500" />
                <span className="text-white font-medium">{prayers.length} Request{prayers.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-slate-900">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-700 rounded mb-4 w-1/3" />
                    <div className="h-4 bg-slate-700 rounded mb-2" />
                    <div className="h-4 bg-slate-700 rounded mb-2 w-3/4" />
                    <div className="h-20 bg-slate-700 rounded mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : prayers.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 text-center py-16">
              <CardContent>
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No prayer requests yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Prayer requests submitted by members will appear here for you to review and respond.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prayers.map((prayer) => (
                <Card 
                  key={prayer.id} 
                  className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusBadge(prayer.status)}
                          {prayer.isUrgent && (
                            <Badge className="bg-red-500/10 text-red-400 border-0 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                          {prayer.title}
                        </h3>
                      </div>
                    </div>

                    {/* Status Select */}
                    <Select
                      value={prayer.status}
                      onValueChange={(value) => handleStatusChange(prayer.id, value)}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mb-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="ANSWERED">Answered</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Request Content */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                      {prayer.request}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      {prayer.user?.name ? (
                        <>
                          <User className="h-3 w-3" />
                          <span>{prayer.user.name}</span>
                          <span>•</span>
                        </>
                      ) : (
                        <span>Anonymous •</span>
                      )}
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(prayer.createdAt)}</span>
                    </div>

                    {/* Responses Preview */}
                    {prayer.responses && prayer.responses.length > 0 && (
                      <div className="mb-4 p-3 bg-slate-900/50 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
                          <MessageCircle className="h-3 w-3" />
                          {prayer.responses.length} Response{prayer.responses.length !== 1 ? 's' : ''}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {prayer.responses[0].message}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <HandHeart className="h-3 w-3 text-amber-500" />
                        <span>{prayer.prayerCount} prayer{prayer.prayerCount !== 1 ? 's' : ''}</span>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-0"
                        onClick={() => {
                          setSelectedPrayer(prayer);
                          setResponseDialogOpen(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Respond to Prayer Request</DialogTitle>
            <DialogDescription className="text-slate-400">
              Send encouragement to {selectedPrayer?.user?.name || 'Anonymous'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedPrayer && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="font-medium text-amber-400 mb-2">{selectedPrayer.title}</p>
                <p className="text-sm text-slate-400">{selectedPrayer.request}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300">Your Response</Label>
              <Textarea
                placeholder="Write your encouraging response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setResponseDialogOpen(false)}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                onClick={handleSendResponse}
                disabled={!response.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
