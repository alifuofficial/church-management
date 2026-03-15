'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Globe } from 'lucide-react';

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';

const commonLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
];

interface GoogleTranslateProps {
  variant?: 'navbar' | 'footer';
}

export function GoogleTranslate({ variant = 'navbar' }: GoogleTranslateProps) {
  const { settings } = useAppStore();
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const isEnabled = settings.language?.enabled;
  const showInLocation = variant === 'navbar' 
    ? settings.language?.showInNavbar 
    : settings.language?.showInFooter;

  const availableLangs = settings.language?.availableLanguages?.length 
    ? commonLanguages.filter(l => settings.language.availableLanguages.includes(l.code))
    : commonLanguages;

  // Detect current language from cookie
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const googTransCookie = cookies.find(c => c.trim().startsWith('googtrans='));
    if (googTransCookie) {
      const langPair = googTransCookie.split('=')[1];
      const langCode = langPair.split('/')[2];
      if (langCode) {
        setCurrentLang(langCode);
      }
    }
  }, []);

  // Load Google Translate script
  useEffect(() => {
    if (!isEnabled) return;

    // Check if script already exists
    if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      return;
    }

    // Add Google Translate script
    const script = document.createElement('script');
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Define callback
    (window as unknown as { googleTranslateElementInit: () => void }).googleTranslateElementInit = function() {
      const element = document.getElementById('google_translate_element');
      if (element && (window as unknown as { google?: { translate?: { TranslateElement?: new (...args: unknown[]) => unknown } } }).google?.translate?.TranslateElement) {
        new (window as unknown as { google: { translate: { TranslateElement: new (...args: unknown[]) => unknown } } }).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: availableLangs.map(l => l.code).join(','),
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [isEnabled, availableLangs]);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
    
    // Reload the page to apply translation
    window.location.reload();
  };

  // Don't render if language feature is disabled
  if (!isEnabled || !showInLocation) {
    return null;
  }

  const currentLanguage = commonLanguages.find(l => l.code === currentLang) || commonLanguages[0];

  if (variant === 'navbar') {
    return (
      <div className="relative">
        <div id="google_translate_element" className="hidden" />
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage?.flag}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
            {availableLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-800 flex items-center gap-2 ${
                  currentLang === lang.code ? 'bg-amber-500/10 text-amber-400' : 'text-slate-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Footer variant
  return (
    <div className="relative">
      <div id="google_translate_element_footer" className="hidden" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-amber-400" />
          <span className="text-slate-400 text-sm">Language</span>
        </div>
        
        <select
          value={currentLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {availableLangs.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}