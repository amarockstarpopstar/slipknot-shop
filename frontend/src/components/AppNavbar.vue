<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid layout-container d-flex align-items-center">
      <RouterLink class="navbar-brand" to="/">Slipknot Shop</RouterLink>
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
          <li v-for="(link, index) in navigationLinks" :key="link.to" class="nav-item">
            <RouterLink class="nav-link" :to="link.to">
              {{ link.label }}
              <span class="shortcut-hint" aria-hidden="true">Alt+{{ index + 1 }}</span>
            </RouterLink>
          </li>
        </ul>
        <div class="d-flex align-items-center flex-wrap gap-2">
          <ThemeToggle />
          <RouterLink v-if="!isAuthenticated" class="btn btn-outline-light" to="/login">Вход</RouterLink>
          <button v-else class="btn btn-outline-light" type="button" @click="openModal">Выход</button>
        </div>
      </div>
    </div>
    <LogoutConfirmModal :visible="showModal" @confirm="handleLogout" @cancel="closeModal" />
  </nav>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { NavigationFailureType, RouterLink, isNavigationFailure, useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import LogoutConfirmModal from './LogoutConfirmModal.vue';
import ThemeToggle from './ThemeToggle.vue';

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const showModal = ref(false);

const navigationLinks = computed(() => {
  const links = [
    { to: '/', label: 'Каталог' },
    { to: '/cart', label: 'Корзина' },
  ];

  if (isAuthenticated.value) {
    links.push({ to: '/orders', label: 'Мои заказы' });
    links.push({ to: '/profile', label: 'Профиль' });
  }

  const roleName = user.value?.role?.name;

  if (roleName === 'Менеджер') {
    links.push({ to: '/manager', label: 'Панель менеджера' });
  }

  if (roleName === 'Менеджер' || roleName === 'Администратор') {
    links.push({ to: '/manager/reports', label: 'Отчётность' });
  }

  if (roleName === 'Администратор') {
    links.push({ to: '/admin/users', label: 'Управление пользователями' });
    links.push({ to: '/admin/audit', label: 'Журнал аудита' });
    links.push({ to: '/admin/reviews', label: 'Отзывы' });
  }

  return links;
});

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleLogout = async () => {
  authStore.logout();
  closeModal();
  await router.replace({ name: 'home', query: { message: 'Вы успешно вышли из аккаунта' } });
};

const shouldIgnoreShortcut = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return false;
  }

  const tagName = target.tagName;
  const isFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);

  return isFormField || target.isContentEditable;
};

const resolveShortcutIndex = (event: KeyboardEvent) => {
  const { code, key } = event;

  if (code.startsWith('Digit') || code.startsWith('Numpad')) {
    const index = Number.parseInt(code.replace(/\D/g, ''), 10);

    if (Number.isInteger(index)) {
      return index === 0 ? 9 : index - 1;
    }
  }

  if (key === '0') {
    return 9;
  }

  const parsed = Number.parseInt(key, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed - 1;
};

const handleShortcut = (event: KeyboardEvent) => {
  if (!event.altKey || event.repeat || shouldIgnoreShortcut(event)) {
    return;
  }

  const shortcutIndex = resolveShortcutIndex(event);

  if (shortcutIndex === null) {
    return;
  }

  const link = navigationLinks.value[shortcutIndex];

  if (!link) {
    return;
  }

  event.preventDefault();

  const currentPath = router.currentRoute.value.path;

  if (currentPath !== link.to) {
    router.push(link.to).catch((error) => {
      if (!isNavigationFailure(error, NavigationFailureType.duplicated)) {
        console.error('Navigation shortcut error', error);
      }
    });
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut);
});

watchEffect(() => {
  console.info('Navbar reactive snapshot', {
    isAuthenticated: isAuthenticated.value,
    user: user.value,
  });
});
</script>

<style scoped>
.shortcut-hint {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.65;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

@media (max-width: 991.98px) {
  .shortcut-hint {
    display: none;
  }
}
</style>
