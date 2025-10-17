import type { AxiosResponse } from 'axios';
import { http } from './http';

export interface DailySalesPointDto {
  saleDate: string;
  totalItems: number;
  totalAmount: number;
}

export const fetchDailySales = async (): Promise<DailySalesPointDto[]> => {
  const { data } = await http.get<DailySalesPointDto[]>('/reports/sales/daily');
  return data;
};

export const downloadSalesExcel = async (): Promise<AxiosResponse<Blob>> => {
  return http.get('/reports/sales/excel', {
    responseType: 'blob',
  });
};
