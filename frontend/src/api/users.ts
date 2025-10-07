import { http } from './http';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: {
    id: number;
    name: string;
  } | null;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await http.get<UserProfile>('/users/me');
  return data;
};
