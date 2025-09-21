import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get dashboard statistics using mock database
    const [
      overview,
      recentBills,
      topSellingMedicines
    ] = await Promise.all([
      mockDb.getDashboardStats(),
      mockDb.getRecentBills(5),
      mockDb.getTopSellingMedicines(5)
    ]);

    return NextResponse.json({
      overview,
      recentBills,
      topSellingMedicines,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}