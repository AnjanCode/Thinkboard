// Mock database for demonstration purposes
// In a real application, this would be replaced with MongoDB

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

interface Medicine {
  _id: string;
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

interface Bill {
  _id: string;
  billNumber: string;
  patientName: string;
  patientPhone?: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  status: 'pending' | 'paid' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  private users: User[] = [];
  private medicines: Medicine[] = [];
  private bills: Bill[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample medicines
    this.medicines = [
      {
        _id: '1',
        name: 'Paracetamol 500mg',
        description: 'Pain reliever and fever reducer',
        category: 'Analgesic',
        price: 0.50,
        stock: 150,
        minStock: 20,
        manufacturer: 'PharmaCorp',
        expiryDate: new Date('2025-12-31'),
        batchNumber: 'PC001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '2',
        name: 'Amoxicillin 250mg',
        description: 'Antibiotic for bacterial infections',
        category: 'Antibiotic',
        price: 2.50,
        stock: 5, // Low stock example
        minStock: 10,
        manufacturer: 'MedLabs',
        expiryDate: new Date('2025-08-15'),
        batchNumber: 'ML002',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '3',
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory pain reliever',
        category: 'NSAID',
        price: 1.25,
        stock: 80,
        minStock: 15,
        manufacturer: 'HealthCorp',
        expiryDate: new Date('2026-03-20'),
        batchNumber: 'HC003',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // User operations
  async findUser(query: Partial<User>): Promise<User | null> {
    return this.users.find(user => 
      Object.entries(query).every(([key, value]) => 
        user[key as keyof User] === value
      )
    ) || null;
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Medicine operations
  async findMedicines(query: any = {}, options: any = {}): Promise<Medicine[]> {
    let filtered = this.medicines.filter(medicine => {
      if (query.isActive !== undefined && medicine.isActive !== query.isActive) {
        return false;
      }
      if (query.category && !medicine.category.toLowerCase().includes(query.category.toLowerCase())) {
        return false;
      }
      if (query.$text && query.$text.$search) {
        const searchTerm = query.$text.$search.toLowerCase();
        return medicine.name.toLowerCase().includes(searchTerm) || 
               medicine.description.toLowerCase().includes(searchTerm);
      }
      return true;
    });

    // Apply pagination
    if (options.skip) {
      filtered = filtered.slice(options.skip);
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async findMedicineById(id: string): Promise<Medicine | null> {
    return this.medicines.find(medicine => medicine._id === id) || null;
  }

  async countMedicines(query: any = {}): Promise<number> {
    return this.medicines.filter(medicine => {
      if (query.isActive !== undefined && medicine.isActive !== query.isActive) {
        return false;
      }
      return true;
    }).length;
  }

  async countLowStockMedicines(): Promise<number> {
    return this.medicines.filter(medicine => 
      medicine.isActive && medicine.stock <= medicine.minStock
    ).length;
  }

  async createMedicine(medicineData: Omit<Medicine, '_id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const medicine: Medicine = {
      ...medicineData,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medicines.push(medicine);
    return medicine;
  }

  async updateMedicine(id: string, updateData: Partial<Medicine>): Promise<Medicine | null> {
    const index = this.medicines.findIndex(medicine => medicine._id === id);
    if (index === -1) return null;

    this.medicines[index] = {
      ...this.medicines[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return this.medicines[index];
  }

  // Bill operations
  async findBills(query: any = {}, options: any = {}): Promise<Bill[]> {
    let filtered = [...this.bills];

    if (query.status) {
      filtered = filtered.filter(bill => bill.status === query.status);
    }
    if (query.createdAt) {
      filtered = filtered.filter(bill => {
        const billDate = bill.createdAt;
        if (query.createdAt.$gte && billDate < query.createdAt.$gte) return false;
        if (query.createdAt.$lte && billDate > query.createdAt.$lte) return false;
        return true;
      });
    }

    // Apply sorting and pagination
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (options.skip) {
      filtered = filtered.slice(options.skip);
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async countBills(query: any = {}): Promise<number> {
    return this.bills.filter(bill => {
      if (query.status && bill.status !== query.status) return false;
      return true;
    }).length;
  }

  async createBill(billData: Omit<Bill, '_id' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
    const bill: Bill = {
      ...billData,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bills.push(bill);
    return bill;
  }

  // Dashboard aggregations
  async getDashboardStats(): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaysBills = this.bills.filter(bill => 
      bill.createdAt >= startOfDay && bill.status === 'paid'
    );
    const monthlyBills = this.bills.filter(bill => 
      bill.createdAt >= startOfMonth && bill.status === 'paid'
    );

    return {
      totalMedicines: this.medicines.filter(m => m.isActive).length,
      lowStockMedicines: this.medicines.filter(m => m.isActive && m.stock <= m.minStock).length,
      todaysSales: {
        totalSales: todaysBills.reduce((sum, bill) => sum + bill.total, 0),
        totalBills: todaysBills.length,
      },
      monthlySales: {
        totalSales: monthlyBills.reduce((sum, bill) => sum + bill.total, 0),
        totalBills: monthlyBills.length,
      },
    };
  }

  async getRecentBills(limit: number = 5): Promise<any[]> {
    return this.bills
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(bill => ({
        ...bill,
        createdBy: { name: 'System User' }, // Mock populated field
      }));
  }

  async getTopSellingMedicines(limit: number = 5): Promise<any[]> {
    const salesByMedicine = new Map();
    
    this.bills.filter(bill => bill.status === 'paid').forEach(bill => {
      bill.items.forEach(item => {
        const existing = salesByMedicine.get(item.medicineId) || {
          _id: item.medicineId,
          medicineName: item.medicineName,
          totalQuantity: 0,
          totalRevenue: 0,
        };
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.totalPrice;
        salesByMedicine.set(item.medicineId, existing);
      });
    });

    return Array.from(salesByMedicine.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }
}

export const mockDb = new MockDatabase();