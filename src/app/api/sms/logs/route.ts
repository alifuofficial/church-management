import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve SMS logs with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where: {
      status?: string;
      phone?: { contains: string };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (status) where.status = status;
    if (phone) where.phone = { contains: phone };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      db.smsLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { name: true, triggerType: true }
          }
        }
      }),
      db.smsLog.count({ where })
    ]);

    // Calculate statistics
    const stats = await db.smsLog.aggregate({
      where,
      _count: true,
      _sum: { cost: true }
    });

    const statusCounts = await db.smsLog.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: stats._count,
        totalCost: stats._sum.cost || 0,
        byStatus: statusCounts.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS logs' }, { status: 500 });
  }
}

// DELETE - Delete SMS logs (bulk or single)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const beforeDate = searchParams.get('beforeDate');

    if (id) {
      // Delete single log
      await db.smsLog.delete({ where: { id } });
    } else if (beforeDate) {
      // Delete logs before date
      await db.smsLog.deleteMany({
        where: { createdAt: { lt: new Date(beforeDate) } }
      });
    } else {
      return NextResponse.json({ error: 'Either id or beforeDate is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'SMS logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting SMS logs:', error);
    return NextResponse.json({ error: 'Failed to delete SMS logs' }, { status: 500 });
  }
}
