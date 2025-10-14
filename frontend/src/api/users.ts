import { http } from './http';

export interface UserRole {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  role: UserRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem extends UserProfile {}

export interface UpdateUserPayload {
  name: string;
  email: string;
  phone: string;
  roleName: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleName?: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  country?: string | null;
  city?: string | null;
  address?: string | null;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await http.get<UserProfile>('/users/me');
  return data;
};

export const fetchUsers = async (): Promise<UserListItem[]> => {
  const { data } = await http.get<UserListItem[]>('/users');
  return data;
};

export const fetchRoles = async (): Promise<UserRole[]> => {
  const { data } = await http.get<UserRole[]>('/users/roles');
  return data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<UserListItem> => {
  const { data } = await http.put<UserListItem>(`/users/${id}`, payload);
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<UserListItem> => {
  const { data } = await http.post<UserListItem>('/users', payload);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await http.delete(`/users/${id}`);
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  const { data } = await http.put<UserProfile>('/users/me', payload);
  return data;
};
