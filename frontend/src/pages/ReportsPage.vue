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
        <div class="card bg-dark border-secondary h-100">
          <div class="card-body">
            <h2 class="h5 card-title">Продажи по дням</h2>
            <p class="text-muted small">Сумма заказов и количество товаров, оформленных в выбранный день.</p>
            <div class="chart-wrapper">
              <canvas ref="chartCanvas" class="sales-chart" aria-label="График продаж" role="img"></canvas>
            </div>
            <p v-if="!dailySales.length" class="text-muted text-center mt-3 mb-0">
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
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { storeToRefs } from 'pinia';
import { useReportsStore } from '../store/reportsStore';

const reportsStore = useReportsStore();
const { dailySales, loading, error, downloading, downloadError, totalItems, totalAmount } =
  storeToRefs(reportsStore);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart<'line'> | null>(null);
const successMessage = ref<string | null>(null);

const formattedAmount = computed(() =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
    totalAmount.value,
  ),
);

const averageOrderValue = computed(() => {
  if (!dailySales.value.length) {
    return '—';
  }
  const average = totalAmount.value / dailySales.value.length;
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(average);
});

const buildChart = () => {
  if (!chartCanvas.value) {
    return;
  }

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const labels = dailySales.value.map((point) => point.saleDate);
  const totals = dailySales.value.map((point) => point.totalAmount);
  const quantities = dailySales.value.map((point) => point.totalItems);

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Сумма продаж, ₽',
          data: totals,
          borderColor: '#f50000',
          backgroundColor: 'rgba(245, 0, 0, 0.2)',
          tension: 0.3,
          yAxisID: 'amountAxis',
          fill: true,
        },
        {
          label: 'Количество товаров',
          data: quantities,
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          tension: 0.3,
          yAxisID: 'countAxis',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        amountAxis: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value) =>
              new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
              }).format(Number(value)),
          },
        },
        countAxis: {
          type: 'linear',
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          ticks: {
            callback: (_value, index) => {
              const label = labels[index];
              if (!label) {
                return '';
              }
              return new Date(label).toLocaleDateString('ru-RU');
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: '#ffffff',
          },
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const item = tooltipItems[0];
              const label = labels[item.dataIndex];
              return label ? new Date(label).toLocaleDateString('ru-RU') : '';
            },
          },
        },
      },
      color: '#ffffff',
    },
  });
};

watch(
  dailySales,
  () => {
    if (dailySales.value.length) {
      buildChart();
    } else if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
  },
  { deep: true },
);

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
  if (dailySales.value.length) {
    buildChart();
  }
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
});
</script>

<style scoped>
.reports-page {
  min-height: 100%;
}

.chart-wrapper {
  min-height: 320px;
  max-height: 420px;
}

.sales-chart {
  width: 100%;
  height: 100%;
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
</style>
