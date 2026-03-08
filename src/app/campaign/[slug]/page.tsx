'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Heart,
  Share2,
  Calendar,
  Target,
  DollarSign,
  Users,
  CheckCircle2,
  Loader2,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  goal: number | null;
  raised: number;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  isActive: boolean;
  donationTotal: number;
  donationCount: number;
  recentDonations: Array<{
    id: string;
    amount: number;
    donorName: string | null;
    isAnonymous: boolean;
    createdAt: string;
  }>;
}

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [slug]);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!campaign?.goal || campaign.goal === 0) return 0;
    return Math.min(100, Math.round((campaign.donationTotal / campaign.goal) * 100));
  };

  const getDaysRemaining = () => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = campaign?.name || 'Support our campaign';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Support our campaign: ${shareUrl}`)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDonate = async () => {
    const amount = donationAmount === 'custom' ? customAmount : donationAmount;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!donorEmail) {
      toast.error('Please enter your email for the receipt');
      return;
    }

    setIsSubmitting(true);
    setShowPaymentProcessing(true);

    try {
      // Call the appropriate payment API based on selected method
      const paymentEndpoint = paymentMethod === 'card' ? '/api/payment/stripe' : '/api/payment/paypal';
      
      const paymentRes = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          campaignId: campaign?.id,
          campaignName: campaign?.name,
          donorEmail,
          donorName: isAnonymous ? null : donorName,
        }),
      });

      const paymentData = await paymentRes.json();

      if (paymentData.isDemo) {
        // Demo mode - simulate payment processing
        toast.info(paymentData.message);
        
        // Create the donation record
        const donationRes = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            campaignId: campaign?.id,
            donorName: isAnonymous ? null : donorName,
            donorEmail,
            isAnonymous,
            paymentMethod: paymentMethod === 'card' ? 'STRIPE' : 'PAYPAL',
            transactionId: paymentData.sessionId || paymentData.orderId,
            status: 'COMPLETED',
          }),
        });

        if (donationRes.ok) {
          setDonationSuccess(true);
          setShowPaymentProcessing(false);
          setTimeout(() => {
            setShowDonateModal(false);
            setDonationSuccess(false);
            setDonationAmount('');
            setCustomAmount('');
            setDonorName('');
            setDonorEmail('');
            setIsAnonymous(false);
            setPaymentMethod('card');
            fetchCampaign();
          }, 2000);
        } else {
          toast.error('Failed to record donation');
          setShowPaymentProcessing(false);
        }
      } else if (paymentData.checkoutUrl) {
        // Real Stripe checkout - redirect to Stripe
        window.location.href = paymentData.checkoutUrl;
      } else if (paymentData.approvalUrl) {
        // Real PayPal checkout - redirect to PayPal
        window.location.href = paymentData.approvalUrl;
      } else {
        toast.error('Failed to initialize payment');
        setShowPaymentProcessing(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
      setShowPaymentProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900/80 border-slate-700">
          <CardContent className="pt-8 pb-8 text-center">
            <Target className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Campaign Not Found</h2>
            <p className="text-slate-400 mb-6">
              The campaign you&apos;re looking for doesn&apos;t exist or has ended.
            </p>
            <Button onClick={() => router.push('/')} className="bg-amber-500 hover:bg-amber-600 text-black">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const progress = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      {campaign.imageUrl && (
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          {/* Campaign Card */}
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 mb-3">
                    {campaign.isActive ? 'Active Campaign' : 'Ended'}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{campaign.name}</h1>
                  {campaign.description && (
                    <p className="text-slate-400 text-lg">{campaign.description}</p>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Raised</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(campaign.donationTotal)}</p>
                  </div>
                  {campaign.goal && (
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Goal</p>
                      <p className="text-2xl font-bold text-amber-400">{formatCurrency(campaign.goal)}</p>
                    </div>
                  )}
                </div>

                {campaign.goal && (
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>{progress}% of goal</span>
                      <span>{campaign.donationCount} donations</span>
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{campaign.donationCount}</p>
                      <p className="text-slate-400 text-xs">Donors</p>
                    </div>
                  </div>
                  {daysRemaining !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{daysRemaining}</p>
                        <p className="text-slate-400 text-xs">Days Left</p>
                      </div>
                    </div>
                  )}
                  {campaign.startDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{formatDate(campaign.startDate)}</p>
                        <p className="text-slate-400 text-xs">Started</p>
                      </div>
                    </div>
                  )}
                  {campaign.goal && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{formatCurrency(campaign.goal)}</p>
                        <p className="text-slate-400 text-xs">Goal</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowDonateModal(true)}
                  className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-6 px-8 text-lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Donate Now
                </Button>
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 py-6 px-6"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>

              {/* Recent Donations */}
              {campaign.recentDonations && campaign.recentDonations.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Donations</h3>
                  <div className="space-y-3">
                    {campaign.recentDonations.slice(0, 5).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Anonymous'}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-emerald-400 font-semibold">
                          {formatCurrency(donation.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Donate Modal */}
      <Dialog open={showDonateModal} onOpenChange={setShowDonateModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Support This Campaign</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose an amount to donate to {campaign.name}
            </DialogDescription>
          </DialogHeader>
          
          {donationSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">Your donation has been received.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              {/* Amount Selection */}
              <div>
                <Label className="text-slate-300 mb-2 block">Select Amount</Label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['25', '50', '100', '250', '500', 'custom'].map((amount) => (
                    <Button
                      key={amount}
                      variant={donationAmount === amount ? 'default' : 'outline'}
                      className={donationAmount === amount 
                        ? 'bg-amber-500 text-black' 
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                      }
                      onClick={() => setDonationAmount(amount)}
                    >
                      {amount === 'custom' ? 'Other' : `$${amount}`}
                    </Button>
                  ))}
                </div>
                {donationAmount === 'custom' && (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                )}
              </div>

              {/* Donor Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <Label htmlFor="anonymous" className="text-slate-300 text-sm">
                    Donate anonymously
                  </Label>
                </div>

                {!isAnonymous && (
                  <div className="space-y-3">
                    <Input
                      placeholder="Your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                )}

                <Input
                  type="email"
                  placeholder="Your email (for receipt)"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t border-slate-700">
                <Label className="text-slate-300 mb-3 block">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={`py-4 h-auto flex-col gap-1 ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500 text-black hover:bg-amber-600'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">💳</span>
                    <span className="text-sm font-medium">Credit Card</span>
                    <span className="text-xs opacity-70">via Stripe</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-4 h-auto flex-col gap-1 ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">🅿️</span>
                    <span className="text-sm font-medium">PayPal</span>
                    <span className="text-xs opacity-70">Fast & Secure</span>
                  </Button>
                </div>
              </div>

              {showPaymentProcessing && (
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-500 mb-2" />
                  <p className="text-sm text-slate-300">
                    {paymentMethod === 'card' ? 'Processing with Stripe...' : 'Connecting to PayPal...'}
                  </p>
                </div>
              )}

              <Button
                onClick={handleDonate}
                disabled={isSubmitting || (!donationAmount || (donationAmount === 'custom' && !customAmount))}
                className={`w-full font-semibold py-4 ${
                  paymentMethod === 'paypal'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Heart className="h-5 w-5 mr-2" />
                )}
                {paymentMethod === 'paypal' ? 'Pay with PayPal ' : 'Donate '}
                {donationAmount === 'custom' ? (customAmount ? `$${customAmount}` : '') : donationAmount ? `$${donationAmount}` : ''}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Secure payment powered by {paymentMethod === 'card' ? 'Stripe' : 'PayPal'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Share This Campaign</DialogTitle>
            <DialogDescription className="text-slate-400">
              Help spread the word about {campaign.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-3 py-4">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <Facebook className="h-6 w-6 text-blue-500" />
              <span className="text-xs text-slate-300">Facebook</span>
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <Twitter className="h-6 w-6 text-sky-400" />
              <span className="text-xs text-slate-300">Twitter</span>
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <Linkedin className="h-6 w-6 text-blue-600" />
              <span className="text-xs text-slate-300">LinkedIn</span>
            </a>
            <a
              href={shareLinks.email}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <Mail className="h-6 w-6 text-red-400" />
              <span className="text-xs text-slate-300">Email</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-slate-800 border-slate-600 text-white text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
