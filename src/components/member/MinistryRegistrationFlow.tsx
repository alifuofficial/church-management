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
import { 
  User, Heart, BookOpen, Users, Church, CheckCircle2, 
  ChevronRight, ChevronLeft, Loader2, Info, Shield
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

// Helper to slugify strings for HTML IDs
const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export function MinistryRegistrationFlow({ onClose, onComplete, isPage = false }: MinistryRegistrationFlowProps) {
  const { user, setUser } = useAppStore();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal (Pre-filled)
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || '',
    city: user?.city || '',
    timezone: user?.timezone || '',
    
    // Step 2: Faith Background
    faithStatusDetail: user?.faithStatusDetail || '',
    believesInSalvation: user?.believesInSalvation || '',
    confessedChrist: user?.confessedChrist || '',
    completedDiscipleship: user?.completedDiscipleship || '',
    baptisedWater: user?.baptisedWater || '',
    baptisedSpirit: user?.baptisedSpirit || '',
    attendingLocalChurch: user?.attendingLocalChurch || '',
    notMemberReason: user?.notMemberReason || '',
    
    // Step 3: Service & Ministry
    currentlyServing: user?.currentlyServing || '',
    ministryInterests: user?.ministryInterests ? user.ministryInterests.split(',') : [] as string[],
    giftsStrengths: user?.giftsStrengths || '',
    
    // Step 4: Follow-up & Prayer
    prayerSupportArea: user?.prayerSupportArea || '',
    spiritualGrowthArea: user?.spiritualGrowthArea || '',
    contactPreference: user?.contactPreference || false,
    mentorshipInterest: user?.mentorshipInterest || false,
    
    // Step 5: Consent
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => updateFormData('name', e.target.value)} 
                  placeholder="Full Name" 
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Email Address</Label>
                <Input value={formData.email} disabled className="bg-slate-800/30 border-slate-700/50 text-slate-400 h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Phone / WhatsApp</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => updateFormData('phone', e.target.value)} 
                  placeholder="Phone Number" 
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Country</Label>
                <Input 
                  value={formData.country} 
                  onChange={(e) => updateFormData('country', e.target.value)} 
                  placeholder="Country" 
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">City / Region</Label>
                <Input 
                  value={formData.city} 
                  onChange={(e) => updateFormData('city', e.target.value)} 
                  placeholder="City" 
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold">Time Zone</Label>
                <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-11 focus:ring-amber-500/20">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white z-[100] shadow-2xl">
                    <SelectItem value="UTC+3" className="focus:bg-amber-500 focus:text-black">UTC+3 (East Africa Time)</SelectItem>
                    <SelectItem value="UTC+1" className="focus:bg-amber-500 focus:text-black">UTC+1 (West Africa Time)</SelectItem>
                    <SelectItem value="UTC+0" className="focus:bg-amber-500 focus:text-black">UTC (GMT)</SelectItem>
                    <SelectItem value="UTC-5" className="focus:bg-amber-500 focus:text-black">UTC-5 (EST)</SelectItem>
                    <SelectItem value="UTC+5.5" className="focus:bg-amber-500 focus:text-black">UTC+5:30 (IST)</SelectItem>
                    <SelectItem value="UTC+8" className="focus:bg-amber-500 focus:text-black">UTC+8 (SGT/CST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Current Faith Status</Label>
              <RadioGroup value={formData.faithStatusDetail} onValueChange={(v) => updateFormData('faithStatusDetail', v)} className="space-y-2">
                {[
                  "I am a committed believer in Jesus Christ",
                  "I recently gave my life to Christ",
                  "I am growing in my faith",
                  "I am exploring Christianity"
                ].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer group",
                    formData.faithStatusDetail === opt 
                      ? "bg-amber-500/10 border-amber-500/50 shadow-inner shadow-amber-500/5" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                  )}
                  onClick={() => updateFormData('faithStatusDetail', opt)}
                  >
                    <RadioGroupItem value={opt} id={`faith-${slugify(opt)}`} className="border-slate-500 text-amber-500 h-5 w-5" />
                    <Label htmlFor={`faith-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Salvation through Jesus Christ</Label>
              <RadioGroup value={formData.believesInSalvation} onValueChange={(v) => updateFormData('believesInSalvation', v)} className="space-y-2">
                {["Yes", "No", "I wanted to learn about salvation through Jesus"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.believesInSalvation === opt 
                      ? "bg-amber-500/10 border-amber-500/50" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('believesInSalvation', opt)}
                  >
                    <RadioGroupItem value={opt} id={`salv-${slugify(opt)}`} className="border-slate-500 text-amber-500 h-5 w-5" />
                    <Label htmlFor={`salv-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Have you personally confessed Jesus Christ as your Lord?</Label>
              <RadioGroup value={formData.confessedChrist} onValueChange={(v) => updateFormData('confessedChrist', v)} className="grid grid-cols-3 gap-3">
                {["Yes", "No", "Maybe"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all cursor-pointer",
                    formData.confessedChrist === opt 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                      : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('confessedChrist', opt)}
                  >
                    <RadioGroupItem value={opt} id={`conf-${slugify(opt)}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`conf-${slugify(opt)}`} className="cursor-pointer font-bold">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Completed Discipleship or Foundational Class?</Label>
              <RadioGroup value={formData.completedDiscipleship} onValueChange={(v) => updateFormData('completedDiscipleship', v)} className="space-y-2">
                {["Yes", "No", "Looking to attend"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.completedDiscipleship === opt 
                      ? "bg-amber-500/10 border-amber-500/50" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('completedDiscipleship', opt)}
                  >
                    <RadioGroupItem value={opt} id={`disc-${slugify(opt)}`} className="border-slate-500 text-amber-500 h-5 w-5" />
                    <Label htmlFor={`disc-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-bold text-white">Water Baptism?</Label>
                <RadioGroup value={formData.baptisedWater} onValueChange={(v) => updateFormData('baptisedWater', v)} className="grid grid-cols-2 gap-3">
                  {["Yes", "No"].map(opt => (
                    <div key={opt} className={cn(
                      "flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all cursor-pointer",
                      formData.baptisedWater === opt 
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800"
                    )}
                    onClick={() => updateFormData('baptisedWater', opt)}
                    >
                      <RadioGroupItem value={opt} id={`water-${slugify(opt)}`} className="border-slate-500 text-amber-500" />
                      <Label htmlFor={`water-${slugify(opt)}`} className="cursor-pointer font-bold">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-bold text-white">Spirit Baptism?</Label>
                <RadioGroup value={formData.baptisedSpirit} onValueChange={(v) => updateFormData('baptisedSpirit', v)} className="space-y-2">
                  {["Yes", "No", "Interested to learn more"].map(opt => (
                    <div key={opt} className={cn(
                      "flex items-center space-x-3 p-3 rounded-2xl border transition-all cursor-pointer",
                      formData.baptisedSpirit === opt 
                        ? "bg-amber-500/10 border-amber-500/50" 
                        : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                    )}
                    onClick={() => updateFormData('baptisedSpirit', opt)}
                    >
                      <RadioGroupItem value={opt} id={`spirit-${slugify(opt)}`} className="border-slate-500 text-amber-500" />
                      <Label htmlFor={`spirit-${slugify(opt)}`} className="text-xs cursor-pointer text-slate-200 font-medium">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Are you attending a local church?</Label>
              <RadioGroup value={formData.attendingLocalChurch} onValueChange={(v) => updateFormData('attendingLocalChurch', v)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Yes, Regularly", "Yes, Occasionally", "No"].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center justify-center space-x-2 p-3 rounded-2xl border transition-all cursor-pointer",
                    formData.attendingLocalChurch === opt 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                      : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('attendingLocalChurch', opt)}
                  >
                    <RadioGroupItem value={opt} id={`church-${slugify(opt)}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`church-${slugify(opt)}`} className="text-xs cursor-pointer font-bold text-center">{opt}</Label>
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
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-amber-500/50"
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Currently serving in Ministry?</Label>
              <RadioGroup value={formData.currentlyServing} onValueChange={(v) => updateFormData('currentlyServing', v)} className="space-y-2">
                {[
                  "Yes, actively",
                  "Yes, occasionally",
                  "Not currently",
                  "Not yet, but I would like to serve"
                ].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    formData.currentlyServing === opt 
                      ? "bg-amber-500/10 border-amber-500/50" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('currentlyServing', opt)}
                  >
                    <RadioGroupItem value={opt} id={`serve-${slugify(opt)}`} className="border-slate-500 text-amber-500 h-5 w-5" />
                    <Label htmlFor={`serve-${slugify(opt)}`} className="flex-1 cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Service Areas of Interest</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  "Prayer Ministry", "Worship / Music", "Media Support", 
                  "Evangelism", "Bible Teaching", "Administration",
                  "Follow-up", "Intercession", "Communication",
                  "Cell Fellowship", "Need guidance"
                ].map(opt => (
                  <div 
                    key={opt} 
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-2xl border transition-all cursor-pointer",
                      formData.ministryInterests.includes(opt)
                        ? "bg-amber-500/10 border-amber-500/50" 
                        : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
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
                      className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-5 w-5 rounded-md"
                    />
                    <Label htmlFor={`min-${slugify(opt)}`} className="text-sm cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-base font-bold text-white">Your Gifts & Talents</Label>
              <Textarea 
                value={formData.giftsStrengths} 
                onChange={(e) => updateFormData('giftsStrengths', e.target.value)} 
                placeholder="What strengths has God given you?"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-amber-500/50"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            <div className="space-y-2">
              <Label className="text-base font-bold text-white">Prayer Support Needs</Label>
              <Textarea 
                value={formData.prayerSupportArea} 
                onChange={(e) => updateFormData('prayerSupportArea', e.target.value)} 
                placeholder="How can we pray for you?"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-[100px] rounded-2xl focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-white">Spiritual Growth Focus</Label>
              <RadioGroup value={formData.spiritualGrowthArea} onValueChange={(v) => updateFormData('spiritualGrowthArea', v)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Spiritual growth", "Healing / health", "Family / marriage", 
                  "Finances", "Career / business", "Direction / purpose",
                  "Emotional well-being", "Salvation"
                ].map(opt => (
                  <div key={opt} className={cn(
                    "flex items-center space-x-3 p-3 rounded-2xl border transition-all cursor-pointer",
                    formData.spiritualGrowthArea === opt 
                      ? "bg-amber-500/10 border-amber-500/50" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                  )}
                  onClick={() => updateFormData('spiritualGrowthArea', opt)}
                  >
                    <RadioGroupItem value={opt} id={`growth-${slugify(opt)}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`growth-${slugify(opt)}`} className="text-sm cursor-pointer text-slate-200 font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <div 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                  formData.contactPreference ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                )}
                onClick={() => updateFormData('contactPreference', !formData.contactPreference)}
              >
                <div className="space-y-0.5">
                  <Label className="text-white font-bold">Personal Contact</Label>
                  <p className="text-xs text-slate-400">Request follow-up from our team.</p>
                </div>
                <Checkbox 
                  checked={formData.contactPreference} 
                  className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-6 w-6 rounded-lg"
                />
              </div>
              
              <div 
                 className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                  formData.mentorshipInterest ? "bg-amber-500/10 border-amber-500/50" : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800"
                )}
                onClick={() => updateFormData('mentorshipInterest', !formData.mentorshipInterest)}
              >
                <div className="space-y-0.5">
                  <Label className="text-white font-bold">Mentorship</Label>
                  <p className="text-xs text-slate-400">Interested in mentorship?</p>
                </div>
                <Checkbox 
                  checked={formData.mentorshipInterest} 
                  className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 h-6 w-6 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center py-6">
            <div className="relative">
              <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-500/30">
                <Shield className="h-12 w-12 text-amber-500" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-12 bg-orange-600 rounded-full p-2 border-4 border-slate-900 shadow-xl">
                 <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Consent</h3>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                By completing this registration, I consent to the use of my information for 
                <span className="text-amber-500 font-bold mx-1">church communication</span> 
                and ministry coordination.
              </p>
            </div>
            
            <div 
              className={cn(
                "flex items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer w-full max-w-sm mx-auto group",
                formData.dataConsent 
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]" 
                  : "bg-slate-800/30 border-slate-700 grayscale hover:grayscale-0 hover:border-slate-600 shadow-inner"
              )}
              onClick={() => updateFormData('dataConsent', !formData.dataConsent)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                formData.dataConsent ? "bg-black border-black" : "border-slate-500"
              )}>
                {formData.dataConsent && <CheckCircle2 className="h-5 w-5 text-amber-500" />}
              </div>
              <span className={cn(
                "font-black text-xl uppercase tracking-tighter",
                formData.dataConsent ? "text-black" : "text-slate-500"
              )}>
                I AGREE & CONSENT
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
      case 1: return "Identity & Connection";
      case 2: return "Spiritual Journey";
      case 3: return "Ministry Interest";
      case 4: return "Care & Support";
      case 5: return "Final Consent";
      default: return "";
    }
  };

  const containerClasses = isPage 
    ? "min-h-screen w-full bg-slate-950 flex flex-col items-center py-12 px-4"
    : "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto";

  return (
    <div className={containerClasses}>
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
      `}</style>
      <Card className={cn(
        "bg-slate-950 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-500 rounded-3xl relative",
        isPage ? "w-full max-w-4xl min-h-[80vh]" : "w-full max-w-2xl"
      )}>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

        <CardHeader className="bg-slate-900/50 border-b border-slate-800/50 pb-8 relative z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800/50">
             <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-700 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
             />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-black rounded-full">Step {step}</span>
              <span className="text-slate-600 text-[10px] font-bold">Of {totalSteps}</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all shadow-lg"
            >
              ✕
            </button>
          </div>
          <CardTitle className="text-3xl font-black text-white italic flex items-center gap-4 tracking-tighter">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/20">
              {step === 1 && <User className="h-7 w-7 text-black shadow-inner" />}
              {step === 2 && <Church className="h-7 w-7 text-black shadow-inner" />}
              {step === 3 && <Users className="h-7 w-7 text-black shadow-inner" />}
              {step === 4 && <Heart className="h-7 w-7 text-black shadow-inner" />}
              {step === 5 && <CheckCircle2 className="h-7 w-7 text-black shadow-inner" />}
            </div>
            {getStepTitle()}
          </CardTitle>
          <CardDescription className="text-slate-400 mt-3 text-base leading-relaxed max-w-[90%] font-medium">
            {step === 1 && "Confirm your identity. We'll pre-fill what we know."}
            {step === 2 && "Share your journey so we can serve you better."}
            {step === 3 && "Discover your place in the Body of Christ."}
            {step === 4 && "Tell us how we can intercede for you."}
            {step === 5 && "Join the Voices of Hope family."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-8 relative z-10 px-8">
          {renderStep()}
        </CardContent>
        
        <CardFooter className="bg-slate-900/80 border-t border-slate-800/50 p-8 flex justify-between gap-6 relative z-10 backdrop-blur-md">
          <Button 
            variant="ghost" 
            onClick={step === 1 ? onClose : handleBack} 
            className="text-slate-500 hover:text-white px-6 h-14 rounded-2xl font-bold transition-all"
          >
            {step === 1 ? 'Discard' : <span className="flex items-center gap-2"><ChevronLeft className="h-5 w-5" /> Previous</span>}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext} 
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black px-10 h-14 rounded-2xl shadow-2xl transition-all transform active:scale-[0.97] flex items-center gap-2 text-lg italic tracking-tighter"
            >
              CONTINUE <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.dataConsent || isSaving}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-400 hover:via-orange-400 hover:to-orange-500 text-black font-black px-12 h-14 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.4)] disabled:opacity-20 transition-all transform active:scale-[0.95] text-xl italic tracking-tighter"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-3" />}
              FINISH NOW
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
