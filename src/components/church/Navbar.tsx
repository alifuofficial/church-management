'use client';

import { useState, useMemo } from 'react';
import { useAppStore, ViewType } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Church, 
  Menu, 
  Home, 
  Calendar, 
  BookOpen, 
  Heart, 
  Mail, 
  Users, 
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  Cross,
  UserPlus,
  LogIn,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  view: ViewType;
  label: string;
  icon: typeof Home;
  feature?: keyof ReturnType<typeof useAppStore>['settings']['features'];
}

const allNavItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'events', label: 'Events', icon: Calendar, feature: 'eventsEnabled' },
  { view: 'sermons', label: 'Sermons', icon: BookOpen, feature: 'sermonsEnabled' },
  { view: 'prayer', label: 'Prayer', icon: Heart, feature: 'prayerEnabled' },
  { view: 'about', label: 'About', icon: Users, feature: 'aboutEnabled' },
  { view: 'contact', label: 'Contact', icon: Mail, feature: 'contactEnabled' },
];

export function Navbar() {
  const { currentView, setCurrentView, user, isAuthenticated, setUser, settings } = useAppStore();
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter nav items based on enabled features
  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      if (!item.feature) return true;
      return settings.features[item.feature];
    });
  }, [settings.features]);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const handleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      
      const foundUser = users.find((u: { email: string }) => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        setShowSignIn(false);
        setCurrentView(foundUser.role === 'ADMIN' ? 'admin' : 'dashboard');
      } else {
        setError('User not found. Try a demo account below.');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role: 'MEMBER',
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUser(newUser);
        setShowSignIn(false);
        setCurrentView('dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'PASTOR' | 'MEMBER') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      
      const foundUser = users.find((u: { role: string }) => u.role === role);
      
      if (foundUser) {
        setUser(foundUser);
        setShowSignIn(false);
        setCurrentView(role === 'ADMIN' ? 'admin' : 'dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-lg supports-[backdrop-filter]:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 font-bold text-xl text-white group"
          >
            <div className="relative">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-8 object-contain" />
              ) : (
                <div className="relative">
                  <Church className="h-8 w-8 text-amber-500 group-hover:scale-110 transition-transform" />
                  <Sparkles className="h-3 w-3 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
              )}
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-amber-400 group-hover:to-orange-400 transition-all">
              {settings.siteName || 'Voice of Hope'}
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <Button
                  key={item.view}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView(item.view)}
                  className={cn(
                    "relative text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-300",
                    isActive && "text-amber-400 hover:text-amber-400 bg-amber-500/10"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentView('admin')}
                    className="hidden sm:flex border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                {settings.features.memberDashboardEnabled && (
                  <Button
                    size="sm"
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold shadow-lg shadow-amber-500/20"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-800/50 p-0.5">
                      <Avatar className="h-9 w-9 border-2 border-amber-500/50 hover:border-amber-500 transition-colors">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-white" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-slate-400">{user.email}</p>
                        <Badge className="w-fit bg-amber-500/10 text-amber-400 border-0 border-amber-500/30 mt-1.5">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={() => setCurrentView('profile')} className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {settings.features.memberDashboardEnabled && (
                      <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => setCurrentView('admin')} className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setActiveTab('signin');
                    setShowSignIn(true);
                  }}
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                {settings.features.registrationEnabled && (
                  <Button 
                    onClick={() => {
                      setActiveTab('signup');
                      setShowSignIn(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold shadow-lg shadow-amber-500/20"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-slate-800/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-950 border-slate-800 text-white p-0">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-10 object-contain" />
                    ) : (
                      <div className="relative">
                        <Church className="h-10 w-10 text-amber-500" />
                        <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-lg text-white">{settings.siteName || 'Voice of Hope'}</span>
                      <p className="text-xs text-slate-500">Menu</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-4">
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const isActive = currentView === item.view;
                      return (
                        <Button
                          key={item.view}
                          variant="ghost"
                          onClick={() => {
                            setCurrentView(item.view);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "justify-start text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all",
                            isActive && "text-amber-400 bg-amber-500/10 hover:bg-amber-500/10 hover:text-amber-400"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.label}
                          {isActive && (
                            <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-0 text-xs">Active</Badge>
                          )}
                        </Button>
                      );
                    })}
                  </nav>
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-slate-800" />

                {/* Auth Section */}
                <div className="p-4">
                  {!isAuthenticated ? (
                    <div className="space-y-3">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowSignIn(true);
                          setActiveTab('signin');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full border-slate-700 text-white hover:bg-slate-800 justify-start"
                      >
                        <LogIn className="h-4 w-4 mr-3" />
                        Sign In
                      </Button>
                      {settings.features.registrationEnabled && (
                        <Button 
                          onClick={() => {
                            setShowSignIn(true);
                            setActiveTab('signup');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold justify-start"
                        >
                          <UserPlus className="h-4 w-4 mr-3" />
                          Register
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                        <Avatar className="h-10 w-10 border-2 border-amber-500">
                          <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-400 border-0 text-xs">
                          {user?.role}
                        </Badge>
                      </div>

                      {settings.features.memberDashboardEnabled && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setCurrentView('dashboard');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Dashboard
                        </Button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setCurrentView('admin');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-amber-400 hover:bg-amber-500/10"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/50 border-t border-slate-800">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Cross className="h-3 w-3 text-amber-500" />
                    <span>{settings.siteName || 'Voice of Hope'} Ministry</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Sign In / Register Dialog */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20">
                  <Church className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {activeTab === 'signin' ? 'Welcome Back' : 'Join Our Community'}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              {activeTab === 'signin' 
                ? 'Sign in to access your account and connect with us' 
                : 'Create an account to get started'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={cn(
              "w-full bg-slate-800/50",
              settings.features.registrationEnabled ? "grid grid-cols-2" : "grid grid-cols-1"
            )}>
              <TabsTrigger value="signin" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-semibold">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </TabsTrigger>
              {settings.features.registrationEnabled && (
                <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black font-semibold">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-slate-300">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-slate-300">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-11"
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold h-11 shadow-lg shadow-amber-500/20"
                onClick={handleSignIn}
                disabled={isLoading || !email}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In
              </Button>
            </TabsContent>

            {settings.features.registrationEnabled && (
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-300">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-11"
                  />
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold h-11 shadow-lg shadow-amber-500/20"
                  onClick={handleSignUp}
                  disabled={isLoading || !email || !name}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Create Account
                </Button>
              </TabsContent>
            )}
          </Tabs>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-sm text-center text-slate-500 mb-3">
              Quick demo access:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-amber-500/50"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('PASTOR')}
                disabled={isLoading}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-amber-500/50"
              >
                Pastor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('MEMBER')}
                disabled={isLoading}
                className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-amber-500/50"
              >
                Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
