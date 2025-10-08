<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">Slipknot Shop</RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Переключить меню"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Каталог</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/cart">Корзина</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/profile">Профиль</RouterLink>
          </li>
          <li v-if="user?.role?.name === 'Менеджер'" class="nav-item">
            <RouterLink class="nav-link" to="/manager">Панель менеджера</RouterLink>
          </li>
          <li v-if="user?.role?.name === 'Администратор'" class="nav-item">
            <RouterLink class="nav-link" to="/admin/users">Управление пользователями</RouterLink>
          </li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          <RouterLink v-if="!isAuthenticated" class="btn btn-outline-light" to="/login">Вход</RouterLink>
          <button v-else class="btn btn-outline-light" type="button" @click="openModal">Выход</button>
        </div>
      </div>
    </div>
    <LogoutConfirmModal :visible="showModal" @confirm="handleLogout" @cancel="closeModal" />
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import LogoutConfirmModal from './LogoutConfirmModal.vue';

const authStore = useAuthStore();
const router = useRouter();
const { user, isAuthenticated } = storeToRefs(authStore);

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleLogout = async () => {
  authStore.logout();
  closeModal();
  await router.push('/');
};
</script>
