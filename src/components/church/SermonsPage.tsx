'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Play, 
  Download, 
  Clock, 
  BookOpen, 
  Headphones,
  FileText,
  Star,
  Sparkles,
  Cross,
  Globe,
  Users,
  Loader2,
  X
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  speakerName: string;
  videoUrl: string | null;
  audioUrl: string | null;
  documentUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  viewCount: number;
  downloadCount: number;
  tags: string | null;
  publishedAt: string;
  isFeatured: boolean;
  series?: { id: string; name: string; description: string | null } | null;
}

interface Series {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

const sermonStats = [
  { icon: BookOpen, label: 'Sermons', value: '100+' },
  { icon: Users, label: 'Listeners', value: '1000+' },
  { icon: Globe, label: 'Countries', value: '50+' },
];

export function SermonsPage() {
  const { user, isAuthenticated } = useAppStore();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);
  const [playerType, setPlayerType] = useState<'video' | 'audio' | null>(null);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle standard youtube links
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle short youtube links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  useEffect(() => {
    fetchSermons();
  }, [search, seriesFilter]);

  const fetchSermons = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (seriesFilter !== 'all') params.append('seriesId', seriesFilter);
      params.append('limit', '20');
      
      const res = await fetch(`/api/sermons?${params.toString()}`);
      const data = await res.json();
      setSermons(data);
      
      // Extract unique series
      const uniqueSeries = data
        .filter((s: Sermon) => s.series)
        .reduce((acc: Series[], s: Sermon) => {
          if (s.series && !acc.find(item => item.id === s.series!.id)) {
            acc.push(s.series);
          }
          return acc;
        }, []);
      setSeries(uniqueSeries);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const featuredSermon = sermons.find(s => s.isFeatured);

  const filteredSermons = sermons.filter(s => {
    if (activeTab === 'video') return s.videoUrl;
    if (activeTab === 'audio') return s.audioUrl;
    return true;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-violet-500/15 via-purple-500/10 to-transparent rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              Sermon Library
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Grow in <span className="text-amber-500">Faith</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Watch, listen, and be strengthened through the teaching of God&apos;s Word
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {sermonStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <stat.icon className="h-6 w-6 text-amber-500" />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sermon */}
      {featuredSermon && (
        <section className="py-12 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="relative aspect-video lg:aspect-auto lg:w-2/5">
                    <img
                      src={featuredSermon.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800'}
                      alt={featuredSermon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/30 transition-colors">
                      <Button 
                        size="lg" 
                        className="rounded-full bg-amber-500 hover:bg-amber-600 text-black h-16 w-16 group-hover:scale-110 transition-transform"
                        onClick={() => {
                          setPlayingSermon(featuredSermon);
                          setPlayerType(featuredSermon.videoUrl ? 'video' : 'audio');
                        }}
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-amber-500 text-black border-0">Featured</Badge>
                  </div>
                  <div className="flex-1 p-6 lg:p-8">
                    <Badge className="bg-slate-700 text-slate-300 border-0 mb-3">
                      {featuredSermon.series?.name || 'Standalone'}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{featuredSermon.title}</h2>
                    <p className="text-slate-400 mb-6 line-clamp-2">{featuredSermon.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-amber-500" />
                        {featuredSermon.speakerName}
                      </div>
                      {featuredSermon.scripture && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-amber-500" />
                          {featuredSermon.scripture}
                        </div>
                      )}
                      {featuredSermon.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-amber-500" />
                          {formatDuration(featuredSermon.duration)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {featuredSermon.videoUrl && (
                        <Button 
                          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                          onClick={() => {
                            setPlayingSermon(featuredSermon);
                            setPlayerType('video');
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                      )}
                      {featuredSermon.audioUrl && (
                        <Button 
                          variant="outline" 
                          className="border-slate-700 text-white hover:bg-slate-800"
                          onClick={() => {
                            setPlayingSermon(featuredSermon);
                            setPlayerType('audio');
                          }}
                        >
                          <Headphones className="h-4 w-4 mr-2" />
                          Audio
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-6 bg-slate-900 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search sermons by title, speaker, or scripture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 h-12"
              />
            </div>
            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-700 text-white h-12">
                <SelectValue placeholder="All Series" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Series</SelectItem>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-6 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex justify-center gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              className={activeTab === 'all' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('all')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Sermons
            </Button>
            <Button
              variant={activeTab === 'video' ? 'default' : 'outline'}
              className={activeTab === 'video' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('video')}
            >
              <Play className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              variant={activeTab === 'audio' ? 'default' : 'outline'}
              className={activeTab === 'audio' 
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold' 
                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }
              onClick={() => setActiveTab('audio')}
            >
              <Headphones className="h-4 w-4 mr-2" />
              Audio
            </Button>
          </div>
        </div>
      </section>

      {/* Sermons Grid/List */}
      <section className="py-12 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                    <div className="aspect-video bg-slate-700" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-700 rounded mb-2 w-1/3" />
                      <div className="h-4 bg-slate-700 rounded mb-2 w-full" />
                      <div className="h-4 bg-slate-700 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSermons.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No sermons found</h3>
                  <p className="text-slate-400">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : activeTab === 'audio' ? (
              // Audio List View
              <div className="space-y-4">
                {filteredSermons.map((sermon) => (
                  <Card key={sermon.id} className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Button 
                        size="icon" 
                        className="rounded-full bg-amber-500 hover:bg-amber-600 text-black h-12 w-12 shrink-0"
                        onClick={() => {
                          setPlayingSermon(sermon);
                          setPlayerType('audio');
                        }}
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{sermon.title}</h3>
                        <p className="text-sm text-slate-500">
                          {sermon.speakerName} • {formatDate(sermon.publishedAt)}
                        </p>
                      </div>
                      {sermon.scripture && (
                        <Badge className="bg-slate-700 text-slate-300 border-0 hidden sm:block">
                          {sermon.scripture}
                        </Badge>
                      )}
                      {sermon.documentUrl && (
                        <Button variant="outline" size="icon" className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Grid View for Video/All
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSermons.map((sermon) => (
                  <Card 
                    key={sermon.id} 
                    className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative aspect-video bg-slate-700">
                      <img
                        src={sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800'}
                        alt={sermon.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="lg" 
                          className="rounded-full bg-amber-500 hover:bg-amber-600 text-black"
                          onClick={() => {
                            setPlayingSermon(sermon);
                            setPlayerType(sermon.videoUrl ? 'video' : 'audio');
                          }}
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                      {sermon.duration && (
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
                          {formatDuration(sermon.duration)}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {sermon.series && (
                        <Badge className="bg-slate-700 text-slate-300 border-0 mb-2">{sermon.series.name}</Badge>
                      )}
                      <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {sermon.title}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                        <BookOpen className="h-3 w-3" />
                        {sermon.speakerName}
                      </p>
                      
                      {sermon.scripture && (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 mb-3">
                          {sermon.scripture}
                        </Badge>
                      )}
                      
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {sermon.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {formatDate(sermon.publishedAt)}
                        </span>
                        <div className="flex gap-1">
                          {sermon.audioUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-slate-700"
                              onClick={() => {
                                setPlayingSermon(sermon);
                                setPlayerType('audio');
                              }}
                            >
                              <Headphones className="h-4 w-4" />
                            </Button>
                          )}
                          {sermon.documentUrl && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:bg-slate-700">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Cross className="h-12 w-12 mx-auto text-amber-500 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be Strengthened in Christ
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Our sermons are designed to help you grow in faith and be firmly rooted in God&apos;s Word.
            </p>
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse All Sermons
            </Button>
          </div>
        </div>
      </section>

      {/* Video/Audio Player Dialog */}
      <Dialog open={!!playingSermon} onOpenChange={(open) => !open && setPlayingSermon(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 p-0 overflow-hidden text-white">
          <DialogHeader className="p-4 border-b border-slate-800">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate pr-4">{playingSermon?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="aspect-video bg-black flex items-center justify-center">
            {playingSermon && playerType === 'video' && (
              playingSermon.videoUrl?.includes('youtube.com') || playingSermon.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={`${getYoutubeEmbedUrl(playingSermon.videoUrl)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={playingSermon.videoUrl || ''} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              )
            )}
            
            {playingSermon && playerType === 'audio' && (
              <div className="w-full px-8 flex flex-col items-center gap-6">
                <div className="w-48 h-48 rounded-2xl bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden relative group">
                  <img 
                    src={playingSermon.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800'} 
                    alt={playingSermon.title} 
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Headphones className="h-16 w-16 text-amber-500" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">{playingSermon.title}</h3>
                  <p className="text-slate-400">{playingSermon.speakerName}</p>
                </div>
                <audio 
                  src={playingSermon.audioUrl || ''} 
                  controls 
                  autoPlay 
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-950/50">
            <h4 className="font-semibold text-lg mb-2">About this message</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {playingSermon?.description || 'No description available for this sermon.'}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              {playingSermon?.scripture && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-amber-500" />
                  {playingSermon.scripture}
                </div>
              )}
              {playingSermon?.speakerName && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-amber-500" />
                  {playingSermon.speakerName}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
