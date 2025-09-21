import mongoose from 'mongoose';

export interface IMedicine extends mongoose.Document {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  manufacturer: string;
  expiryDate: Date;
  batchNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 10,
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient searching
MedicineSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Medicine || mongoose.model<IMedicine>('Medicine', MedicineSchema);