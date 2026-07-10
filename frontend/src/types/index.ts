export type Role = 'CUSTOMER' | 'BANK_EMPLOYEE' | 'COMPLIANCE_OFFICER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  active: boolean;
  roles: Role[];
}

export interface Address {
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CustomerProfile {
  customerId: number | null;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address | null;
  status: 'PENDING_KYC' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  kycStatus: 'NOT_STARTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  email: string | null;
  roles: Role[];
}

export interface KycSubmission {
  documentType: string;
  documentNumber: string;
}

export interface KycReview {
  status: 'VERIFIED' | 'REJECTED';
  notes: string;
}
