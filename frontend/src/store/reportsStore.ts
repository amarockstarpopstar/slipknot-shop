import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  downloadDatabaseBackup,
  downloadSalesExcel,
  fetchDailySales,
  restoreDatabaseFromScript,
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
  const backupDownloading = ref(false);
  const backupError = ref<string | null>(null);
  const restoring = ref(false);
  const restoreError = ref<string | null>(null);

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

  const downloadBackup = async (): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      backupDownloading.value = true;
      const response = await downloadDatabaseBackup();
      backupError.value = null;
      const filename =
        parseContentDisposition(response.headers['content-disposition']) ||
        `database-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      return { blob: response.data, filename };
    } catch (err) {
      backupError.value = extractErrorMessage(err);
      return null;
    } finally {
      backupDownloading.value = false;
    }
  };

  const restoreDatabase = async (): Promise<string | null> => {
    try {
      restoring.value = true;
      const response = await restoreDatabaseFromScript();
      restoreError.value = null;
      return response.data?.message ?? 'База данных успешно восстановлена.';
    } catch (err) {
      restoreError.value = extractErrorMessage(err);
      return null;
    } finally {
      restoring.value = false;
    }
  };

  const resetDownloadError = () => {
    downloadError.value = null;
  };

  const resetBackupError = () => {
    backupError.value = null;
  };

  const resetRestoreError = () => {
    restoreError.value = null;
  };

  return {
    dailySales,
    loading,
    error,
    downloading,
    downloadError,
    backupDownloading,
    backupError,
    restoring,
    restoreError,
    totalItems,
    totalAmount,
    loadDailySales,
    downloadExcel,
    downloadBackup,
    restoreDatabase,
    resetDownloadError,
    resetBackupError,
    resetRestoreError,
  };
});
