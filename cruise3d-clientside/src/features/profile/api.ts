import axiosClient from '@/api/axiosClient';

import type { Address, CreateAddressRequest, Profile } from './types';

export async function getProfile() {
  return axiosClient.get<Profile>('/auth/me');
}

export async function createAddress(payload: CreateAddressRequest) {
  return axiosClient.post<Address, CreateAddressRequest>('/addresses', payload);
}

export async function getAddresses() {
  return axiosClient.get<Address[]>('/addresses');
}

export async function updateAddress(id: string, payload: CreateAddressRequest) {
  return axiosClient.put<Address, CreateAddressRequest>(`/addresses/${id}`, payload);
}

export async function setDefaultAddress(id: string) {
  return axiosClient.put<Address>(`/addresses/${id}/default`);
}

export async function deleteAddress(id: string) {
  return axiosClient.delete(`/addresses/${id}`);
}
