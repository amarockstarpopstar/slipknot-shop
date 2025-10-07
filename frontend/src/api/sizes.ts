import { http } from './http';

export interface SizeDto {
  id: number;
  name: string;
}

export const fetchSizes = async (): Promise<SizeDto[]> => {
  const { data } = await http.get<SizeDto[]>('/sizes');
  return data;
};
