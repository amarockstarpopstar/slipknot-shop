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
      </div>
    </header>

    <section v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </section>

    <section v-if="downloadError" class="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
      <span>{{ downloadError }}</span>
      <button type="button" class="btn-close" aria-label="Закрыть" @click="resetDownload"></button>
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
              <div class="chart-surface">
                <ApexChart
                  type="line"
                  height="360"
                  :options="chartOptions"
                  :series="chartSeries"
                  aria-label="График продаж"
                  role="img"
                />
              </div>
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

const reportsStore = useReportsStore();
const { dailySales, loading, error, downloading, downloadError, totalItems, totalAmount } =
  storeToRefs(reportsStore);

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
      dropShadow: {
        enabled: true,
        top: 12,
        left: 0,
        blur: 12,
        color: 'rgba(244, 63, 94, 0.45)',
        opacity: 0.65,
      },
    },
    theme: {
      mode: 'dark',
    },
    colors: ['#f43f5e', '#fcd34d'],
    stroke: {
      width: [0, 4],
      curve: 'smooth',
      lineCap: 'round',
    },
    markers: {
      size: 6,
      strokeWidth: 3,
      strokeColors: '#0f172a',
      colors: ['#fef3c7'],
      hover: {
        sizeOffset: 2,
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
      background: { enabled: false },
      style: {
        colors: ['#ffffff'],
        fontWeight: 600,
        fontSize: '13px',
      },
      offsetY: -8,
      formatter: (value: number, opts: { seriesIndex: number }) =>
        opts.seriesIndex === 0 ? currencyFormatter.format(value) : `${Math.round(value)} шт.`,
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
      borderColor: 'rgba(255, 255, 255, 0.12)',
      strokeDashArray: 6,
      position: 'back',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: {
        left: 20,
        right: 20,
      },
      row: {
        colors: ['rgba(255, 255, 255, 0.04)', 'transparent'],
        opacity: 0.4,
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
      type: ['gradient', 'solid'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.75,
        gradientToColors: ['#7f1d1d'],
        opacityFrom: 0.95,
        opacityTo: 0.35,
        stops: [0, 45, 90],
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: Array.from({ length: categories.length }, () => '#ffffff'),
          fontWeight: 500,
        },
        offsetY: 4,
      },
      axisBorder: {
        color: 'rgba(255, 255, 255, 0.1)',
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
          chart: {
            dropShadow: {
              top: 8,
              blur: 10,
            },
          },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            offsetY: 8,
          },
          dataLabels: {
            style: {
              fontSize: '12px',
            },
            offsetY: -4,
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

onMounted(async () => {
  await reportsStore.loadDailySales();
});
</script>

<style scoped>
.reports-page {
  min-height: 100%;
}

.chart-card {
  position: relative;
  background: radial-gradient(120% 120% at 50% 0%, rgba(244, 63, 94, 0.35) 0%, rgba(12, 12, 24, 0.95) 55%, rgba(12, 12, 24, 0.98) 100%);
  border: 1px solid rgba(244, 63, 94, 0.35);
  box-shadow: 0 24px 60px -30px rgba(244, 63, 94, 0.65);
  overflow: hidden;
}

.chart-card::before {
  content: '';
  position: absolute;
  inset: -40% -20% auto -20%;
  height: 220px;
  background: radial-gradient(70% 70% at 50% 50%, rgba(252, 211, 77, 0.28) 0%, transparent 70%);
  opacity: 0.7;
  filter: blur(0.5px);
}

.chart-card .card-body {
  position: relative;
  z-index: 1;
}

.chart-wrapper {
  min-height: 320px;
  max-height: 420px;
}

.chart-surface {
  position: relative;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 211, 77, 0.25);
  background: linear-gradient(155deg, rgba(16, 16, 32, 0.9) 0%, rgba(30, 16, 30, 0.82) 45%, rgba(16, 16, 32, 0.9) 100%);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 32px -24px rgba(15, 23, 42, 0.8);
}

.chart-surface::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 16px;
  border: 1px dashed rgba(252, 211, 77, 0.15);
  pointer-events: none;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
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
  .chart-surface {
    padding: 1.25rem;
    border-radius: 16px;
  }

  .chart-card {
    box-shadow: 0 18px 48px -28px rgba(244, 63, 94, 0.55);
  }
}
</style>
