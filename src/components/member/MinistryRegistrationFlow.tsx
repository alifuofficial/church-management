'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, Heart, BookOpen, Users, Church, CheckCircle2, 
  ChevronRight, ChevronLeft, Loader2, Info, Shield,
  Sparkles, Zap, Target
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MinistryRegistrationFlowProps {
  onClose: () => void;
  onComplete: () => void;
  isPage?: boolean;
}

const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const stepIcons = [User, Church, Users, Heart, CheckCircle2];
const stepColors = [
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
];

export function MinistryRegistrationFlow({ onClose, onComplete, isPage = false }: MinistryRegistrationFlowProps) {
  const { user, setUser } = useAppStore();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
    city: user?.city || '',
    timezone: user?.timezone || '',
    
    faithStatusDetail: user?.faithStatusDetail || '',
    believesInSalvation: user?.believesInSalvation || '',
    confessedChrist: user?.confessedChrist || '',
    completedDiscipleship: user?.completedDiscipleship || '',
    baptisedWater: user?.baptisedWater || '',
    baptisedSpirit: user?.baptisedSpirit || '',
    attendingLocalChurch: user?.attendingLocalChurch || '',
    notMemberReason: user?.notMemberReason || '',
    
    currentlyServing: user?.currentlyServing || '',
    ministryInterests: user?.ministryInterests ? user.ministryInterests.split(',') : [] as string[],
    giftsStrengths: user?.giftsStrengths || '',
    
    prayerSupportArea: user?.prayerSupportArea || '',
    spiritualGrowthArea: user?.spiritualGrowthArea || '',
    contactPreference: user?.contactPreference || false,
    mentorshipInterest: user?.mentorshipInterest || false,
    
    dataConsent: user?.dataConsent || false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ministryInterests: formData.ministryInterests.join(','),
        }),
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ ...user, ...updatedUser });
        onComplete();
      }
    } catch (error) {
      console.error('Error saving registration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-500" />
                  Full Name
                </Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => updateFormData('name', e.target.value)} 
                  placeholder="Enter your full name" 
                  className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Email Address
                </Label>
                <Input 
                  value={formData.email} 
                  disabled 
                  className="bg-slate-800/50 border-slate-700/30 text-slate-400 h-12 rounded-xl cursor-not-allowed" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Phone / WhatsApp</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => updateFormData('phone', e.target.value)} 
                  placeholder="Your contact number" 
                  className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Country</Label>
                <Input 
                  value={formData.country} 
                  onChange={(e) => updateFormData('country', e.target.value)} 
                  placeholder="Your country" 
                  className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">City / Region</Label>
                <Input 
                  value={formData.city} 
                  onChange={(e) => updateFormData('city', e.target.value)} 
                  placeholder="Your city" 
                  className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Time Zone</Label>
                <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
                  <SelectTrigger className="bg-slate-900/80 border-slate-700/50 text-white h-12 rounded-xl focus:ring-amber-500/20">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white z-[100] shadow-2xl rounded-xl">
                    <SelectItem value="UTC+3" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC+3 (East Africa Time)</SelectItem>
                    <SelectItem value="UTC+1" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC+1 (West Africa Time)</SelectItem>
                    <SelectItem value="UTC+0" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC (GMT)</SelectItem>
                    <SelectItem value="UTC-5" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC-5 (EST)</SelectItem>
                    <SelectItem value="UTC+5.5" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC+5:30 (IST)</SelectItem>
                    <SelectItem value="UTC+8" className="focus:bg-amber-500 focus:text-black rounded-lg">UTC+8 (SGT/CST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
            <RadioGroup value={formData.faithStatusDetail} onValueChange={(v) => updateFormData('faithStatusDetail', v)} className="space-y-3">
              <Label className="text-white font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                Current Faith Status
              </Label>
              {[
                "I am a committed believer in Jesus Christ",
                "I recently gave my life to Christ",
                "I am growing in my faith",
                "I am exploring Christianity"
              ].map(opt => (
                <div key={opt} className={cn(
                  "flex items-center space-x-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                  formData.faithStatusDetail === opt 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5" 
                    : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
                )}
                onClick={() => updateFormData('faithStatusDetail', opt)}
                >
                  <RadioGroupItem value={opt} id={`faith-${slugify(opt)}`} className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-5 w-5" />
                  <Label htmlFor={`faith-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  {formData.faithStatusDetail === opt && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-3 pt-2">
              <Label className="text-white font-semibold text-lg">Salvation through Jesus Christ</Label>
              <RadioGroup value={formData.believesInSalvation} onValueChange={(v) => updateFormData('believesInSalvation', v)} className="space-y-2">
                {["Yes", "No", "I wanted to learn about salvation through Jesus"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-4 p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.believesInSalvation === opt 
                      ? "bg-emerald-500/10 border-emerald-500/50" 
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                  )}
                  onClick={() => updateFormData('believesInSalvation', opt)}
                  >
                    <RadioGroupItem value={opt} id={`salv-${slugify(opt)}`} className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-5 w-5" />
                    <Label htmlFor={`salv-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-white font-semibold">Have you confessed Jesus Christ as Lord?</Label>
              <RadioGroup value={formData.confessedChrist} onValueChange={(v) => updateFormData('confessedChrist', v)} className="grid grid-cols-3 gap-3">
                {["Yes", "No", "Maybe"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.confessedChrist === opt 
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                      : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50"
                  )}
                  onClick={() => updateFormData('confessedChrist', opt)}
                  >
                    <RadioGroupItem value={opt} id={`conf-${slugify(opt)}`} className="sr-only" />
                    <Label htmlFor={`conf-${slugify(opt)}`} className="cursor-pointer font-bold text-center w-full">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-white font-semibold">Water Baptism?</Label>
                <RadioGroup value={formData.baptisedWater} onValueChange={(v) => updateFormData('baptisedWater', v)} className="flex gap-3">
                  {["Yes", "No"].map(opt => (
                    <div key={opt} className={cn(
                      "flex-1 flex items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer",
                      formData.baptisedWater === opt 
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                        : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50"
                    )}
                    onClick={() => updateFormData('baptisedWater', opt)}
                    >
                      <RadioGroupItem value={opt} id={`water-${slugify(opt)}`} className="sr-only" />
                      <Label htmlFor={`water-${slugify(opt)}`} className="cursor-pointer font-bold">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-white font-semibold">Spirit Baptism?</Label>
                <RadioGroup value={formData.baptisedSpirit} onValueChange={(v) => updateFormData('baptisedSpirit', v)} className="space-y-2">
                  {["Yes", "No", "Interested to learn more"].map(opt => (
                    <div key={opt} className={cn(
                      "flex items-center p-3 rounded-xl border transition-all cursor-pointer text-sm",
                      formData.baptisedSpirit === opt 
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                        : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50"
                    )}
                    onClick={() => updateFormData('baptisedSpirit', opt)}
                    >
                      <RadioGroupItem value={opt} id={`spirit-${slugify(opt)}`} className="sr-only" />
                      <Label htmlFor={`spirit-${slugify(opt)}`} className="cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-white font-semibold">Attending a local church?</Label>
              <RadioGroup value={formData.attendingLocalChurch} onValueChange={(v) => updateFormData('attendingLocalChurch', v)} className="grid grid-cols-3 gap-3">
                {["Yes, Regularly", "Yes, Occasionally", "No"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-sm",
                    formData.attendingLocalChurch === opt 
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                      : "bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50"
                  )}
                  onClick={() => updateFormData('attendingLocalChurch', opt)}
                  >
                    <RadioGroupItem value={opt} id={`church-${slugify(opt)}`} className="sr-only" />
                    <Label htmlFor={`church-${slugify(opt)}`} className="cursor-pointer font-medium text-center">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.attendingLocalChurch === 'No' && (
              <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-white font-medium">Why are you not currently a member?</Label>
                <Textarea 
                  value={formData.notMemberReason} 
                  onChange={(e) => updateFormData('notMemberReason', e.target.value)} 
                  placeholder="Share your reason with us..."
                  className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-emerald-500/50"
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-white font-semibold text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Currently serving in Ministry?
              </Label>
              <RadioGroup value={formData.currentlyServing} onValueChange={(v) => updateFormData('currentlyServing', v)} className="space-y-2">
                {[
                  "Yes, actively",
                  "Yes, occasionally",
                  "Not currently",
                  "Not yet, but I would like to serve"
                ].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-4 p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.currentlyServing === opt 
                      ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/5" 
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                  )}
                  onClick={() => updateFormData('currentlyServing', opt)}
                  >
                    <RadioGroupItem value={opt} id={`serve-${slugify(opt)}`} className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-5 w-5" />
                    <Label htmlFor={`serve-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200">{opt}</Label>
                    {formData.currentlyServing === opt && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-white font-semibold text-lg">Service Areas of Interest</Label>
              <p className="text-slate-400 text-sm">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Prayer Ministry", "Worship / Music", "Media Support", 
                  "Evangelism", "Bible Teaching", "Administration",
                  "Follow-up", "Intercession", "Communication",
                  "Cell Fellowship", "Need guidance"
                ].map(opt => (
                  <div 
                    key={opt} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                      formData.ministryInterests.includes(opt)
                        ? "bg-blue-500/10 border-blue-500/50" 
                        : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                    )}
                    onClick={() => {
                      if (formData.ministryInterests.includes(opt)) {
                        updateFormData('ministryInterests', formData.ministryInterests.filter(i => i !== opt));
                      } else {
                        updateFormData('ministryInterests', [...formData.ministryInterests, opt]);
                      }
                    }}
                  >
                    <Checkbox 
                      id={`min-${slugify(opt)}`} 
                      checked={formData.ministryInterests.includes(opt)}
                      className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-5 w-5"
                    />
                    <Label htmlFor={`min-${slugify(opt)}`} className="text-sm cursor-pointer text-slate-200">{opt}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-white font-semibold">Your Gifts & Talents</Label>
              <Textarea 
                value={formData.giftsStrengths} 
                onChange={(e) => updateFormData('giftsStrengths', e.target.value)} 
                placeholder="What strengths has God given you?"
                className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-blue-500/50"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
            <div className="space-y-2">
              <Label className="text-white font-semibold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Prayer Support Needs
              </Label>
              <Textarea 
                value={formData.prayerSupportArea} 
                onChange={(e) => updateFormData('prayerSupportArea', e.target.value)} 
                placeholder="How can we pray for you?"
                className="bg-slate-900/80 border-slate-700/50 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-rose-500/50"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-white font-semibold">Spiritual Growth Focus</Label>
              <p className="text-slate-400 text-sm">What area would you like to grow in?</p>
              <RadioGroup value={formData.spiritualGrowthArea} onValueChange={(v) => updateFormData('spiritualGrowthArea', v)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Spiritual growth", "Healing / health", "Family / marriage", 
                  "Finances", "Career / business", "Direction / purpose",
                  "Emotional well-being", "Salvation"
                ].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center",
                    formData.spiritualGrowthArea === opt 
                      ? "bg-rose-500/10 border-rose-500/50" 
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                  )}
                  onClick={() => updateFormData('spiritualGrowthArea', opt)}
                  >
                    <RadioGroupItem value={opt} id={`growth-${slugify(opt)}`} className="sr-only" />
                    <Label htmlFor={`growth-${slugify(opt)}`} className="text-sm cursor-pointer text-slate-200">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <div 
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                  formData.contactPreference 
                    ? "bg-rose-500/10 border-rose-500/50" 
                    : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                )}
                onClick={() => updateFormData('contactPreference', !formData.contactPreference)}
              >
                <div className="space-y-1">
                  <Label className="text-white font-semibold">Personal Contact</Label>
                  <p className="text-sm text-slate-400">Request follow-up from our team.</p>
                </div>
                <Checkbox 
                  checked={formData.contactPreference} 
                  className="border-slate-500 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-6 w-6"
                />
              </div>
              
              <div 
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                  formData.mentorshipInterest 
                    ? "bg-rose-500/10 border-rose-500/50" 
                    : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                )}
                onClick={() => updateFormData('mentorshipInterest', !formData.mentorshipInterest)}
              >
                <div className="space-y-1">
                  <Label className="text-white font-semibold">Mentorship Interest</Label>
                  <p className="text-sm text-slate-400">Would you like spiritual mentorship?</p>
                </div>
                <Checkbox 
                  checked={formData.mentorshipInterest} 
                  className="border-slate-500 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-6 w-6"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-violet-500/30">
                <Shield className="h-14 w-14 text-violet-500" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-14 bg-violet-600 rounded-full p-2.5 border-4 border-slate-900 shadow-xl">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <Badge className="px-4 py-1.5 bg-violet-500/10 border-violet-500/30 text-violet-400 rounded-full">
                Final Step
              </Badge>
              <h3 className="text-3xl font-black text-white tracking-tight">Consent & Agreement</h3>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                By completing this registration, I consent to the use of my information for{' '}
                <span className="text-violet-400 font-semibold">church communication</span> and ministry coordination.
              </p>
            </div>
            
            <div 
              className={cn(
                "flex items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer w-full max-w-sm mx-auto group",
                formData.dataConsent 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 border-violet-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]" 
                  : "bg-slate-800/30 border-slate-700 hover:border-violet-500/50"
              )}
              onClick={() => updateFormData('dataConsent', !formData.dataConsent)}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                formData.dataConsent ? "bg-white border-white" : "border-slate-500"
              )}>
                {formData.dataConsent && <CheckCircle2 className="h-6 w-6 text-violet-600" />}
              </div>
              <span className={cn(
                "font-bold text-lg uppercase tracking-wide",
                formData.dataConsent ? "text-white" : "text-slate-400 group-hover:text-slate-200"
              )}>
                I Agree & Consent
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Personal Details";
      case 2: return "Spiritual Journey";
      case 3: return "Ministry Interest";
      case 4: return "Care & Support";
      case 5: return "Final Consent";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Let's start with your basic information.";
      case 2: return "Share your faith journey with us.";
      case 3: return "Discover your place in the Body of Christ.";
      case 4: return "Tell us how we can support you.";
      case 5: return "Join the Voices of Hope family.";
      default: return "";
    }
  };

  const StepIcon = stepIcons[step - 1];
  const stepColorClass = stepColors[step - 1];

  const containerClasses = isPage 
    ? "min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center py-8 px-4"
    : "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto";

  return (
    <div className={containerClasses}>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
      `}</style>
      <Card className={cn(
        "bg-slate-950 border-slate-800/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 rounded-3xl relative max-w-2xl w-full",
        isPage ? "min-h-[85vh]" : ""
      )}>
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-violet-500/5 to-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {stepIcons.map((Icon, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    idx < step 
                      ? `bg-gradient-to-br ${stepColors[idx]} text-white shadow-lg` 
                      : idx === step - 1
                        ? `bg-gradient-to-br ${stepColorClass} text-white shadow-xl ring-4 ring-amber-500/20`
                        : "bg-slate-800/50 text-slate-500"
                  )}>
                    {idx < step - 1 ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  {idx < totalSteps - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 transition-all duration-500",
                      idx < step - 1 ? `bg-gradient-to-r ${stepColors[idx]}` : "bg-slate-700/50"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-br shadow-xl",
              stepColorClass
            )}>
              <StepIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-700/50 text-slate-400">
                  Step {step} of {totalSteps}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-white tracking-tight">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                {getStepDescription()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 px-8">
          {renderStep()}
        </CardContent>
        
        <CardFooter className="relative z-10 bg-slate-900/50 border-t border-slate-800/50 p-6 flex justify-between gap-4">
          <Button 
            variant="ghost" 
            onClick={step === 1 ? onClose : handleBack} 
            className="text-slate-400 hover:text-white px-6 h-12 rounded-xl font-medium transition-all hover:bg-slate-800"
          >
            {step === 1 ? 'Cancel' : <span className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Back</span>}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext} 
              className={cn(
                "font-bold px-8 h-12 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center gap-2",
                `bg-gradient-to-r ${stepColorClass} hover:opacity-90 text-white`
              )}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.dataConsent || isSaving}
              className={cn(
                "font-bold px-10 h-12 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center gap-2",
                formData.dataConsent 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]" 
                  : "bg-slate-800/50 text-slate-500"
              )}
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              Complete Registration
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}