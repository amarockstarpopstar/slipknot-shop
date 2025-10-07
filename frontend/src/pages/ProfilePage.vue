<template>
  <section class="py-5">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="display-6 fw-bold">Профиль</h1>
        <button v-if="isAuthenticated" class="btn btn-outline-danger" @click="logout">
          Выйти
        </button>
      </div>
      <div v-if="!isAuthenticated" class="alert alert-warning" role="alert">
        Выполните вход, чтобы просмотреть информацию профиля.
        <RouterLink class="alert-link" to="/auth">Перейти к авторизации</RouterLink>
      </div>
      <div v-else>
        <LoadingSpinner v-if="loading" />
        <div v-else>
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-else-if="user" class="card shadow-sm">
            <div class="card-body">
              <h2 class="h5 mb-3">Личные данные</h2>
              <p class="mb-1"><strong>Имя:</strong> {{ user.name }}</p>
              <p class="mb-1"><strong>Email:</strong> {{ user.email }}</p>
              <p class="mb-1"><strong>Телефон:</strong> {{ user.phone ?? 'не указан' }}</p>
              <p class="mb-0"><strong>Роль:</strong> {{ user.role?.name ?? 'пользователь' }}</p>
            </div>
          </div>
          <div v-else class="alert alert-info" role="alert">
            Данные профиля пока не загружены.
          </div>
        </div>
        <button class="btn btn-secondary mt-4" @click="loadProfile">Обновить данные</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const { user, loading, error, isAuthenticated } = storeToRefs(authStore);

const loadProfile = async () => {
  await authStore.loadProfile();
};

const logout = () => {
  authStore.logout();
};
</script>
