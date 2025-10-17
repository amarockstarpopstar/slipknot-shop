import { http } from './http';

export interface DailySalesPointDto {
  saleDate: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
}

export const fetchDailySales = async (): Promise<DailySalesPointDto[]> => {
  const { data } = await http.get<DailySalesPointDto[]>('/reports/sales/daily');
  return data;
};

export const downloadSalesReport = async (): Promise<Blob> => {
  const { data } = await http.get<Blob>('/reports/sales/export', {
    responseType: 'blob',
  });
  return data;
};
