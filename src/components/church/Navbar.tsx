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
  Sparkles
} from 'lucide-react';

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

  // Filter nav items based on enabled features
  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      if (!item.feature) return true; // Always show items without a feature flag
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
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 font-bold text-xl text-white"
          >
            <div className="relative">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-7 w-7 object-contain" />
              ) : (
                <>
                  <Church className="h-7 w-7 text-amber-500" />
                  <Sparkles className="h-3 w-3 text-amber-400 absolute -top-1 -right-1" />
                </>
              )}
            </div>
            <span>{settings.siteName || 'Digital Church'}</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.view}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView(item.view)}
                className={`text-slate-300 hover:text-white hover:bg-slate-800 ${currentView === item.view ? 'bg-slate-800 text-white' : ''}`}
              >
                {item.label}
              </Button>
            ))}
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
                    className="hidden sm:flex border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                {settings.features.memberDashboardEnabled && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-slate-800">
                      <Avatar className="h-9 w-9 border-2 border-amber-500">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback className="bg-amber-500 text-white">
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
                        <Badge variant="outline" className="w-fit text-amber-500 border-amber-500/30 mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={() => setCurrentView('profile')} className="hover:bg-slate-800 focus:bg-slate-800">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {settings.features.memberDashboardEnabled && (
                      <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="hover:bg-slate-800 focus:bg-slate-800">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => setCurrentView('admin')} className="hover:bg-slate-800 focus:bg-slate-800">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-slate-800 focus:bg-slate-800 text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => setShowSignIn(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-slate-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-slate-900 border-slate-800 text-white">
                <div className="flex items-center gap-2 mb-8 mt-4">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt={settings.siteName} className="h-6 w-6 object-contain" />
                  ) : (
                    <Church className="h-6 w-6 text-amber-500" />
                  )}
                  <span className="font-bold text-lg">{settings.siteName || 'Digital Church'}</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.view}
                      variant="ghost"
                      onClick={() => setCurrentView(item.view)}
                      className={`justify-start text-slate-300 hover:text-white hover:bg-slate-800 ${currentView === item.view ? 'bg-slate-800 text-white' : ''}`}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                  {!isAuthenticated && (
                    <Button 
                      onClick={() => setShowSignIn(true)}
                      className="bg-amber-500 hover:bg-amber-600 mt-4"
                    >
                      Sign In
                    </Button>
                  )}
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-slate-800 my-3" />
                      {settings.features.memberDashboardEnabled && (
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentView('dashboard')}
                          className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Dashboard
                        </Button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentView('admin')}
                          className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start text-red-400 hover:text-red-300 hover:bg-slate-800"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log out
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Sign In Dialog */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500 p-3 rounded-full">
                <Church className="h-6 w-6 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Welcome Back</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Sign in to access your account
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={settings.features.registrationEnabled ? "grid w-full grid-cols-2 bg-slate-800" : "grid w-full grid-cols-1 bg-slate-800"}>
              <TabsTrigger value="signin" className="data-[state=active]:bg-amber-500">Sign In</TabsTrigger>
              {settings.features.registrationEnabled && (
                <TabsTrigger value="signup" className="data-[state=active]:bg-amber-500">Sign Up</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600"
                onClick={handleSignIn}
                disabled={isLoading || !email}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </TabsContent>

            {settings.features.registrationEnabled && (
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  onClick={handleSignUp}
                  disabled={isLoading || !email || !name}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </TabsContent>
            )}
          </Tabs>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-sm text-center text-slate-400 mb-3">
              Demo accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('PASTOR')}
                disabled={isLoading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Pastor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDemoLogin('MEMBER')}
                disabled={isLoading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
