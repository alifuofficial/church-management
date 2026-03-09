'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Quote, Star, ChevronLeft, ChevronRight, Loader2, 
  MessageSquare, User, Sparkles, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimony {
  id: string;
  name: string;
  role: string;
  image: string | null;
  testimony: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
}

export function TestimoniesPage() {
  const { settings } = useAppStore();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const res = await fetch('/api/testimonies?approved=true');
        const data = await res.json();
        setTestimonies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching testimonies:', error);
        setTestimonies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonies();
  }, []);

  const nextTestimony = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonies.length);
  };

  const prevTestimony = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonies.length) % testimonies.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-slate-950 to-orange-500/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI0NSAxNTggMTEgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              Stories of Faith
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Testimonies
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Read inspiring stories of how God has transformed lives in our community. 
              These testimonies are a testament to His grace and love.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Testimony */}
      {testimonies.length > 0 && testimonies.find(t => t.isFeatured) && (
        <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Featured Testimony
                </span>
              </div>
              
              {(() => {
                const featured = testimonies.find(t => t.isFeatured);
                if (!featured) return null;
                
                return (
                  <Card className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-orange-500/10 border-amber-500/20 overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {featured.image ? (
                            <img 
                              src={featured.image} 
                              alt={featured.name}
                              className="w-32 h-32 rounded-full object-cover border-4 border-amber-500/30 shadow-xl"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border-4 border-amber-500/30 shadow-xl">
                              <User className="h-16 w-16 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex justify-center md:justify-start gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-5 w-5",
                                  i < featured.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                )} 
                              />
                            ))}
                          </div>
                          
                          <Quote className="h-10 w-10 text-amber-500/30 mb-4" />
                          
                          <p className="text-xl md:text-2xl text-white font-light leading-relaxed mb-6 italic">
                            "{featured.testimony}"
                          </p>
                          
                          <div>
                            <p className="text-amber-400 font-semibold text-lg">{featured.name}</p>
                            <p className="text-slate-400">{featured.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* All Testimonies Grid */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              All Testimonies
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every story matters. Read how God is working in the lives of our church family.
            </p>
          </div>

          {testimonies.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Testimonies Yet</h3>
              <p className="text-slate-400">
                Check back soon for inspiring stories from our community.
              </p>
            </div>
          ) : (
            <>
              {/* Grid for larger screens */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonies.map((testimony) => (
                  <Card 
                    key={testimony.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {testimony.image ? (
                          <img 
                            src={testimony.image} 
                            alt={testimony.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border-2 border-amber-500/30">
                            <User className="h-7 w-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{testimony.name}</h3>
                          <p className="text-sm text-slate-400">{testimony.role}</p>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-3.5 w-3.5",
                                  i < testimony.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Quote className="h-6 w-6 text-amber-500/20 absolute -top-1 -left-1" />
                        <p className="text-slate-300 text-sm leading-relaxed pl-4 line-clamp-4">
                          "{testimony.testimony}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Carousel for mobile */}
              <div className="md:hidden">
                <div className="relative">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      {(() => {
                        const testimony = testimonies[currentIndex];
                        if (!testimony) return null;
                        
                        return (
                          <div className="text-center">
                            {testimony.image ? (
                              <img 
                                src={testimony.image} 
                                alt={testimony.name}
                                className="w-20 h-20 rounded-full object-cover border-3 border-amber-500/30 mx-auto mb-4"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border-3 border-amber-500/30 mx-auto mb-4">
                                <User className="h-10 w-10 text-white" />
                              </div>
                            )}
                            
                            <div className="flex justify-center gap-0.5 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "h-4 w-4",
                                    i < testimony.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                  )} 
                                />
                              ))}
                            </div>
                            
                            <Quote className="h-8 w-8 text-amber-500/30 mx-auto mb-2" />
                            
                            <p className="text-slate-300 leading-relaxed mb-4 italic">
                              "{testimony.testimony}"
                            </p>
                            
                            <p className="text-amber-400 font-semibold">{testimony.name}</p>
                            <p className="text-slate-400 text-sm">{testimony.role}</p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                  
                  {/* Navigation Arrows */}
                  {testimonies.length > 1 && (
                    <div className="flex justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevTestimony}
                        className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextTestimony}
                        className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Dots */}
                  {testimonies.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {testimonies.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            index === currentIndex 
                              ? "bg-amber-500 w-4" 
                              : "bg-slate-700 hover:bg-slate-600"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Share Your Story CTA */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <MessageSquare className="h-12 w-12 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Share Your Story
            </h2>
            <p className="text-slate-400 mb-8">
              Has God done something amazing in your life? We'd love to hear your testimony 
              and share it to encourage others in their faith journey.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Submit Your Testimony
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
