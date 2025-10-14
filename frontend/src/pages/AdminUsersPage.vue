<template>
  <section class="section fade-in-up">
    <div class="layout-container admin-page">
      <header class="admin-header">
        <div>
          <span class="chip mb-2">Администрирование</span>
          <h1 class="section-title mb-1">Управление пользователями</h1>
          <p class="section-subtitle mb-0">Просматривайте, редактируйте и удаляйте учетные записи.</p>
        </div>
      </header>

      <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>

      <LoadingSpinner v-if="initialLoading" />

      <div v-else class="admin-panel">
        <div class="admin-panel__toolbar">
          <h2 class="admin-panel__title">Список пользователей</h2>
          <button class="btn btn-outline-secondary" @click="reload" :disabled="reloading">
            Обновить данные
          </button>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0 admin-table">
            <colgroup>
              <col style="width: 5rem" />
              <col style="width: 13rem" />
              <col style="width: 18rem" />
              <col style="width: 12rem" />
              <col style="width: 11rem" />
              <col style="width: 13rem" />
              <col style="width: 13rem" />
              <col style="width: 12rem" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Имя</th>
                <th scope="col">Email</th>
                <th scope="col">Телефон</th>
                <th scope="col">Роль</th>
                <th scope="col">Создан</th>
                <th scope="col">Обновлён</th>
                <th scope="col" class="text-end">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="userItem in users" :key="userItem.id">
                <th scope="row">{{ userItem.id }}</th>
                <td>{{ userItem.name }}</td>
                <td>{{ userItem.email }}</td>
                <td>{{ userItem.phone ?? '—' }}</td>
                <td>{{ userItem.role?.name ?? '—' }}</td>
                <td>{{ formatDate(userItem.createdAt) }}</td>
                <td>{{ formatDate(userItem.updatedAt) }}</td>
                <td class="text-end admin-table__actions">
                  <button class="btn btn-sm btn-outline-primary" @click="openEditModal(userItem)">
                    Редактировать
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="openDeleteModal(userItem)">
                    Удалить
                  </button>
                </td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="8" class="text-center text-muted py-4">Пользователи не найдены</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <div v-if="editModalVisible" class="modal fade show d-block glass-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Редактирование пользователя</h2>
          <button type="button" class="btn-close" aria-label="Закрыть" @click="closeEditModal"></button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="userName" class="form-label">Имя</label>
                <input id="userName" v-model="editForm.name" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label for="userEmail" class="form-label">Email</label>
                <input id="userEmail" v-model="editForm.email" type="email" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label for="userPhone" class="form-label">Телефон</label>
                <input
                  id="userPhone"
                  v-model="editForm.phone"
                  type="tel"
                  class="form-control"
                  placeholder="Например, +7 900 000-00-00"
                />
              </div>
              <div class="col-md-6">
                <label for="userRole" class="form-label">Роль</label>
                <select id="userRole" v-model="editForm.roleName" class="form-select" required>
                  <option value="">Выберите роль</option>
                  <option v-for="role in roles" :key="role.id" :value="role.name">
                    {{ role.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Отменить</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">Сохранить изменения</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="editModalVisible" class="modal-backdrop fade show"></div>

  <div v-if="deleteModalVisible" class="modal fade show d-block glass-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Удаление пользователя</h2>
          <button type="button" class="btn-close" aria-label="Закрыть" @click="closeDeleteModal"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Вы уверены, что хотите удалить пользователя «{{ deletingUser?.name }}»?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Отменить</button>
          <button type="button" class="btn btn-danger" :disabled="deleting" @click="confirmDelete">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="deleteModalVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  deleteUser,
  fetchRoles,
  fetchUsers,
  type UpdateUserPayload,
  type UserListItem,
  type UserRole,
  updateUser,
} from '../api/users';
import { extractErrorMessage } from '../api/http';

const users = ref<UserListItem[]>([]);
const roles = ref<UserRole[]>([]);
const initialLoading = ref(true);
const reloading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const editingUserId = ref<number | null>(null);
const deletingUser = ref<UserListItem | null>(null);

const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  roleName: '',
});

const resetMessages = () => {
  errorMessage.value = null;
  successMessage.value = null;
};

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('ru-RU');
};

const loadData = async () => {
  try {
    const [usersResponse, rolesResponse] = await Promise.all([fetchUsers(), fetchRoles()]);
    users.value = usersResponse;
    roles.value = rolesResponse;
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    initialLoading.value = false;
    reloading.value = false;
  }
};

const reload = async () => {
  try {
    reloading.value = true;
    resetMessages();
    await loadData();
    if (!errorMessage.value) {
      successMessage.value = 'Данные обновлены';
    }
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    reloading.value = false;
  }
};

const openEditModal = (userItem: UserListItem) => {
  resetMessages();
  editingUserId.value = userItem.id;
  editForm.name = userItem.name;
  editForm.email = userItem.email;
  editForm.phone = userItem.phone ?? '';
  editForm.roleName = userItem.role?.name ?? '';
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
};

const saveUser = async () => {
  if (editingUserId.value === null) {
    return;
  }
  try {
    saving.value = true;
    resetMessages();
    const payload: UpdateUserPayload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      roleName: editForm.roleName,
    };
    await updateUser(editingUserId.value, payload);
    await loadData();
    successMessage.value = 'Пользователь обновлён';
    editModalVisible.value = false;
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    saving.value = false;
  }
};

const openDeleteModal = (userItem: UserListItem) => {
  resetMessages();
  deletingUser.value = userItem;
  deleteModalVisible.value = true;
};

const closeDeleteModal = () => {
  deleteModalVisible.value = false;
};

const confirmDelete = async () => {
  if (!deletingUser.value) {
    return;
  }
  try {
    deleting.value = true;
    resetMessages();
    await deleteUser(deletingUser.value.id);
    await loadData();
    successMessage.value = 'Пользователь удалён';
    deleteModalVisible.value = false;
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.admin-panel {
  padding: clamp(1.75rem, 3vw, 2.5rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.admin-panel__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-panel__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.admin-table {
  table-layout: fixed;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.admin-table th,
.admin-table td {
  vertical-align: middle;
  border-color: var(--color-surface-border);
  font-variant-numeric: tabular-nums;
}

.admin-table th {
  font-weight: 600;
  color: var(--color-text-muted);
}

.admin-table td:not(:nth-child(2)) {
  white-space: nowrap;
}

.admin-table td:nth-child(3) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-table__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.admin-table__actions :deep(.btn) {
  margin: 0;
}

@media (max-width: 575.98px) {
  .admin-panel__toolbar :deep(.btn) {
    width: 100%;
  }
}
</style>
