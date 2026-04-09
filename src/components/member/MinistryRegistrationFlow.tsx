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
  ChevronRight, ChevronLeft, Loader2, Info
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface MinistryRegistrationFlowProps {
  onClose: () => void;
  onComplete: () => void;
}

export function MinistryRegistrationFlow({ onClose, onComplete }: MinistryRegistrationFlowProps) {
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
                <Label className="text-slate-300">Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => updateFormData('name', e.target.value)} 
                  placeholder="Full Name" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email Address</Label>
                <Input value={formData.email} disabled className="bg-slate-800/30 border-slate-700/50 text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Phone / WhatsApp Number</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => updateFormData('phone', e.target.value)} 
                  placeholder="Phone Number" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Country of Residence</Label>
                <Input 
                  value={formData.country} 
                  onChange={(e) => updateFormData('country', e.target.value)} 
                  placeholder="Country" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">City / State / Region</Label>
                <Input 
                  value={formData.city} 
                  onChange={(e) => updateFormData('city', e.target.value)} 
                  placeholder="City" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Time Zone</Label>
                <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white z-[100]">
                    <SelectItem value="UTC+3" className="focus:bg-slate-800 focus:text-white">UTC+3 (East Africa Time)</SelectItem>
                    <SelectItem value="UTC+1" className="focus:bg-slate-800 focus:text-white">UTC+1 (West Africa Time)</SelectItem>
                    <SelectItem value="UTC+0" className="focus:bg-slate-800 focus:text-white">UTC (GMT)</SelectItem>
                    <SelectItem value="UTC-5" className="focus:bg-slate-800 focus:text-white">UTC-5 (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[60vh] pr-2">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">What best describes your current faith status?</Label>
              <RadioGroup value={formData.faithStatusDetail} onValueChange={(v) => updateFormData('faithStatusDetail', v)} className="space-y-2">
                {[
                  "I am a committed believer in Jesus Christ",
                  "I recently gave my life to Christ",
                  "I am growing in my faith",
                  "I am exploring Christianity"
                ].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value={opt} id={`faith-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`faith-${opt}`} className="flex-1 cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">Do you believe in the salvation given through Jesus Christ?</Label>
              <RadioGroup value={formData.believesInSalvation} onValueChange={(v) => updateFormData('believesInSalvation', v)} className="flex flex-col space-y-2">
                {["Yes", "No", "I wanted to learn about salvation through Jesus"].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800">
                    <RadioGroupItem value={opt} id={`salv-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`salv-${opt}`} className="flex-1 cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">Have you personally confessed Jesus Christ as your Lord and Savior?</Label>
              <RadioGroup value={formData.confessedChrist} onValueChange={(v) => updateFormData('confessedChrist', v)} className="flex items-center space-x-4">
                {["Yes", "No", "Maybe"].map(opt => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`conf-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`conf-${opt}`} className="text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">Have you completed any foundational Christian teaching or discipleship class?</Label>
              <RadioGroup value={formData.completedDiscipleship} onValueChange={(v) => updateFormData('completedDiscipleship', v)} className="space-y-2">
                {["Yes", "No", "Looking to attend"].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800">
                    <RadioGroupItem value={opt} id={`disc-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`disc-${opt}`} className="flex-1 cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Have you been baptised in water?</Label>
                <RadioGroup value={formData.baptisedWater} onValueChange={(v) => updateFormData('baptisedWater', v)} className="flex items-center space-x-4">
                  {["Yes", "No"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`water-${opt}`} />
                      <Label htmlFor={`water-${opt}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Have you been baptised with the holyspirit?</Label>
                <RadioGroup value={formData.baptisedSpirit} onValueChange={(v) => updateFormData('baptisedSpirit', v)} className="space-y-2">
                  {["Yes", "No", "I am interested to learn more and need guidance"].map(opt => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`spirit-${opt}`} />
                      <Label htmlFor={`spirit-${opt}`} className="text-sm">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Are you currently attending a local church?</Label>
              <RadioGroup value={formData.attendingLocalChurch} onValueChange={(v) => updateFormData('attendingLocalChurch', v)} className="space-y-2">
                {["Yes, Regularly", "Yes, Occasionally", "No"].map(opt => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`church-${opt}`} />
                    <Label htmlFor={`church-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.attendingLocalChurch === 'No' && (
              <div className="space-y-2">
                <Label className="text-white">If your answer is No to the above can you tell us why you are not a member to a local church</Label>
                <Textarea 
                  value={formData.notMemberReason} 
                  onChange={(e) => updateFormData('notMemberReason', e.target.value)} 
                  placeholder="Share your reason..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">Are you currently serving the Body of Christ with your gifts or talents?</Label>
              <RadioGroup value={formData.currentlyServing} onValueChange={(v) => updateFormData('currentlyServing', v)} className="space-y-2">
                {[
                  "Yes, actively",
                  "Yes, occasionally",
                  "Not currently",
                  "Not yet, but I would like to serve"
                ].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value={opt} id={`serve-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`serve-${opt}`} className="flex-1 cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">What area(s) of service or ministry would you like to join?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {[
                  "Prayer Ministry", "Worship / Music", "Media / Technical Support", 
                  "Evangelism / Outreach", "Bible Teaching / Discipleship", "Administration",
                  "Follow-up / New Converts Care", "Intercession", "Social Media / Communications",
                  "Small Group / Cell Fellowship", "I am not sure yet, but I want guidance"
                ].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Checkbox 
                      id={`min-${opt}`} 
                      checked={formData.ministryInterests.includes(opt)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('ministryInterests', [...formData.ministryInterests, opt]);
                        } else {
                          updateFormData('ministryInterests', formData.ministryInterests.filter(i => i !== opt));
                        }
                      }}
                      className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label htmlFor={`min-${opt}`} className="text-sm cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-white">What gifts, talents, or strengths do you believe God has given you?</Label>
              <Textarea 
                value={formData.giftsStrengths} 
                onChange={(e) => updateFormData('giftsStrengths', e.target.value)} 
                placeholder="Share your strengths..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-white">Is there any area where you need prayer support?</Label>
              <Textarea 
                value={formData.prayerSupportArea} 
                onChange={(e) => updateFormData('prayerSupportArea', e.target.value)} 
                placeholder="Share your prayer requests..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold text-white">Spiritual growth area you'd like to focus on:</Label>
              <RadioGroup value={formData.spiritualGrowthArea} onValueChange={(v) => updateFormData('spiritualGrowthArea', v)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Spiritual growth", "Healing / health", "Family / marriage", 
                  "Finances / provision", "Career / business", "Direction / purpose",
                  "Emotional well-being", "Salvation / rededication"
                ].map(opt => (
                  <div key={opt} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-800/50 transition-colors">
                    <RadioGroupItem value={opt} id={`growth-${opt}`} className="border-slate-500 text-amber-500" />
                    <Label htmlFor={`growth-${opt}`} className="text-sm cursor-pointer text-slate-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-white">Contact Request</Label>
                  <p className="text-xs text-slate-400">Would you like someone from the ministry team to contact you personally?</p>
                </div>
                <Checkbox 
                  checked={formData.contactPreference} 
                  onCheckedChange={(v) => updateFormData('contactPreference', !!v)} 
                  className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-white">Mentorship</Label>
                  <p className="text-xs text-slate-400">Would you be interested in mentorship or discipleship follow-up?</p>
                </div>
                <Checkbox 
                  checked={formData.mentorshipInterest} 
                  onCheckedChange={(v) => updateFormData('mentorshipInterest', !!v)} 
                  className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-center py-4">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="h-10 w-10 text-amber-500" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Consent to Use Information</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                I understand that the information I provide will be used for church communication, 
                discipleship follow-up, pastoral care, and ministry purposes only.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-8">
              <div 
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer w-full max-w-xs ${
                  formData.dataConsent 
                    ? 'bg-amber-500 border-amber-500 text-black' 
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
                onClick={() => updateFormData('dataConsent', !formData.dataConsent)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  formData.dataConsent ? 'bg-black border-black' : 'border-slate-500'
                }`}>
                  {formData.dataConsent && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                </div>
                <span className="font-bold text-lg">Yes, I Consent</span>
              </div>
              
              {!formData.dataConsent && (
                <p className="text-xs text-amber-500/70 italic flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Consent is required to submit the registration.
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Personal Information";
      case 2: return "Faith Background";
      case 3: return "Service & Ministry";
      case 4: return "Follow-Up & Prayer";
      case 5: return "Consent";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <CardHeader className="bg-slate-800/50 border-b border-slate-700/50 pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-1">
             <Progress value={(step / totalSteps) * 100} className="rounded-none h-1 bg-slate-800" indicatorClassName="bg-amber-500 transition-all duration-500" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Step {step} of {totalSteps}</span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            {step === 1 && <User className="h-6 w-6 text-amber-500" />}
            {step === 2 && <Church className="h-6 w-6 text-amber-500" />}
            {step === 3 && <Users className="h-6 w-6 text-amber-500" />}
            {step === 4 && <Heart className="h-6 w-6 text-amber-500" />}
            {step === 5 && <CheckCircle2 className="h-6 w-6 text-amber-500" />}
            {getStepTitle()}
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            {step === 1 && "Start by verifying your basic contact information."}
            {step === 2 && "Help us understand where you are in your spiritual journey."}
            {step === 3 && "Discover areas where you can serve and use your gifts."}
            {step === 4 && "Tell us how we can support you in prayer and growth."}
            {step === 5 && "Finalize your registration for the Voice of Hope Online Ministry."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-6 max-h-[70vh] overflow-y-auto">
          {renderStep()}
        </CardContent>
        
        <CardFooter className="bg-slate-800/30 border-t border-slate-700/50 p-6 flex justify-between gap-4">
          <Button 
            variant="ghost" 
            onClick={step === 1 ? onClose : handleBack} 
            className="text-slate-400 hover:text-white"
          >
            {step === 1 ? 'Cancel' : (
              <span className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </span>
            )}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext} 
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 rounded-xl"
            >
              Continue <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.dataConsent || isSaving}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold px-12 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Complete Registration
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
