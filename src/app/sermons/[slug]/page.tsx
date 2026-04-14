import { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/lib/db';
import { Navbar } from '@/components/church/Navbar';
import { Footer } from '@/components/church/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Headphones, 
  BookOpen, 
  Users, 
  Calendar, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageSquare, // Use for WhatsApp icon approximation
  Mail,
  Copy,
  ChevronLeft,
  Clock,
  Music,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareBar from '@/components/church/ShareBar';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await db.sermon.findUnique({
    where: { slug },
  });

  if (!sermon) {
    return {
      title: 'Sermon Not Found',
    };
  }

  return {
    title: `${sermon.title} | Digital Church`,
    description: sermon.description || `Listen to this message from ${sermon.speakerName} on Digital Church.`,
    openGraph: {
      title: sermon.title,
      description: sermon.description || `Listen to this message from ${sermon.speakerName}.`,
      images: sermon.thumbnailUrl ? [sermon.thumbnailUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: sermon.title,
      description: sermon.description || `Listen to this message from ${sermon.speakerName}.`,
      images: sermon.thumbnailUrl ? [sermon.thumbnailUrl] : [],
    },
  };
}

export default async function SermonPage({ params }: Props) {
  const { slug } = await params;
  
  const sermon = await db.sermon.findUnique({
    where: { slug },
    include: {
      series: true,
    },
  });

  if (!sermon) {
    notFound();
  }

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYoutube = sermon.videoUrl?.includes('youtube.com') || sermon.videoUrl?.includes('youtu.be');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Banner / Hero */}
        <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-slate-900">
            <img 
              src={sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600'} 
              alt={sermon.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-amber-500 hover:text-amber-400 transition-colors mb-6 text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Sermons
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{sermon.title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-amber-500" />
                <span>{sermon.speakerName}</span>
              </div>
              {sermon.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span>{new Date(sermon.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              {sermon.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{Math.floor(sermon.duration / 60)} min</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Video Player Section */}
        <section className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 aspect-video">
              {sermon.videoUrl ? (
                isYoutube ? (
                  <iframe
                    src={`${getYoutubeEmbedUrl(sermon.videoUrl)}?autoplay=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={sermon.videoUrl} 
                    controls 
                    className="w-full h-full"
                    poster={sermon.thumbnailUrl || ''}
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-8">
                  <div className="w-48 h-48 rounded-2xl bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden relative group mb-8">
                    <img 
                      src={sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800'} 
                      alt={sermon.title} 
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music className="h-16 w-16 text-amber-500" />
                    </div>
                  </div>
                  <audio 
                    src={sermon.audioUrl || ''} 
                    controls 
                    className="w-full max-w-xl"
                  />
                </div>
              )}
            </div>

            {/* Sharing Bar */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <ShareBar title={sermon.title} />
              </div>
              
              <div className="flex items-center gap-3">
                {sermon.documentUrl && (
                  <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" asChild>
                    <a href={sermon.documentUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Notes
                    </a>
                  </Button>
                )}
                {sermon.audioUrl && sermon.videoUrl && (
                  <div className="text-slate-400 text-sm italic mr-2">
                    Audio version also available
                  </div>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
              <div className="lg:col-span-2 space-y-8 text-slate-300">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">About this message</h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {sermon.description || 'No description available for this message.'}
                  </p>
                </div>

                {sermon.tags && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {sermon.tags.split(',').map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-400 border-0">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {sermon.series && (
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">Current Series</h3>
                    <div className="flex items-start gap-4">
                      {sermon.series.imageUrl && (
                        <img 
                          src={sermon.series.imageUrl} 
                          className="w-16 h-16 rounded-lg object-cover" 
                          alt={sermon.series.name}
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-white">{sermon.series.name}</h4>
                        <p className="text-slate-400 text-sm mt-1">{sermon.series.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">Scripture Focus</h3>
                  <div className="flex items-center gap-3 text-lg font-bold text-white">
                    <BookOpen className="h-5 w-5 text-amber-500" />
                    {sermon.scripture || 'General Message'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
