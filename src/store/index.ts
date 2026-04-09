import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 'home' | 'events' | 'sermons' | 'prayer' | 'contact' | 'about' | 'dashboard' | 'admin' | 'profile';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  username: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  denomination: string | null;
  faithStatus: string | null;
  localChurch: string | null;
  interests: string | null;
  memberSince: string;
  isVerified: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedStatementOfFaith: boolean;
  
  // Faith Background (Expanded)
  faithStatusDetail: string | null;
  believesInSalvation: string | null;
  confessedChrist: string | null;
  completedDiscipleship: string | null;
  baptisedWater: string | null;
  baptisedSpirit: string | null;
  attendingLocalChurch: string | null;
  notMemberReason: string | null;
  
  // Service & Ministry
  currentlyServing: string | null;
  ministryInterests: string | null;
  giftsStrengths: string | null;
  
  // Follow-up & Prayer
  prayerSupportArea: string | null;
  spiritualGrowthArea: string | null;
  contactPreference: boolean | null;
  mentorshipInterest: boolean | null;
  dataConsent: boolean | null;
}

export interface FeatureFlags {
  eventsEnabled: boolean;
  sermonsEnabled: boolean;
  prayerEnabled: boolean;
  donationsEnabled: boolean;
  smallGroupsEnabled: boolean;
  contactEnabled: boolean;
  aboutEnabled: boolean;
  registrationEnabled: boolean;
  memberDashboardEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface LanguageSettings {
  enabled: boolean;
  showInNavbar: boolean;
  showInFooter: boolean;
  defaultLanguage: string;
  availableLanguages: string[];
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  socialFacebook: string;
  socialTiktok: string;
  socialInstagram: string;
  socialYoutube: string;
  siteMode: 'live' | 'coming_soon' | 'maintenance' | 'private';
  statusHeadline: string;
  statusMessage: string;
  launchDate: string;
  collectEmails: boolean;
  showProgress: boolean;
  statusBackgroundImage: string;
  statusContactEmail: string;
  allowRegistration: boolean;
  showLoginForm: boolean;
  privateMessage: string;
  heroBackgroundImage: string;
  // Email Settings
  emailEnabled: boolean;
  // Feature Flags
  features: FeatureFlags;
  // Language Settings
  language: LanguageSettings;
}

const defaultSettings: SiteSettings = {
  siteName: 'Grace Community Church',
  siteTagline: 'Welcome Home',
  siteDescription: 'A welcoming community of faith dedicated to spreading God\'s love.',
  siteUrl: 'https://gracecommunity.church',
  contactEmail: 'info@gracecommunity.church',
  contactPhone: '(555) 123-4567',
  address: '123 Faith Street, Grace City, GC 12345',
  logoUrl: '',
  faviconUrl: '',
  metaTitle: 'Grace Community Church - Welcome Home',
  metaDescription: 'Join us for worship, fellowship, and spiritual growth at Grace Community Church.',
  metaKeywords: 'church, worship, community, faith, grace, fellowship',
  socialFacebook: '',
  socialTiktok: '',
  socialInstagram: '',
  socialYoutube: '',
  siteMode: 'live',
  statusHeadline: '',
  statusMessage: '',
  launchDate: '',
  collectEmails: true,
  showProgress: false,
  statusBackgroundImage: '',
  statusContactEmail: '',
  allowRegistration: true,
  showLoginForm: true,
  privateMessage: '',
  heroBackgroundImage: '',
  features: {
    eventsEnabled: true,
    sermonsEnabled: true,
    prayerEnabled: true,
    donationsEnabled: true,
    smallGroupsEnabled: true,
    contactEnabled: true,
    aboutEnabled: true,
    registrationEnabled: true,
    memberDashboardEnabled: true,
    notificationsEnabled: true,
  },
  language: {
    enabled: false,
    showInNavbar: true,
    showInFooter: true,
    defaultLanguage: 'en',
    availableLanguages: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
  },
  emailEnabled: true,
};

interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Event filters
  eventFilter: string;
  setEventFilter: (filter: string) => void;
  
  // Sermon filters
  sermonSearch: string;
  setSermonSearch: (search: string) => void;
  sermonSeriesFilter: string;
  setSermonSeriesFilter: (filter: string) => void;
  
  // Site Settings
  settings: SiteSettings;
  setSettings: (settings: Partial<SiteSettings>) => void;
  settingsLoaded: boolean;
  setSettingsLoaded: (loaded: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),
      
      // Auth
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,
      
      // UI State
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Event filters
      eventFilter: 'all',
      setEventFilter: (filter) => set({ eventFilter: filter }),
      
      // Sermon filters
      sermonSearch: '',
      setSermonSearch: (search) => set({ sermonSearch: search }),
      sermonSeriesFilter: 'all',
      setSermonSeriesFilter: (filter) => set({ sermonSeriesFilter: filter }),
      
      // Site Settings
      settings: defaultSettings,
      setSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      settingsLoaded: false,
      setSettingsLoaded: (loaded) => set({ settingsLoaded: loaded }),
    }),
    {
      name: 'digital-church-storage',
      partialize: (state) => ({
        currentView: state.currentView,
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);
