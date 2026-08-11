import axiosClient from '@/api/axiosClient';

import type { Address, CreateAddressRequest, Profile } from './types';

export async function getProfile() {
  return axiosClient.get<Profile>('/auth/me');
}

export async function createAddress(payload: CreateAddressRequest) {
  return axiosClient.post<Address, CreateAddressRequest>('/addresses', payload);
}
