import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Medicine from '@/models/Medicine';
import { verifyToken, generateBillNumber } from '@/lib/auth';

// GET all bills
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filter query
    let filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const bills = await Bill.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments(filter);

    return NextResponse.json({
      bills,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });

  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new bill
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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

    const { patientName, patientPhone, items, discount, paymentMethod } = await request.json();

    // Validate required fields
    if (!patientName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Patient name and items are required' },
        { status: 400 }
      );
    }

    // Validate and process items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return NextResponse.json(
          { error: `Medicine with ID ${item.medicineId} not found` },
          { status: 400 }
        );
      }

      if (medicine.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}` },
          { status: 400 }
        );
      }

      const totalPrice = medicine.price * item.quantity;
      subtotal += totalPrice;

      processedItems.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.price,
        totalPrice,
      });

      // Update medicine stock
      await Medicine.findByIdAndUpdate(
        medicine._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Calculate tax and total
    const taxRate = 0.1; // 10% tax
    const taxAmount = subtotal * taxRate;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    // Create bill
    const bill = await Bill.create({
      billNumber: generateBillNumber(),
      patientName,
      patientPhone,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      discount: discountAmount,
      total,
      paymentMethod: paymentMethod || 'cash',
      createdBy: decoded.userId,
    });

    const populatedBill = await Bill.findById(bill._id).populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Bill created successfully',
      bill: populatedBill,
    }, { status: 201 });

  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}