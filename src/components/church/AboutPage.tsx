'use client';

import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Church, 
  Users, 
  Heart, 
  BookOpen, 
  Globe,
  Calendar,
  Award,
  Target,
  Sparkles,
  Check,
  Cross,
  User
} from 'lucide-react';

const beliefs = [
  {
    title: 'The Bible',
    description: 'We believe the Bible is God\'s inspired, trustworthy, and authoritative Word, and it guides all we believe and how we live.',
    verse: '2 Timothy 3:15–17; John 17:17'
  },
  {
    title: 'The Trinity',
    description: 'We believe there is one God—Father, Son, and Holy Spirit—Creator of heaven and earth and Lord over all.',
    verse: 'Genesis 1:1; John 1:1–4'
  },
  {
    title: 'Humanity & Sin',
    description: 'We believe every person is created in God\'s image as male and female, yet all have sinned and are separated from Him.',
    verse: 'Genesis 1:27; Romans 3:23; 5:12'
  },
  {
    title: 'Jesus Christ',
    description: 'We believe Jesus Christ is God in the flesh. He lived a sinless life, died for our sins, rose from the dead, and is the only Savior and Mediator.',
    verse: 'Isaiah 53:4–6; 1 Corinthians 15:3–4; 2 Corinthians 5:21'
  },
  {
    title: 'Salvation by Grace',
    description: 'We believe salvation is a free gift of grace, received through faith alone in Jesus Christ, not by works.',
    verse: 'Romans 3:24; Ephesians 2:8–9; Galatians 2:16'
  },
  {
    title: 'The Holy Spirit',
    description: 'We believe the Holy Spirit gives new life, dwells within every believer, and empowers us to grow in holiness, serve faithfully, and witness boldly.',
    verse: 'John 3:3–8; Acts 1:8; Galatians 5:22–23'
  },
  {
    title: 'The Church',
    description: 'We believe the Church is the body of Christ, gathered for worship, fellowship, discipleship, and mission, practicing baptism and the Lord\'s Supper as Christ commanded.',
    verse: 'Acts 2:42; Romans 6:3–4; 1 Corinthians 11:23–26'
  },
  {
    title: 'The Great Commission',
    description: 'We believe we are called to reach the world with the message of the gospel, to make disciples, and to bring people into the Kingdom of God through faith in the saving work of Jesus Christ.',
    verse: 'Matthew 28:19–20; Mark 16:15; Acts 1:8; Romans 10:13–15'
  },
  {
    title: 'Marriage',
    description: 'We believe marriage is God\'s design, a lifelong covenant between one man and one woman.',
    verse: 'Genesis 2:24; Matthew 19:4–6'
  },
  {
    title: 'Holy Living',
    description: 'We believe Christ frees us from sin to live holy lives as His servants and to reflect His love in the world.',
    verse: 'Romans 6:22'
  },
  {
    title: 'Christ\'s Return',
    description: 'We believe Jesus will return personally and visibly, the dead will rise, and God will judge all people, bringing eternal life to the redeemed and judgment to the lost.',
    verse: '1 Thessalonians 4:16–17; Revelation 20:11–15'
  },
];

const leadership = [
  {
    name: 'Your Name Here',
    title: 'Senior Pastor / Founder',
    bio: 'Leading Voice of Hope ministry with a passion for discipleship and evangelism.',
    image: null, // Placeholder - user will add their picture
  },
  // More leaders can be added here
];

export function AboutPage() {
  const { setCurrentView } = useAppStore();

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
              Voice of Hope Ministry
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-amber-500">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Strengthening believers and helping them be firmly rooted and established in Christ
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Church className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">About Us</h2>
            </div>
            
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <p className="text-lg">
                  <strong className="text-amber-400">Voice of Hope</strong> is a Christian ministry dedicated to strengthening believers 
                  and helping them be firmly rooted and established in Christ <span className="text-amber-400">(Col 2:7)</span> through the truth of 
                  God&apos;s Word.
                </p>
                
                <p>
                  Since <strong className="text-white">2014</strong>, we have reached thousands of people around the world—especially within the 
                  Ethiopian Oromo community—through weekly virtual fellowship, teaching, and discipleship.
                </p>
                
                <p>
                  Our mission is to equip believers with spiritual wisdom and revelation, that <span className="text-amber-400">&quot;the eyes of their 
                  hearts may be enlightened&quot;</span> <span className="text-amber-400">(Ephesians 1:18–20)</span>, so they may live according to the 
                  principles of Christ&apos;s Kingdom.
                </p>
                
                <p>
                  We believe that as God&apos;s sons and daughters, filled with His Spirit, believers are called to 
                  walk in their inheritance <span className="text-amber-400">(Galatians 4:6–7)</span>, represent Christ faithfully, and serve as His 
                  ambassadors on earth. We are also expanding our work by training leaders and evangelists 
                  to spread the Gospel in Ethiopia and beyond.
                </p>
              </div>
            </div>
            
            {/* Mission & Vision Cards */}
            <div className="grid gap-6 md:grid-cols-2 mt-12">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-6 w-6 text-amber-500" />
                    <h3 className="text-xl font-bold text-white">Our Mission</h3>
                  </div>
                  <p className="text-slate-400">
                    To equip believers with spiritual wisdom and revelation, strengthening them in Christ 
                    through the truth of God&apos;s Word.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="h-6 w-6 text-amber-500" />
                    <h3 className="text-xl font-bold text-white">Our Vision</h3>
                  </div>
                  <p className="text-slate-400">
                    To see believers firmly rooted in Christ, walking in their inheritance, and serving as 
                    His ambassadors throughout the world.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">What We Believe</h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Our foundational beliefs are grounded in the truth of God&apos;s Word
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {beliefs.map((belief, index) => (
                <Card 
                  key={index} 
                  className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                        <Check className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                          {belief.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                          {belief.description}
                        </p>
                        <Badge variant="outline" className="border-slate-700 text-amber-400/70 text-xs">
                          {belief.verse}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Leadership Team</h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Dedicated servants committed to guiding our ministry and community
            </p>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
              {leadership.map((leader, index) => (
                <Card 
                  key={index} 
                  className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all duration-300 overflow-hidden w-full max-w-sm"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                    {leader.image ? (
                      <img
                        src={leader.image}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-24 h-24 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{leader.name}</h3>
                    <Badge className="bg-amber-500/10 text-amber-400 border-0 mb-3">{leader.title}</Badge>
                    <p className="text-slate-400 text-sm">{leader.bio}</p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add More Leaders Card */}
              <Card className="bg-slate-800/30 border-slate-700 border-dashed hover:border-amber-500/30 transition-all duration-300 w-full max-w-sm flex items-center justify-center min-h-[350px]">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">More Leaders Coming Soon</h3>
                  <p className="text-slate-500 text-sm">
                    We are currently in discussion with additional ministry leaders
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-3xl p-8 md:p-12 border border-amber-500/20">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Impact</h2>
              <div className="grid gap-8 md:grid-cols-4 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">1000+</div>
                  <div className="text-slate-400">Lives Reached</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">2014</div>
                  <div className="text-slate-400">Ministry Founded</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">50+</div>
                  <div className="text-slate-400">Countries Reached</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">24/7</div>
                  <div className="text-slate-400">Virtual Fellowship</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Love</h3>
                <p className="text-slate-400">
                  We love God and love people, showing compassion to all as Christ commanded.
                </p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Truth</h3>
                <p className="text-slate-400">
                  We stand firmly on God&apos;s Word as our guide for faith and practice.
                </p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Discipleship</h3>
                <p className="text-slate-400">
                  We are committed to making disciples and equipping believers for ministry.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Cross className="h-12 w-12 mx-auto text-amber-500 mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Us on the Journey
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Whether you&apos;re exploring faith for the first time or looking to grow deeper in your walk with Christ, 
              we welcome you to be part of our community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
                onClick={() => setCurrentView('events')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Attend a Service
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800 hover:text-white px-8"
                onClick={() => setCurrentView('contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
