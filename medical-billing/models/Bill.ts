import mongoose from 'mongoose';

interface IBillItem {
  medicineId: mongoose.Types.ObjectId;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IBill extends mongoose.Document {
  billNumber: string;
  patientName: string;
  patientPhone?: string;
  items: IBillItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  status: 'pending' | 'paid' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative'],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'],
  },
});

const BillSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  patientPhone: {
    type: String,
    trim: true,
  },
  items: [BillItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  taxRate: {
    type: Number,
    default: 0.1, // 10% tax
    min: [0, 'Tax rate cannot be negative'],
  },
  taxAmount: {
    type: Number,
    required: true,
    min: [0, 'Tax amount cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance'],
    default: 'cash',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);