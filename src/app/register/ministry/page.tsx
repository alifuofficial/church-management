'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Navbar } from '@/components/church/Navbar';
import { Footer } from '@/components/church/Footer';
import { MinistryRegistrationFlow } from '@/components/member/MinistryRegistrationFlow';
import { Loader2 } from 'lucide-react';

export default function MinistryRegistrationPage() {
  const router = useRouter();
  const { isAuthenticated, user, setCurrentView } = useAppStore();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const handleClose = () => {
    setCurrentView('dashboard');
    router.push('/');
  };

  const handleComplete = () => {
    setCurrentView('dashboard');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <MinistryRegistrationFlow 
          isPage={true} 
          onClose={handleClose} 
          onComplete={handleComplete} 
        />
      </main>
      <Footer />
    </div>
  );
}
