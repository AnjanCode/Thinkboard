import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mockDb';
import { verifyToken } from '@/lib/auth';

// GET all medicines with search and filter functionality
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter query
    let filter: any = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    const skip = (page - 1) * limit;

    const medicines = await mockDb.findMedicines(filter, { skip, limit });
    const total = await mockDb.countMedicines(filter);

    return NextResponse.json({
      medicines,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });

  } catch (error) {
    console.error('Get medicines error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new medicine
export async function POST(request: NextRequest) {
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

    const medicineData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'manufacturer', 'expiryDate', 'batchNumber'];
    for (const field of requiredFields) {
      if (!medicineData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const medicine = await mockDb.createMedicine({
      ...medicineData,
      expiryDate: new Date(medicineData.expiryDate),
      isActive: true,
    });

    return NextResponse.json({
      message: 'Medicine created successfully',
      medicine,
    }, { status: 201 });

  } catch (error) {
    console.error('Create medicine error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}