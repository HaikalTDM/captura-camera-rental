// Mock data for admin dashboard - will be replaced with real database later

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  cameraId: string;
  cameraName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid' | 'overdue';
  pickupTime: string;
  returnTime: string;
  notes: string;
  createdAt: string;
}

export interface Camera {
  id: string;
  name: string;
  model: string;
  dailyRate: number;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  condition: 'excellent' | 'good' | 'fair';
  lastMaintenance: string;
  totalRentals: number;
  currentRenter?: string;
  returnDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRentals: number;
  totalSpent: number;
  lastRental: string;
  reliability: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

// Mock Bookings Data
export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    customerName: 'Ahmad Rahman',
    customerPhone: '+60123456789',
    customerEmail: 'ahmad@email.com',
    cameraId: 'CAM001',
    cameraName: 'DJI Osmo Pocket 3 Creator Combo',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    totalDays: 3,
    dailyRate: 45,
    totalAmount: 135,
    depositPaid: 50,
    balanceDue: 85,
    status: 'active',
    paymentStatus: 'deposit_paid',
    pickupTime: '10:00 AM',
    returnTime: '6:00 PM',
    notes: 'Wedding shoot in KL',
    createdAt: '2024-01-18'
  },
  {
    id: 'BK002',
    customerName: 'Sarah Lim',
    customerPhone: '+60198765432',
    customerEmail: 'sarah.lim@email.com',
    cameraId: 'CAM002',
    cameraName: 'DJI Action 5 Pro Adventure Combo',
    startDate: '2024-01-21',
    endDate: '2024-01-21',
    totalDays: 1,
    dailyRate: 50,
    totalAmount: 50,
    depositPaid: 50,
    balanceDue: 0,
    status: 'confirmed',
    paymentStatus: 'fully_paid',
    pickupTime: '9:00 AM',
    returnTime: '7:00 PM',
    notes: 'Hiking trip to Genting',
    createdAt: '2024-01-19'
  },
  {
    id: 'BK003',
    customerName: 'David Tan',
    customerPhone: '+60187654321',
    customerEmail: 'david.tan@email.com',
    cameraId: 'CAM001',
    cameraName: 'DJI Osmo Pocket 3 Creator Combo',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    totalDays: 3,
    dailyRate: 45,
    totalAmount: 135,
    depositPaid: 0,
    balanceDue: 135,
    status: 'pending',
    paymentStatus: 'pending',
    pickupTime: '2:00 PM',
    returnTime: '5:00 PM',
    notes: 'Corporate event filming',
    createdAt: '2024-01-20'
  },
  {
    id: 'BK004',
    customerName: 'Priya Sharma',
    customerPhone: '+60176543210',
    customerEmail: 'priya@email.com',
    cameraId: 'CAM002',
    cameraName: 'DJI Action 5 Pro Adventure Combo',
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    totalDays: 3,
    dailyRate: 50,
    totalAmount: 150,
    depositPaid: 50,
    balanceDue: 100,
    status: 'completed',
    paymentStatus: 'overdue',
    pickupTime: '11:00 AM',
    returnTime: '4:00 PM',
    notes: 'Travel vlog content',
    createdAt: '2024-01-12'
  },
  {
    id: 'BK005',
    customerName: 'Michael Wong',
    customerPhone: '+60165432109',
    customerEmail: 'michael.wong@email.com',
    cameraId: 'CAM001',
    cameraName: 'DJI Osmo Pocket 3 Creator Combo',
    startDate: '2024-01-23',
    endDate: '2024-01-24',
    totalDays: 2,
    dailyRate: 45,
    totalAmount: 90,
    depositPaid: 50,
    balanceDue: 40,
    status: 'confirmed',
    paymentStatus: 'deposit_paid',
    pickupTime: '1:00 PM',
    returnTime: '6:00 PM',
    notes: 'Product photography',
    createdAt: '2024-01-21'
  }
];

// Mock Cameras Data
export const mockCameras: Camera[] = [
  {
    id: 'CAM001',
    name: 'DJI Osmo Pocket 3 Creator Combo',
    model: 'Osmo Pocket 3',
    dailyRate: 45,
    status: 'rented',
    condition: 'excellent',
    lastMaintenance: '2024-01-10',
    totalRentals: 28,
    currentRenter: 'Ahmad Rahman',
    returnDate: '2024-01-22'
  },
  {
    id: 'CAM002',
    name: 'DJI Action 5 Pro Adventure Combo',
    model: 'Action 5 Pro',
    dailyRate: 50,
    status: 'available',
    condition: 'excellent',
    lastMaintenance: '2024-01-08',
    totalRentals: 22,
  }
];

// Mock Customers Data
export const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'Ahmad Rahman',
    phone: '+60123456789',
    email: 'ahmad@email.com',
    totalRentals: 3,
    totalSpent: 405,
    lastRental: '2024-01-20',
    reliability: 'excellent',
    notes: 'Regular customer, always returns on time'
  },
  {
    id: 'CUST002',
    name: 'Sarah Lim',
    phone: '+60198765432',
    email: 'sarah.lim@email.com',
    totalRentals: 1,
    totalSpent: 50,
    lastRental: '2024-01-21',
    reliability: 'good',
    notes: 'New customer, paid in full upfront'
  },
  {
    id: 'CUST003',
    name: 'David Tan',
    phone: '+60187654321',
    email: 'david.tan@email.com',
    totalRentals: 2,
    totalSpent: 270,
    lastRental: '2024-01-25',
    reliability: 'good',
    notes: 'Corporate client, usually books in advance'
  },
  {
    id: 'CUST004',
    name: 'Priya Sharma',
    phone: '+60176543210',
    email: 'priya@email.com',
    totalRentals: 1,
    totalSpent: 150,
    lastRental: '2024-01-15',
    reliability: 'fair',
    notes: 'Payment overdue, follow up needed'
  },
  {
    id: 'CUST005',
    name: 'Michael Wong',
    phone: '+60165432109',
    email: 'michael.wong@email.com',
    totalRentals: 1,
    totalSpent: 90,
    lastRental: '2024-01-23',
    reliability: 'good',
    notes: 'Professional photographer, handles equipment well'
  }
];

// Dashboard Stats
export const getDashboardStats = () => {
  const today = '2024-01-21'; // Fixed date for demo consistency

  const activeRentals = mockBookings.filter(b => b.status === 'active').length;
  const todayPickups = mockBookings.filter(b => b.startDate === today && b.status === 'confirmed').length;
  const todayReturns = mockBookings.filter(b => b.endDate === today && b.status === 'active').length;
  const pendingPayments = mockBookings.filter(b => b.paymentStatus === 'overdue' || b.balanceDue > 0).length;

  const totalRevenue = mockBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthlyRevenue = mockBookings
    .filter(b => b.status === 'completed' && b.endDate.startsWith('2024-01'))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    activeRentals,
    todayPickups,
    todayReturns,
    pendingPayments,
    totalRevenue,
    monthlyRevenue,
    availableCameras: mockCameras.filter(c => c.status === 'available').length,
    totalCustomers: mockCustomers.length
  };
};
