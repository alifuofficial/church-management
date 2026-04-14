import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const mediaSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  folder: z.string().optional(),
  alt: z.string().optional(),
});

// Media API - CRUD operations for media library
// GET - List all media with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const folder = searchParams.get('folder');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { originalName: { contains: search } },
        { description: { contains: search } },
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
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PASTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Validate metadata using Zod
    const validatedMetadata = mediaSchema.safeParse({
      name,
      description,
      tags,
      folder,
      alt,
    });

    if (!validatedMetadata.success) {
      return NextResponse.json({ error: 'Invalid metadata', details: validatedMetadata.error.errors }, { status: 400 });
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

    // Create upload directory if it doesn't exist
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', type);
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (err) {
      console.error('Error creating directory:', err);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalExt = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomString}.${originalExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('Error writing file:', err);
      return NextResponse.json({ error: 'Failed to write file to disk' }, { status: 500 });
    }

    // Public URL - use /api/uploads for file serving
    const publicUrl = `/api/uploads/${type}/${fileName}`;

    // Create media record in database
    const media = await db.media.create({
      data: {
        name: validatedMetadata.data.name || file.name,
        originalName: file.name,
        url: publicUrl,
        type,
        mimeType,
        size: Math.round(file.size),
        description: validatedMetadata.data.description || null,
        tags: validatedMetadata.data.tags || null,
        folder: validatedMetadata.data.folder || 'unsorted',
        alt: validatedMetadata.data.alt || null,
      },
    });

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to upload media', 
      details: message 
    }, { status: 500 });
  }
}
