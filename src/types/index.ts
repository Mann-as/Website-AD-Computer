export type Role = 'CUSTOMER' | 'ADMIN';

export type ServiceCategory =
  | 'COMPUTER_REPAIR'
  | 'SOFTWARE'
  | 'NETWORKING'
  | 'MAINTENANCE'
  | 'IT_SUPPORT'
  | 'OTHER';

export type ServiceType = 'ONSITE' | 'DROP_OFF' | 'REMOTE';

export type RequestStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAID';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CustomerProfileData {
  id: string;
  userId: string;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TechnicianData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialization?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  _count?: { assignedRequests: number };
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  price: number;
  estimatedDuration: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ServiceRequestItem {
  id: string;
  ticketNumber: string;
  customerId: string;
  customer?: UserSafe;
  technicianId?: string | null;
  technician?: TechnicianData | null;
  serviceId?: string | null;
  service?: ServiceItem | null;
  problemDescription: string;
  attachment?: string | null;
  serviceType: ServiceType;
  preferredDate?: string | Date | null;
  preferredTime?: string | null;
  status: RequestStatus;
  estimatedCost: number;
  finalCost: number;
  adminNotes?: string | null;
  technicianNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
