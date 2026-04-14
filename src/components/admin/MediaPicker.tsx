'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Loader2, FolderOpen, Image as ImageIcon, Video, Music, File, 
  Check, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Media {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  createdAt: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  typeFilter?: 'image' | 'video' | 'audio' | 'document';
}

export function MediaPicker({ open, onClose, onSelect, typeFilter }: MediaPickerProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [type, setType] = useState<string>(typeFilter || 'all');

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, type]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'all') params.append('type', type);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      setMediaList(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia.url);
      onClose();
      setSelectedMedia(null);
    }
  };

  const getTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const getTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return 'text-pink-400 bg-pink-500/20';
      case 'video': return 'text-blue-400 bg-blue-500/20';
      case 'audio': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-amber-400 bg-amber-500/20';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-400" />
            Select from Media Library
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search media..." 
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaList.map((media) => {
                const TypeIcon = getTypeIcon(media.type);
                const typeColor = getTypeColor(media.type);
                const isSelected = selectedMedia?.id === media.id;
                
                return (
                  <Card 
                    key={media.id} 
                    className={cn(
                      "bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition cursor-pointer",
                      isSelected && "border-amber-500 ring-2 ring-amber-500/30"
                    )}
                    onClick={() => setSelectedMedia(media)}
                    onDoubleClick={() => {
                      setSelectedMedia(media);
                      onSelect(media.url);
                      onClose();
                      setSelectedMedia(null);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square rounded-lg bg-slate-900 mb-2 overflow-hidden flex items-center justify-center relative">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeColor.split(' ')[1])}>
                            <TypeIcon className={cn("h-6 w-6", typeColor.split(' ')[0])} />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                              <Check className="h-5 w-5 text-black" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{media.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge className={cn("text-xs border-0", typeColor.split(' ')[1], typeColor.split(' ')[0])}>
                          {media.type}
                        </Badge>
                        <span className="text-slate-400 text-xs">{formatFileSize(media.size)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {mediaList.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No media found</p>
                  <p className="text-sm">Upload files to the Media Library first</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedMedia}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {selectedMedia ? 'Select File' : 'Select a File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
