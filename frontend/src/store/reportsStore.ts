import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  downloadSalesExcel,
  fetchDailySales,
  type DailySalesPointDto,
} from '../api/reports';
import { extractErrorMessage } from '../api/http';

const DEFAULT_FILENAME = `sales-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

const parseContentDisposition = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const filenameMatch = value.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (!filenameMatch) {
    return null;
  }

  const encoded = filenameMatch[1] ?? filenameMatch[2];
  if (!encoded) {
    return null;
  }

  try {
    return decodeURIComponent(encoded);
  } catch (error) {
    console.warn('Не удалось декодировать имя файла из Content-Disposition', error);
    return encoded;
  }
};

export const useReportsStore = defineStore('reports', () => {
  const dailySales = ref<DailySalesPointDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const downloading = ref(false);
  const downloadError = ref<string | null>(null);

  const totalItems = computed(() =>
    dailySales.value.reduce((sum, point) => sum + point.totalItems, 0),
  );

  const totalAmount = computed(() =>
    dailySales.value.reduce((sum, point) => sum + point.totalAmount, 0),
  );

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

  const downloadExcel = async (): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      downloading.value = true;
      const response = await downloadSalesExcel();
      downloadError.value = null;
      const filename =
        parseContentDisposition(response.headers['content-disposition']) || DEFAULT_FILENAME;
      return { blob: response.data, filename };
    } catch (err) {
      downloadError.value = extractErrorMessage(err);
      return null;
    } finally {
      downloading.value = false;
    }
  };

  const resetDownloadError = () => {
    downloadError.value = null;
  };

  return {
    dailySales,
    loading,
    error,
    downloading,
    downloadError,
    totalItems,
    totalAmount,
    loadDailySales,
    downloadExcel,
    resetDownloadError,
  };
});
