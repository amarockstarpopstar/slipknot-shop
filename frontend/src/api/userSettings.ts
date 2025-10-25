import { http } from './http';

export type ThemeVariant = 'light' | 'dark';

export interface UserSettingsPayload {
  theme?: ThemeVariant;
  dateFormat?: string;
  numberFormat?: string;
  itemsPerPage?: number;
  savedFilters?: Record<string, unknown>;
}

export interface UserSettingsResponse {
  theme: ThemeVariant;
  dateFormat: string;
  numberFormat: string;
  itemsPerPage: number;
  savedFilters: Record<string, unknown>;
}

export const fetchUserSettings = async (): Promise<UserSettingsResponse> => {
  const { data } = await http.get<UserSettingsResponse>('/user-settings/me');
  return data;
};

export const updateUserSettings = async (
  payload: UserSettingsPayload,
): Promise<UserSettingsResponse> => {
  const { data } = await http.put<UserSettingsResponse>('/user-settings/me', payload);
  return data;
};
