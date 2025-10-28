<template>
  <div class="admin-users-page">
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
            <div class="admin-panel__actions">
              <button class="btn btn-outline-secondary" @click="reload" :disabled="reloading">
                Обновить данные
              </button>
              <button class="btn btn-primary" type="button" @click="openCreateModal">
                Добавить пользователя
              </button>
            </div>
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

    <GlassModal
      :visible="createModalVisible"
      max-width="760px"
      :prevent-close="creating"
      @close="closeCreateModal"
    >
      <form class="form-dialog" @submit.prevent="createUserAction">
        <header class="form-dialog__header">
          <div class="form-dialog__heading">
            <span class="form-dialog__icon form-dialog__icon--accent" aria-hidden="true">
              <UserPlusIcon />
            </span>
            <div class="form-dialog__title-wrap">
              <DialogTitle id="create-user-modal-title" as="h2" class="form-dialog__title">
                Новый пользователь
              </DialogTitle>
              <p class="form-dialog__subtitle">
                Укажите контактные данные, роль и временный пароль для новой учетной записи.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="form-dialog__close"
            aria-label="Закрыть"
            :disabled="creating"
            @click="closeCreateModal"
          >
            <XMarkIcon aria-hidden="true" />
          </button>
        </header>
        <section class="form-dialog__body" aria-labelledby="create-user-modal-title">
          <div class="form-grid">
            <div class="form-grid__item">
              <label for="createUserName" class="form-field__label">Имя</label>
              <input
                id="createUserName"
                v-model="createForm.name"
                type="text"
                class="form-input"
                placeholder="Имя и фамилия"
                required
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item">
              <label for="createUserEmail" class="form-field__label">Email</label>
              <input
                id="createUserEmail"
                v-model="createForm.email"
                type="email"
                class="form-input"
                placeholder="name@example.com"
                required
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item">
              <label for="createUserPhone" class="form-field__label">Телефон</label>
              <input
                id="createUserPhone"
                v-model="createForm.phone"
                type="tel"
                class="form-input"
                placeholder="Например, +7 900 000-00-00"
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item">
              <label for="createUserRole" class="form-field__label">Роль</label>
              <select
                id="createUserRole"
                v-model="createForm.roleName"
                class="form-input form-input--select"
                required
                :disabled="creating"
              >
                <option value="">Выберите роль</option>
                <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
              </select>
            </div>
            <div class="form-grid__item">
              <label for="createUserPassword" class="form-field__label">Пароль</label>
              <input
                id="createUserPassword"
                v-model="createForm.password"
                type="password"
                class="form-input"
                placeholder="Минимум 6 символов"
                required
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item">
              <label for="createUserCountry" class="form-field__label">Страна</label>
              <input
                id="createUserCountry"
                v-model="createForm.country"
                type="text"
                class="form-input"
                placeholder="Например, Россия"
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item">
              <label for="createUserCity" class="form-field__label">Город</label>
              <input
                id="createUserCity"
                v-model="createForm.city"
                type="text"
                class="form-input"
                placeholder="Например, Москва"
                :disabled="creating"
              />
            </div>
            <div class="form-grid__item form-grid__item--full">
              <label for="createUserAddress" class="form-field__label">Адрес</label>
              <input
                id="createUserAddress"
                v-model="createForm.address"
                type="text"
                class="form-input"
                placeholder="Улица, дом, квартира"
                :disabled="creating"
              />
            </div>
          </div>
        </section>
        <footer class="form-dialog__footer">
          <button
            type="button"
            class="dialog-button dialog-button--ghost"
            :disabled="creating"
            @click="closeCreateModal"
          >
            Отмена
          </button>
          <button type="submit" class="dialog-button dialog-button--primary" :disabled="creating">
            <span v-if="creating">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
        </footer>
      </form>
    </GlassModal>

    <GlassModal
      :visible="editModalVisible"
      max-width="720px"
      :prevent-close="saving"
      @close="closeEditModal"
    >
      <form class="form-dialog" @submit.prevent="saveUser">
        <header class="form-dialog__header">
          <div class="form-dialog__heading">
            <span class="form-dialog__icon" aria-hidden="true">
              <PencilSquareIcon />
            </span>
            <div class="form-dialog__title-wrap">
              <DialogTitle id="edit-user-modal-title" as="h2" class="form-dialog__title">
                Редактирование пользователя
              </DialogTitle>
              <p class="form-dialog__subtitle">Обновите контактные данные и роль пользователя.</p>
            </div>
          </div>
          <button
            type="button"
            class="form-dialog__close"
            aria-label="Закрыть"
            :disabled="saving"
            @click="closeEditModal"
          >
            <XMarkIcon aria-hidden="true" />
          </button>
        </header>
        <section class="form-dialog__body" aria-labelledby="edit-user-modal-title">
          <div class="form-grid form-grid--compact">
            <div class="form-grid__item">
              <label for="userName" class="form-field__label">Имя</label>
              <input id="userName" v-model="editForm.name" type="text" class="form-input" required />
            </div>
            <div class="form-grid__item">
              <label for="userEmail" class="form-field__label">Email</label>
              <input id="userEmail" v-model="editForm.email" type="email" class="form-input" required />
            </div>
            <div class="form-grid__item">
              <label for="userPhone" class="form-field__label">Телефон</label>
              <input id="userPhone" v-model="editForm.phone" type="tel" class="form-input" />
            </div>
            <div class="form-grid__item">
              <label for="userRole" class="form-field__label">Роль</label>
              <select id="userRole" v-model="editForm.roleName" class="form-input form-input--select" required>
                <option value="">Выберите роль</option>
                <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.name }}</option>
              </select>
            </div>
          </div>
        </section>
        <footer class="form-dialog__footer">
          <button type="button" class="dialog-button dialog-button--ghost" :disabled="saving" @click="closeEditModal">
            Отмена
          </button>
          <button type="submit" class="dialog-button dialog-button--primary" :disabled="saving">
            <span v-if="saving">Сохранение...</span>
            <span v-else>Сохранить изменения</span>
          </button>
        </footer>
      </form>
    </GlassModal>

    <GlassModal
      :visible="deleteModalVisible"
      max-width="520px"
      :prevent-close="deleting"
      @close="closeDeleteModal"
    >
      <div class="confirm-modal">
        <div class="confirm-modal__icon" aria-hidden="true">
          <ExclamationTriangleIcon />
        </div>
        <DialogTitle id="delete-user-modal-title" as="h2" class="confirm-modal__title">
          Удалить пользователя?
        </DialogTitle>
        <p class="confirm-modal__subtitle">
          Вы уверены, что хотите удалить пользователя «{{ deletingUser?.name ?? '' }}»? Это действие нельзя отменить.
        </p>
        <div class="confirm-modal__actions">
          <button type="button" class="dialog-button dialog-button--ghost" :disabled="deleting" @click="closeDeleteModal">
            Отменить
          </button>
          <button type="button" class="dialog-button dialog-button--danger" :disabled="deleting" @click="confirmDelete">
            <span v-if="deleting">Удаление...</span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';
import { ExclamationTriangleIcon, PencilSquareIcon, UserPlusIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { onMounted, reactive, ref } from 'vue';
import GlassModal from '../components/GlassModal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  type CreateUserPayload,
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
const creating = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const createModalVisible = ref(false);

const editingUserId = ref<number | null>(null);
const deletingUser = ref<UserListItem | null>(null);

const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  roleName: '',
});

const createForm = reactive({
  name: '',
  email: '',
  phone: '',
  roleName: '',
  password: '',
  country: '',
  city: '',
  address: '',
});

const resetMessages = () => {
  errorMessage.value = null;
  successMessage.value = null;
};

const resetCreateForm = () => {
  createForm.name = '';
  createForm.email = '';
  createForm.phone = '';
  createForm.roleName = roles.value[0]?.name ?? '';
  createForm.password = '';
  createForm.country = '';
  createForm.city = '';
  createForm.address = '';
};

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString('ru-RU');
};

const openCreateModal = () => {
  resetMessages();
  resetCreateForm();
  createModalVisible.value = true;
};

const closeCreateModal = () => {
  createModalVisible.value = false;
  resetCreateForm();
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

const createUserAction = async () => {
  if (!createForm.name || !createForm.email || !createForm.password || !createForm.roleName) {
    return;
  }

  try {
    creating.value = true;
    resetMessages();
    const payload: CreateUserPayload = {
      name: createForm.name,
      email: createForm.email,
      password: createForm.password,
      roleName: createForm.roleName,
      phone: createForm.phone || undefined,
      country: createForm.country || undefined,
      city: createForm.city || undefined,
      address: createForm.address || undefined,
    };
    await createUser(payload);
    await loadData();
    successMessage.value = 'Пользователь создан';
    createModalVisible.value = false;
    resetCreateForm();
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    creating.value = false;
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

.admin-panel__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
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
