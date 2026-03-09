import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { withAuth, withAdmin, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// Allowed MIME types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.php', '.phtml', '.jsp', '.asp', '.aspx',
  '.cgi', '.pl', '.py', '.rb', '.dll', '.so', '.dylib', '.js', '.ts', '.html'
];

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.substring(lastDot).toLowerCase() : '';
}

function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
  const parts = sanitized.split('.');
  const name = parts.slice(0, -1).join('').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '') : '';
  return name + ext;
}

// GET - List all media (authenticated)
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const folder = searchParams.get('folder');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublic: true };
    
    // Admins can see all media
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';
    if (isAdminUser) {
      delete where.isPublic;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { originalName: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    
    if (folder) {
      where.folder = folder;
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
});

// POST - Upload new media (admin only)
export const POST = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const folder = formData.get('folder') as string;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check for dangerous extensions
    const ext = getFileExtension(file.name);
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Determine file type
    const mimeType = file.type;
    let type = 'document';
    if (mimeType.startsWith('image/')) type = 'image';
    else if (mimeType.startsWith('video/')) type = 'video';
    else if (mimeType.startsWith('audio/')) type = 'audio';

    // Validate MIME type
    const allowedMimes = ALLOWED_TYPES[type];
    if (allowedMimes && !allowedMimes.includes(mimeType)) {
      return NextResponse.json({ error: `Invalid file type for ${type}` }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate secure filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const sanitized = sanitizeFilename(file.name);
    const fileName = `${timestamp}-${randomString}-${sanitized}`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure path is within upload directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Public URL
    const publicUrl = `/uploads/${type}/${fileName}`;

    // Create media record
    const media = await db.media.create({
      data: {
        name: name ? sanitizeInput(name) : sanitizeInput(file.name),
        originalName: file.name,
        url: publicUrl,
        type,
        mimeType,
        size: file.size,
        description: description ? sanitizeInput(description) : null,
        tags: tags ? sanitizeInput(tags) : null,
        folder: folder ? sanitizeInput(folder) : null,
        alt: alt ? sanitizeInput(alt) : null,
        uploadedBy: auth.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
});
