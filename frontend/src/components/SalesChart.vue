<template>
  <div class="chart-card">
    <canvas ref="canvasRef" aria-label="График продаж" role="img"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  Chart,
  registerables,
  type ChartConfiguration,
  type ChartDataset,
} from 'chart.js';

Chart.register(...registerables);

interface SalesChartProps {
  labels: string[];
  revenue: number[];
  items: number[];
  orders: number[];
}

const props = defineProps<SalesChartProps>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart<'bar' | 'line'> | null = null;

const buildChart = () => {
  if (!canvasRef.value) {
    return;
  }

  chart?.destroy();

  const quantityDataset: ChartDataset<'bar', number[]> = {
    type: 'bar',
    label: 'Проданные единицы',
    data: props.items,
    backgroundColor: 'rgba(194, 24, 91, 0.45)',
    borderRadius: 6,
    maxBarThickness: 36,
    yAxisID: 'y',
  };

  const revenueDataset: ChartDataset<'line', number[]> = {
    type: 'line',
    label: 'Выручка (₽)',
    data: props.revenue,
    borderColor: 'rgb(245, 40, 145)',
    backgroundColor: 'rgba(245, 40, 145, 0.22)',
    tension: 0.35,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    yAxisID: 'y1',
  };

  const datasets: ChartDataset<'bar' | 'line', number[]>[] = [
    quantityDataset,
    revenueDataset,
  ];

  const config: ChartConfiguration<'bar' | 'line'> = {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            callback: (value) => `${value}`,
          },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            callback: (value) => `${Number(value).toLocaleString('ru-RU')} ₽`,
          },
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: 'rgba(255, 255, 255, 0.8)' },
        },
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: 'rgba(255, 255, 255, 0.86)',
          },
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              if (!items.length) {
                return '';
              }
              const index = items[0].dataIndex;
              const orders = props.orders[index] ?? 0;
              return `Заказы: ${orders}`;
            },
            label: (context) => {
              const datasetType = (context.dataset as { type?: string }).type;
              if (datasetType === 'line') {
                return `Выручка: ${Number(context.parsed.y).toLocaleString('ru-RU')} ₽`;
              }
              return `Продано единиц: ${context.parsed.y}`;
            },
          },
        },
      },
    },
  };

  chart = new Chart(canvasRef.value, config);
};

onMounted(buildChart);

watch(
  () => [props.labels, props.revenue, props.items, props.orders],
  () => buildChart(),
  { deep: true },
);

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>

<style scoped>
.chart-card {
  position: relative;
  min-height: 320px;
  width: 100%;
  padding: 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(17, 17, 17, 0.88), rgba(34, 9, 20, 0.9));
  box-shadow: 0 16px 34px -20px rgba(255, 64, 129, 0.45);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
