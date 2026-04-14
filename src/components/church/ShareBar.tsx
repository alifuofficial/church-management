'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Mail, 
  Copy, 
  Check,
  Send, // Approximating WhatsApp with Send icon if needed, or simple icon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ShareBarProps {
  title: string;
}

export default function ShareBar({ title }: ShareBarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Sermon link has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Watch: ${title}`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this sermon: ${shareUrl}`)}`,
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Share Message</span>
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                onClick={() => window.open(shareLinks.facebook, '_blank')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on Facebook</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-all"
                onClick={() => window.open(shareLinks.twitter, '_blank')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on X (Twitter)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all"
                onClick={() => window.open(shareLinks.whatsapp, '_blank')}
              >
                <Send className="h-5 w-5 rotate-45 -translate-y-0.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on WhatsApp</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                onClick={() => window.open(shareLinks.email, '_blank')}
              >
                <Mail className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send via Email</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6 mx-1 bg-slate-800" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 rounded-full border-slate-700 text-white hover:bg-slate-800 gap-2"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy URL to clipboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function Separator({ orientation, className }: { orientation: string, className: string }) {
  return <div className={`${className} ${orientation === 'vertical' ? 'w-[1px]' : 'h-[1px]'}`} />;
}
