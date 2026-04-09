'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Navbar } from '@/components/church/Navbar';
import { Footer } from '@/components/church/Footer';
import { HomePage } from '@/components/church/HomePage';
import { EventsPage } from '@/components/church/EventsPage';
import { SermonsPage } from '@/components/church/SermonsPage';
import { PrayerPage } from '@/components/church/PrayerPage';
import { AboutPage } from '@/components/church/AboutPage';
import { ContactPage } from '@/components/church/ContactPage';
import { AuthForm } from '@/components/church/AuthForm';
import { DashboardPage } from '@/components/member/DashboardPage';
import { ProfilePage } from '@/components/member/ProfilePage';
import { AdminPage } from '@/components/admin/AdminPage';
import { ComingSoonPage, MaintenancePage, PrivateModePage } from '@/components/church/SiteStatusPages';
import { DynamicFavicon } from '@/components/church/DynamicFavicon';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { 
    currentView, 
    setCurrentView,
    isAuthenticated, 
    user, 
    settings, 
    setSettings, 
    settingsLoaded, 
    setSettingsLoaded 
  } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch site settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (settingsLoaded) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          // Convert string booleans to actual booleans
          const parsedSettings = {
            ...data,
            collectEmails: data.collectEmails === 'true' || data.collectEmails === true,
            showProgress: data.showProgress === 'true' || data.showProgress === true,
            allowRegistration: data.allowRegistration === 'true' || data.allowRegistration === true,
            showLoginForm: data.showLoginForm === 'true' || data.showLoginForm === true,
            features: {
              eventsEnabled: data.features?.eventsEnabled !== false && data.features?.eventsEnabled !== 'false',
              sermonsEnabled: data.features?.sermonsEnabled !== false && data.features?.sermonsEnabled !== 'false',
              prayerEnabled: data.features?.prayerEnabled !== false && data.features?.prayerEnabled !== 'false',
              donationsEnabled: data.features?.donationsEnabled !== false && data.features?.donationsEnabled !== 'false',
              smallGroupsEnabled: data.features?.smallGroupsEnabled !== false && data.features?.smallGroupsEnabled !== 'false',
              contactEnabled: data.features?.contactEnabled !== false && data.features?.contactEnabled !== 'false',
              aboutEnabled: data.features?.aboutEnabled !== false && data.features?.aboutEnabled !== 'false',
              registrationEnabled: data.features?.registrationEnabled !== false && data.features?.registrationEnabled !== 'false',
              memberDashboardEnabled: data.features?.memberDashboardEnabled !== false && data.features?.memberDashboardEnabled !== 'false',
              notificationsEnabled: data.features?.notificationsEnabled !== false && data.features?.notificationsEnabled !== 'false',
            },
            language: {
              enabled: data.language?.enabled === 'true' ||data.language?.enabled === true,
              showInNavbar: data.language?.showInNavbar !== false && data.language?.showInNavbar !== 'false',
              showInFooter: data.language?.showInFooter !== false && data.language?.showInFooter !== 'false',
              defaultLanguage: data.language?.defaultLanguage || 'en',
              availableLanguages: data.language?.availableLanguages || ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
            },
          };
          
          // Only update if settings have changed to avoid unnecessary re-renders
          if (JSON.stringify(parsedSettings) !== JSON.stringify(settings)) {
            setSettings(parsedSettings);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
        setSettingsLoaded(true);
      }
    };

    fetchSettings();
  }, [settingsLoaded, setSettings, setSettingsLoaded]);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isAdminOrPastor = user?.role === 'ADMIN' || user?.role === 'PASTOR' || user?.role === 'SUPER_ADMIN';

  // Redirect non-admin users away from admin page
  useEffect(() => {
    if (currentView === 'admin' && !isAdminOrPastor) {
      setCurrentView('home');
    }
  }, [currentView, isAdminOrPastor, setCurrentView]);
  
  // Sync full user profile on mount if authenticated
  useEffect(() => {
    const syncUserProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const res = await fetch(`/api/auth/session`);
          if (res.ok) {
            const session = await res.json();
            if (session.user) {
              const profileRes = await fetch(`/api/users/${session.user.id}`);
              if (profileRes.ok) {
                const fullUser = await profileRes.json();
                // Only update if data is different to avoid infinite loops or excessive re-renders
                if (JSON.stringify(fullUser) !== JSON.stringify(user)) {
                  setUser(fullUser);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    };

    syncUserProfile();
  }, [isAuthenticated, user, setUser]);

  // Handle login button click
  const handleLoginClick = () => {
    setShowAuth(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <DynamicFavicon />
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </>
    );
  }

  // Check site mode and show appropriate page
  // Admins can always access the site regardless of mode
  if (!isAdmin) {
    // Coming Soon mode
    if (settings.siteMode === 'coming_soon') {
      return (
        <>
          <DynamicFavicon />
          <ComingSoonPage settings={settings} onAdminLogin={handleLoginClick} />
          {showAuth && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-md">
                <button 
                  onClick={() => setShowAuth(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
                >
                  ✕
                </button>
                <AuthForm />
              </div>
            </div>
          )}
        </>
      );
    }

    // Maintenance mode
    if (settings.siteMode === 'maintenance') {
      return (
        <>
          <DynamicFavicon />
          <MaintenancePage settings={settings} onAdminLogin={handleLoginClick} />
          {showAuth && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-md">
                <button 
                  onClick={() => setShowAuth(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
                >
                  ✕
                </button>
                <AuthForm />
              </div>
            </div>
          )}
        </>
      );
    }

    // Private mode - show login if not authenticated
    if (settings.siteMode === 'private' && !isAuthenticated) {
      return (
        <>
          <DynamicFavicon />
          <PrivateModePage 
            settings={settings} 
            onLogin={handleLoginClick}
            onAdminLogin={handleLoginClick}
          />
          {showAuth && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-md">
                <button 
                  onClick={() => setShowAuth(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
                >
                  ✕
                </button>
                <AuthForm />
              </div>
            </div>
          )}
        </>
      );
    }
  }

  // Render based on current view (live mode or authenticated admin/member)
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'events':
        return <EventsPage />;
      case 'sermons':
        return <SermonsPage />;
      case 'prayer':
        return <PrayerPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <DynamicFavicon />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {renderContent()}
        </main>
        <Footer />
        
        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
              >
                ✕
              </button>
              <AuthForm />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

