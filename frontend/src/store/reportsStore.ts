import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  fetchDailySales,
  downloadSalesReport,
  type DailySalesPointDto,
} from '../api/reports';
import { extractErrorMessage } from '../api/http';

export const useReportsStore = defineStore('reports', () => {
  const dailySales = ref<DailySalesPointDto[]>([]);
  const loading = ref(false);
  const exportLoading = ref(false);
  const error = ref<string | null>(null);

  const loadDailySales = async (): Promise<DailySalesPointDto[] | null> => {
    try {
      loading.value = true;
      const data = await fetchDailySales();
      dailySales.value = data;
      error.value = null;
      return data;
    } catch (err) {
      error.value = extractErrorMessage(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const downloadDailySalesReport = async (): Promise<Blob> => {
    try {
      exportLoading.value = true;
      const blob = await downloadSalesReport();
      return blob;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    } finally {
      exportLoading.value = false;
    }
  };

  const hasData = computed(() => dailySales.value.length > 0);
  const totalRevenue = computed(() =>
    dailySales.value.reduce((sum, item) => sum + item.totalAmount, 0),
  );
  const lastSaleDate = computed(() =>
    dailySales.value.length ? dailySales.value[dailySales.value.length - 1].saleDate : null,
  );

  return {
    dailySales,
    loading,
    exportLoading,
    error,
    hasData,
    totalRevenue,
    lastSaleDate,
    loadDailySales,
    downloadDailySalesReport,
  };
});
