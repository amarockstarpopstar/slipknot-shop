<template>
  <div class="reports-page layout-container py-4">
    <header class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h3 mb-2">Отчётность по продажам</h1>
        <p class="text-muted mb-0">График продаж и выгрузка Excel для анализа</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="loading"
          @click="refreshData"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Обновить данные
        </button>
        <button type="button" class="btn btn-primary" :disabled="downloading" @click="handleDownload">
          <span v-if="downloading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Выгрузить в Excel
        </button>
        <button
          v-if="isAdmin"
          type="button"
          class="btn btn-outline-warning"
          :disabled="backupDownloading"
          @click="handleBackupDownload"
        >
          <span
            v-if="backupDownloading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Создать бэкап БД
        </button>
        <button
          v-if="isAdmin"
          type="button"
          class="btn btn-outline-danger"
          :disabled="restoring"
          @click="handleRestore"
        >
          <span
            v-if="restoring"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Сбросить БД
        </button>
      </div>
    </header>

    <section v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </section>

    <section v-if="downloadError" class="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
      <span>{{ downloadError }}</span>
      <button type="button" class="btn-close" aria-label="Закрыть" @click="resetDownload"></button>
    </section>

    <section
      v-if="backupError"
      class="alert alert-warning d-flex justify-content-between align-items-center"
      role="alert"
    >
      <span>{{ backupError }}</span>
      <button type="button" class="btn-close" aria-label="Закрыть" @click="resetBackup"></button>
    </section>

    <section
      v-if="restoreError"
      class="alert alert-warning d-flex justify-content-between align-items-center"
      role="alert"
    >
      <span>{{ restoreError }}</span>
      <button type="button" class="btn-close" aria-label="Закрыть" @click="resetRestore"></button>
    </section>

    <section v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </section>

    <section v-if="loading" class="text-center py-5">
      <div class="spinner-border text-light" role="status"></div>
      <p class="mt-3 mb-0">Загружаем данные продаж...</p>
    </section>

    <section v-else class="row g-4">
      <div class="col-12 col-xl-8">
        <div class="card chart-card h-100">
          <div class="card-body">
            <h2 class="h5 card-title">Продажи по дням</h2>
            <p class="text-muted small">Сумма заказов и количество товаров, оформленных в выбранный день.</p>
            <div v-if="hasData" class="chart-wrapper">
              <ApexChart
                type="line"
                height="360"
                :options="chartOptions"
                :series="chartSeries"
                aria-label="График продаж"
                role="img"
              />
            </div>
            <p v-else class="text-muted text-center mt-3 mb-0">
              Данных о продажах пока нет. Попробуйте оформить несколько заказов.
            </p>
          </div>
        </div>
      </div>
      <div class="col-12 col-xl-4">
        <div class="card bg-dark border-secondary h-100">
          <div class="card-body d-flex flex-column gap-3">
            <h2 class="h5 card-title mb-0">Ключевые показатели</h2>
            <div class="stat-card">
              <span class="stat-label">Всего товаров</span>
              <span class="stat-value">{{ totalItems }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Сумма продаж</span>
              <span class="stat-value">{{ formattedAmount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Средний чек</span>
              <span class="stat-value">{{ averageOrderValue }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useReportsStore } from '../store/reportsStore';
import { useAuthStore } from '../store/authStore';

const reportsStore = useReportsStore();
const {
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
} = storeToRefs(reportsStore);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const isAdmin = computed(() => user.value?.role?.name === 'Администратор');

const successMessage = ref<string | null>(null);

const hasData = computed(() => dailySales.value.length > 0);

const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const chartDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
});

const tooltipDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const formattedAmount = computed(() => currencyFormatter.format(totalAmount.value));

const averageOrderValue = computed(() => {
  if (!dailySales.value.length) {
    return '—';
  }
  const average = totalAmount.value / dailySales.value.length;
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(average);
});

const chartSeries = computed(() => {
  if (!hasData.value) {
    return [];
  }

  return [
    {
      name: 'Сумма продаж, ₽',
      type: 'column',
      data: dailySales.value.map((point) => point.totalAmount),
    },
    {
      name: 'Количество товаров',
      type: 'line',
      data: dailySales.value.map((point) => point.totalItems),
    },
  ];
});

const chartOptions = computed(() => {
  const categories = dailySales.value.map((point) => {
    const date = new Date(`${point.saleDate}T00:00:00`);
    return chartDateFormatter.format(date);
  });

  return {
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      foreColor: '#ffffff',
    },
    theme: {
      mode: 'dark',
    },
    colors: ['#ef4444', '#fbbf24'],
    stroke: {
      width: [0, 3],
      curve: 'smooth',
      lineCap: 'round',
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#111827',
      colors: ['#fef3c7'],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      labels: { colors: '#ffffff' },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 12,
      },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      strokeDashArray: 4,
      position: 'back',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: {
        left: 16,
        right: 16,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '42%',
        borderRadius: 12,
        borderRadiusApplication: 'end',
      },
    },
    fill: {
      type: ['solid', 'solid'],
      opacity: [0.9, 1],
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: Array.from({ length: categories.length }, () => 'rgba(255, 255, 255, 0.72)'),
          fontWeight: 500,
        },
        offsetY: 4,
      },
      axisBorder: {
        color: 'rgba(255, 255, 255, 0.08)',
        height: 1,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        seriesName: 'Сумма продаж, ₽',
        labels: {
          formatter: (value: number) => currencyFormatter.format(value),
          style: { color: '#ffffff', fontWeight: 500 },
        },
        title: {
          text: 'Сумма продаж, ₽',
          style: { color: '#ffffff', fontWeight: 600 },
        },
        axisTicks: {
          show: false,
        },
      },
      {
        opposite: true,
        seriesName: 'Количество товаров',
        labels: {
          formatter: (value: number) => `${Math.round(value)}`,
          style: { color: '#ffffff', fontWeight: 500 },
        },
        title: {
          text: 'Количество товаров',
          style: { color: '#ffffff', fontWeight: 600 },
        },
        axisTicks: {
          show: false,
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      x: {
        formatter: (_value: string, opts: { dataPointIndex: number }) => {
          const point = dailySales.value[opts.dataPointIndex];
          if (!point) {
            return '';
          }
          const date = new Date(`${point.saleDate}T00:00:00`);
          return tooltipDateFormatter.format(date);
        },
      },
      y: {
        formatter: (value: number, opts: { seriesIndex: number }) =>
          opts.seriesIndex === 0 ? currencyFormatter.format(value) : `${Math.round(value)} шт.`,
      },
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.35,
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            offsetY: 8,
          },
        },
      },
    ],
  };
});

const refreshData = async () => {
  await reportsStore.loadDailySales();
};

const handleDownload = async () => {
  const result = await reportsStore.downloadExcel();
  if (!result) {
    return;
  }

  const blobUrl = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = result.filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
  successMessage.value = `Отчёт ${result.filename} сформирован и сохранён.`;
  setTimeout(() => {
    successMessage.value = null;
  }, 7000);
};

const resetDownload = () => {
  reportsStore.resetDownloadError();
};

const handleBackupDownload = async () => {
  const result = await reportsStore.downloadBackup();
  if (!result) {
    return;
  }

  const blobUrl = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = result.filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
  successMessage.value = `Резервная копия ${result.filename} создана и загружена.`;
  setTimeout(() => {
    successMessage.value = null;
  }, 7000);
};

const resetBackup = () => {
  reportsStore.resetBackupError();
};

const handleRestore = async () => {
  const confirmed = window.confirm(
    'Сброс базы данных восстановит состояние из restore.sql и удалит текущие данные. Продолжить?',
  );
  if (!confirmed) {
    return;
  }

  const message = await reportsStore.restoreDatabase();
  if (!message) {
    return;
  }

  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = null;
  }, 7000);
};

const resetRestore = () => {
  reportsStore.resetRestoreError();
};

onMounted(async () => {
  await reportsStore.loadDailySales();
});
</script>

<style scoped>
.reports-page {
  min-height: 100%;
}

.chart-card {
  background: linear-gradient(160deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.88) 60%, rgba(17, 24, 39, 0.95) 100%);
  border: 1px solid rgba(248, 113, 113, 0.35);
  box-shadow: 0 16px 32px -24px rgba(15, 23, 42, 0.65);
}

.chart-wrapper {
  min-height: 320px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

@media (max-width: 767.98px) {
  .chart-card {
    box-shadow: 0 12px 28px -20px rgba(15, 23, 42, 0.7);
  }
}
</style>
