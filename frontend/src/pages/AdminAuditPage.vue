<template>
  <section class="py-4">
    <div class="container">
      <header class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h3 mb-1">Журнал аудита</h1>
          <p class="text-muted mb-0">Отслеживание изменений в ключевых таблицах магазина</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <label class="form-label mb-0" for="tableFilter">Таблица</label>
          <input
            id="tableFilter"
            v-model="tableFilter"
            class="form-control"
            type="text"
            placeholder="Например: orders"
            @keyup.enter="loadAudit"
          />
          <button class="btn btn-primary" type="button" @click="loadAudit">Обновить</button>
        </div>
      </header>

      <div v-if="isLoading" class="text-center my-5">
        <LoadingSpinner />
        <p class="text-muted mt-3">Загружаем журнал аудита…</p>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Дата</th>
                <th scope="col">Таблица</th>
                <th scope="col">Операция</th>
                <th scope="col">Пользователь</th>
                <th scope="col">Запись</th>
                <th scope="col">Изменения</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in auditEntries" :key="entry.id">
                <td class="fw-semibold">{{ formatDate(entry.createdAt) }}</td>
                <td><span class="badge bg-dark">{{ entry.tableName }}</span></td>
                <td>
                  <span :class="['badge', operationClass(entry.operation)]">{{ entry.operation }}</span>
                </td>
                <td>{{ entry.actorName }}</td>
                <td>{{ entry.recordId ?? '—' }}</td>
                <td>
                  <details>
                    <summary class="text-primary">Открыть JSON</summary>
                    <pre class="audit-json">{{ prettyJson(entry) }}</pre>
                  </details>
                </td>
              </tr>
              <tr v-if="auditEntries.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">Пока нет записей, удовлетворяющих условиям фильтра.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            Показано {{ offset + 1 }}–{{ Math.min(offset + limit, total) }} из {{ total }} записей
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" type="button" :disabled="offset === 0" @click="prevPage">
              Предыдущая
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="offset + limit >= total"
              @click="nextPage"
            >
              Следующая
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { fetchAuditLog, type AuditLogEntry } from '../api/audit';

const limit = 20;
const offsetRef = ref(0);
const tableFilter = ref('');
const auditEntries = ref<AuditLogEntry[]>([]);
const totalRef = ref(0);
const isLoading = ref(false);

const offset = computed(() => offsetRef.value);
const total = computed(() => totalRef.value);

const loadAudit = async () => {
  isLoading.value = true;
  try {
    const { items, total: totalItems } = await fetchAuditLog({
      limit,
      offset: offsetRef.value,
      tableName: tableFilter.value.trim() || undefined,
    });
    auditEntries.value = items;
    totalRef.value = totalItems;
  } catch (error) {
    console.error('Не удалось загрузить журнал аудита', error);
  } finally {
    isLoading.value = false;
  }
};

const nextPage = async () => {
  if (offsetRef.value + limit < totalRef.value) {
    offsetRef.value += limit;
    await loadAudit();
  }
};

const prevPage = async () => {
  if (offsetRef.value > 0) {
    offsetRef.value = Math.max(0, offsetRef.value - limit);
    await loadAudit();
  }
};

const formatDate = (value: string): string => {
  return new Date(value).toLocaleString('ru-RU');
};

const operationClass = (operation: AuditLogEntry['operation']) => {
  switch (operation) {
    case 'INSERT':
      return 'bg-success';
    case 'UPDATE':
      return 'bg-warning text-dark';
    case 'DELETE':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

const prettyJson = (entry: AuditLogEntry) => {
  return JSON.stringify({
    before: entry.oldData,
    after: entry.newData,
  }, null, 2);
};

onMounted(async () => {
  await loadAudit();
});
</script>

<style scoped>
.audit-json {
  background-color: var(--bs-dark-bg-subtle, #0f172a);
  color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.5rem;
  max-height: 320px;
  overflow: auto;
  margin-top: 0.5rem;
}
</style>
