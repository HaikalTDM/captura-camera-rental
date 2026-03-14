export interface CameraVariant {
  id: string;
  name: string;
  dailyRate: number;
  discountRate: number;
}

export interface Camera {
  id: string;
  name: string;
  description: string;
  image: string;
  images?: string[]; // Additional gallery images
  dailyRate: number;
  discountRate: number; // Rate for extended rentals
  discountThreshold?: number; // Days needed for discount (default: 3)
  features: string[];
  specifications: {
    [key: string]: string;
  };
  tidyCalPath?: string; // TidyCal booking path
  display_order?: number;
  variants?: CameraVariant[];
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
}

export interface BookingDetails {
  camera: Camera;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalCost: number;
  dailyRate: number;
  customerDetails?: CustomerDetails;
}

export interface BookingModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (booking: BookingDetails) => void;
}
