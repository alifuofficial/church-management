'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Filter,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cross,
  Globe,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  capacity: number | null;
  registrationRequired: boolean;
  registrationDeadline: string | null;
  zoomJoinUrl: string | null;
  zoomPassword: string | null;
  registrationCount: number;
}

const eventTypeLabels: Record<string, string> = {
  SERVICE: 'Worship Service',
  BIBLE_STUDY: 'Bible Study',
  PRAYER_MEETING: 'Prayer Meeting',
  YOUTH_NIGHT: 'Youth Night',
  FELLOWSHIP: 'Fellowship',
  CONFERENCE: 'Conference',
  WORKSHOP: 'Workshop',
  COMMUNITY_OUTREACH: 'Community Outreach',
  SPECIAL: 'Special Event',
};

const eventTypeColors: Record<string, string> = {
  SERVICE: 'from-amber-500 to-orange-500',
  BIBLE_STUDY: 'from-emerald-500 to-teal-500',
  PRAYER_MEETING: 'from-violet-500 to-purple-500',
  YOUTH_NIGHT: 'from-rose-500 to-pink-500',
  FELLOWSHIP: 'from-cyan-500 to-blue-500',
  CONFERENCE: 'from-amber-500 to-yellow-500',
  WORKSHOP: 'from-indigo-500 to-violet-500',
  COMMUNITY_OUTREACH: 'from-green-500 to-emerald-500',
  SPECIAL: 'from-orange-500 to-red-500',
};

export function EventsPage() {
  const { currentView, setCurrentView, user, isAuthenticated } = useAppStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateEventsDialogOpen, setDateEventsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' ? '/api/events?limit=20' : `/api/events?type=${filter}&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string, startDate: string) => {
    const now = new Date();
    const eventDate = new Date(startDate);
    
    if (status === 'CANCELLED') {
      return <Badge className="bg-red-500/10 text-red-400 border-0">Cancelled</Badge>;
    }
    if (status === 'LIVE') {
      return <Badge className="bg-red-500 text-white border-0 animate-pulse">Live Now</Badge>;
    }
    if (eventDate < now) {
      return <Badge className="bg-slate-500/10 text-slate-400 border-0">Ended</Badge>;
    }
    return <Badge className="bg-emerald-500/10 text-emerald-400 border-0">Upcoming</Badge>;
  };

  const handleRegister = async (event: Event) => {
    if (!isAuthenticated) {
      setCurrentView('home');
      return;
    }
    setSelectedEvent(event);
    setRegisterDialogOpen(true);
    setRegistrationSuccess(false);
  };

  const submitRegistration = async () => {
    if (!selectedEvent || !user) return;
    
    setIsRegistering(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          userId: user.id,
        }),
      });
      
      if (res.ok) {
        setRegistrationSuccess(true);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error registering:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (day: number) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(date);
      setDateEventsDialogOpen(true);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-slate-800/30" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
      
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-20 p-2 border border-slate-700/50 transition-colors",
            isToday && "bg-amber-500/10 border-amber-500/30",
            dayEvents.length > 0 && "cursor-pointer hover:bg-slate-700/30"
          )}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isToday ? "text-amber-400" : "text-slate-400"
          )}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 truncate"
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-500 px-1.5">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 rounded-xl border border-slate-700 overflow-hidden">
          {dayNames.map(day => (
            <div
              key={day}
              className="h-10 border-b border-slate-700 bg-slate-800/50 flex items-center justify-center text-sm font-medium text-slate-400"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              Events & Programs
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join Our <span className="text-amber-500">Gatherings</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Discover and register for upcoming events, services, and programs
            </p>
          </div>
        </div>
      </section>

      {/* Filter & View Toggle */}
      <section className="py-6 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-amber-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="SERVICE">Worship Services</SelectItem>
                  <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                  <SelectItem value="PRAYER_MEETING">Prayer Meetings</SelectItem>
                  <SelectItem value="YOUTH_NIGHT">Youth Events</SelectItem>
                  <SelectItem value="CONFERENCE">Conferences</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={viewMode === 'list' 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                  : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }
                onClick={() => setViewMode('list')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                className={viewMode === 'calendar' 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                  : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }
                onClick={() => setViewMode('calendar')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-slate-950">
        <div className="container mx-auto px-4">
          {viewMode === 'list' ? (
            isLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-700 rounded mb-4 w-1/3" />
                      <div className="h-4 bg-slate-700 rounded mb-2 w-2/3" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                  <p className="text-slate-400">Check back soon for upcoming events.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Date Card */}
                      <div className={`bg-gradient-to-br ${eventTypeColors[event.type] || 'from-amber-500 to-orange-500'} text-white p-6 lg:w-48 flex flex-col items-center justify-center text-center`}>
                        <span className="text-4xl font-bold">
                          {new Date(event.startDate).getDate()}
                        </span>
                        <span className="text-lg uppercase">
                          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm opacity-80 mt-1">
                          {new Date(event.startDate).getFullYear()}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(event.status, event.startDate)}
                              <Badge className="bg-slate-700 text-slate-300 border-0">
                                {eventTypeLabels[event.type] || event.type}
                              </Badge>
                            </div>
                            <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                              {event.title}
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            {event.isOnline && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Online
                              </Badge>
                            )}
                            {event.isInPerson && (
                              <Badge className="bg-amber-500/10 text-amber-400 border-0 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                In-Person
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-400 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-500" />
                            {formatTime(event.startDate)}
                            {event.endDate && ` - ${formatTime(event.endDate)}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-amber-500" />
                              {event.location}
                            </div>
                          )}
                          {event.capacity && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-amber-500" />
                              {event.registrationCount}/{event.capacity} registered
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {event.registrationRequired ? (
                            <Button 
                              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                              onClick={() => handleRegister(event)}
                              disabled={event.capacity ? event.registrationCount >= event.capacity : false}
                            >
                              {event.capacity && event.registrationCount >= event.capacity 
                                ? 'Event Full' 
                                : 'Register Now'}
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              className="border-slate-700 text-white hover:bg-slate-800"
                              onClick={() => handleRegister(event)}
                            >
                              RSVP
                            </Button>
                          )}
                          {event.zoomJoinUrl && (
                            <Button 
                              variant="outline"
                              className="border-slate-700 text-white hover:bg-slate-800"
                              asChild
                            >
                              <a href={event.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Join Zoom
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                {renderCalendar()}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {registrationSuccess ? 'Registration Complete!' : `Register for ${selectedEvent?.title}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {registrationSuccess 
                ? 'You have successfully registered for this event.'
                : 'Complete your registration for this event.'}
            </DialogDescription>
          </DialogHeader>
          
          {registrationSuccess ? (
            <div className="py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <p className="text-slate-400 mb-4">You will receive a confirmation email with event details.</p>
              {selectedEvent?.zoomJoinUrl && (
                <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
                  <p className="text-sm font-medium text-amber-400 mb-2">Zoom Meeting Link:</p>
                  <a 
                    href={selectedEvent.zoomJoinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline break-all"
                  >
                    {selectedEvent.zoomJoinUrl}
                  </a>
                </div>
              )}
              <Button 
                onClick={() => setRegisterDialogOpen(false)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {!isAuthenticated && (
                <div className="flex items-center gap-2 p-4 bg-amber-500/10 rounded-xl text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">Please sign in to register for events.</p>
                </div>
              )}
              
              {selectedEvent && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-800/50 p-3 rounded-xl">
                      <span className="text-slate-500">Date:</span>
                      <p className="font-medium text-white">{formatDate(selectedEvent.startDate)}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl">
                      <span className="text-slate-500">Time:</span>
                      <p className="font-medium text-white">{formatTime(selectedEvent.startDate)}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl">
                      <span className="text-slate-500">Location:</span>
                      <p className="font-medium text-white">{selectedEvent.location || 'Online'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl">
                      <span className="text-slate-500">Type:</span>
                      <p className="font-medium text-white">{eventTypeLabels[selectedEvent.type]}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Notes (optional)</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Any special requirements or notes..."
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setRegisterDialogOpen(false)}
                      className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      onClick={submitRegistration}
                      disabled={isRegistering || !isAuthenticated}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Confirm Registration'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Date Events Dialog */}
      <Dialog open={dateEventsDialogOpen} onOpenChange={setDateEventsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Events on {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Click on an event to register or view details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDate && getEventsForDate(selectedDate.getDate()).map((event) => (
              <Card 
                key={event.id} 
                className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors cursor-pointer"
                onClick={() => {
                  setDateEventsDialogOpen(false);
                  setSelectedEvent(event);
                  setRegisterDialogOpen(true);
                  setRegistrationSuccess(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(event.status, event.startDate)}
                      <Badge className="bg-slate-700 text-slate-300 border-0 text-xs">
                        {eventTypeLabels[event.type] || event.type}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatTime(event.startDate)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    {event.isOnline && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Video className="h-3 w-3" />
                        Online
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setDateEventsDialogOpen(false)}
            className="w-full mt-4 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
