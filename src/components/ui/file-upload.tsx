'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, X, File, Image, Video, Music, FileText, Loader2, 
  CheckCircle2, AlertCircle, Trash2, ExternalLink 
} from 'lucide-react';

interface FileUploadProps {
  type: 'images' | 'audio' | 'video' | 'documents';
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  placeholder?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

export function FileUpload({ 
  type, 
  value, 
  onChange, 
  accept,
  label = 'Upload File',
  placeholder = 'Click to upload or drag and drop'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptType = () => {
    if (accept) return accept;
    switch (type) {
      case 'images':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      case 'video':
        return 'video/*';
      case 'documents':
        return '.pdf,.doc,.docx';
      default:
        return '*/*';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'images':
        return <Image className="h-8 w-8" />;
      case 'audio':
        return <Music className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'documents':
        return <FileText className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, [type]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const loadExistingFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch(`/api/files?type=${type}`);
      const data = await res.json();
      setExistingFiles(data);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDeleteFile = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/files?type=${type}&fileName=${fileName}`, {
        method: 'DELETE',
      });
      setExistingFiles(prev => prev.filter(f => f.name !== fileName));
      if (value?.includes(fileName)) {
        onChange('');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleGalleryClick = () => {
    setShowGallery(true);
    loadExistingFiles();
  };

  const getFileName = () => {
    if (!value) return null;
    return value.split('/').pop();
  };

  return (
    <div className="space-y-2">
      {/* Current File Preview */}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{getFileName()}</p>
            <p className="text-xs text-slate-400">{value}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(value, '_blank')}
            className="text-slate-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-600'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptType()}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
            <p className="text-slate-300">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-slate-400 mb-2">{getIcon()}</div>
            <p className="text-white font-medium mb-1">{label}</p>
            <p className="text-sm text-slate-400">{placeholder}</p>
            <p className="text-xs text-slate-500 mt-2">
              Max file size: 50MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Gallery Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGalleryClick}
        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        <Image className="h-4 w-4 mr-2" />
        Select from uploaded files
      </Button>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">Select File</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGallery(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardContent className="p-4">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : existingFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Image className="h-12 w-12 mb-4 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {existingFiles.map((file) => (
                      <div
                        key={file.name}
                        className={`
                          relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                          ${value === file.url 
                            ? 'border-amber-500 ring-2 ring-amber-500/30' 
                            : 'border-slate-700 hover:border-slate-600'
                          }
                        `}
                        onClick={() => {
                          onChange(file.url);
                          setShowGallery(false);
                        }}
                      >
                        {type === 'images' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-slate-800 flex items-center justify-center">
                            {getIcon()}
                          </div>
                        )}
                        <div className="p-2 bg-slate-900/90">
                          <p className="text-xs text-white truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                        
                        {/* Selected indicator */}
                        {value === file.url && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-black">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          </div>
                        )}
                        
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteFile(file.name, e)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
