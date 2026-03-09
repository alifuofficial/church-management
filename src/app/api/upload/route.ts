import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { withAuth, AuthContext } from '@/lib/api-auth';

// Allowed MIME types for each category
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Maximum file sizes for each category (in bytes)
const MAX_SIZES: Record<string, number> = {
  image: 10 * 1024 * 1024,     // 10MB
  audio: 50 * 1024 * 1024,     // 50MB
  video: 500 * 1024 * 1024,    // 500MB
  document: 20 * 1024 * 1024,  // 20MB
};

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.php', '.phtml', '.php3', '.php4', '.php5', '.php7',
  '.jsp', '.asp', '.aspx', '.cgi', '.pl', '.py', '.rb', '.dll', '.so', '.dylib',
  '.com', '.scr', '.pif', '.application', '.gadget', '.msi', '.msp', '.cpl',
  '.jar', '.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.svg', '.xhtml',
];

// Dangerous MIME types
const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-dosexec',
  'application/x-msdos-program',
  'application/x-sh',
  'application/x-php',
  'application/x-httpd-php',
  'text/x-php',
  'application/javascript',
  'text/javascript',
  'application/xhtml+xml',
];

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.substring(lastDot).toLowerCase() : '';
}

function isDangerousFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  if (DANGEROUS_MIME_TYPES.includes(mimeType)) {
    return true;
  }
  
  // Double extension attack check (e.g., "file.php.jpg")
  const doubleExt = filename.split('.');
  if (doubleExt.length > 2) {
    for (let i = 1; i < doubleExt.length - 1; i++) {
      const checkExt = '.' + doubleExt[i].toLowerCase();
      if (DANGEROUS_EXTENSIONS.includes(checkExt)) {
        return true;
      }
    }
  }
  
  return false;
}

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  
  // Replace any non-alphanumeric characters except dots and dashes
  const parts = sanitized.split('.');
  const name = parts.slice(0, -1).join('').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '') : '';
  
  return name + ext;
}

// POST - Upload file (requires authentication)
export const POST = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'image';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check for dangerous files FIRST
    if (isDangerousFile(file.name, file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed for security reasons' 
      }, { status: 400 });
    }

    // Determine category and validate
    const category = type === 'images' ? 'image' : type;
    const allowedMimes = ALLOWED_TYPES[category] || ALLOWED_TYPES.image;
    const maxSize = MAX_SIZES[category] || MAX_SIZES.image;

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
      }, { status: 400 });
    }

    // Validate MIME type (STRICT)
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedMimes.join(', ')}` 
      }, { status: 400 });
    }

    // Additional check: Verify file extension matches MIME type
    const ext = getFileExtension(file.name);
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'audio/mpeg': ['.mp3'],
      'audio/mp3': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/m4a': ['.m4a'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/ogg': ['.ogv'],
      'video/quicktime': ['.mov'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    };
    
    const expectedExts = mimeToExt[file.type];
    if (expectedExts && !expectedExts.includes(ext)) {
      return NextResponse.json({ 
        error: 'File extension does not match file content' 
      }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate secure filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const sanitizedOriginal = sanitizeFilename(file.name);
    const fileName = `${timestamp}-${randomString}-${sanitizedOriginal}`;
    
    // Ensure the path is within the intended directory (prevent path traversal)
    const filePath = path.resolve(uploadDir, fileName);
    if (!filePath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${category}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
});
