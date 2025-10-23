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

export const downloadDatabaseBackup = async (): Promise<AxiosResponse<Blob>> => {
  return http.post('/reports/database/backup', undefined, {
    responseType: 'blob',
  });
};

export interface RestoreDatabaseResponse {
  message: string;
}

export const restoreDatabaseFromScript = async (): Promise<
  AxiosResponse<RestoreDatabaseResponse>
> => {
  return http.post('/reports/database/restore');
};
