export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type AddressId = string;

export interface CreateAddressRequest {
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export interface Address {
  id: AddressId;
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface ProfileState {
  profile: Profile | null;
  addresses: Address[];
  isLoading: boolean;
}
