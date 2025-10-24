<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid layout-container">
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
      <div class="collapse navbar-collapse navbar-collapse-balanced" id="mainNavbar">
        <ul class="navbar-nav navigation-list mb-2 mb-lg-0">
          <li v-for="link in visibleNavigationLinks" :key="link.to" class="nav-item">
            <RouterLink class="nav-link" :to="link.to">
              {{ link.label }}
              <span class="shortcut-hint" aria-hidden="true">Alt+{{ link.shortcutIndex + 1 }}</span>
            </RouterLink>
          </li>
          <li
            v-if="hasOverflowLinks"
            ref="overflowMenuTriggerRef"
            class="nav-item overflow-menu-wrapper"
          >
            <button
              type="button"
              class="nav-link overflow-toggle"
              :aria-expanded="isOverflowMenuOpen"
              aria-haspopup="true"
              :aria-controls="overflowMenuId"
              @click="toggleOverflowMenu"
            >
              …
            </button>
            <Transition name="fade">
              <ul
                v-if="isOverflowMenuOpen"
                ref="overflowMenuRef"
                :id="overflowMenuId"
                class="overflow-menu"
                role="menu"
              >
                <li
                  v-for="link in overflowNavigationLinks"
                  :key="link.to"
                  class="overflow-menu-item"
                >
                  <RouterLink
                    class="overflow-menu-link"
                    :to="link.to"
                    role="menuitem"
                    @click="handleOverflowLinkClick"
                  >
                    {{ link.label }}
                    <span class="shortcut-hint" aria-hidden="true">Alt+{{ link.shortcutIndex + 1 }}</span>
                  </RouterLink>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
        <div class="navbar-actions">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NavigationFailureType, RouterLink, isNavigationFailure, useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import LogoutConfirmModal from './LogoutConfirmModal.vue';
import ThemeToggle from './ThemeToggle.vue';

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const showModal = ref(false);

const rawNavigationLinks = computed(() => {
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

const navigationLinks = computed(() =>
  rawNavigationLinks.value.map((link, index) => ({
    ...link,
    shortcutIndex: index,
  }))
);

const MAX_VISIBLE_NAV_LINKS = 4;

const visibleNavigationLinks = computed(() =>
  navigationLinks.value.slice(0, MAX_VISIBLE_NAV_LINKS)
);

const overflowNavigationLinks = computed(() =>
  navigationLinks.value.slice(MAX_VISIBLE_NAV_LINKS)
);

const hasOverflowLinks = computed(() => overflowNavigationLinks.value.length > 0);

const isOverflowMenuOpen = ref(false);
const overflowMenuTriggerRef = ref<HTMLElement | null>(null);
const overflowMenuRef = ref<HTMLElement | null>(null);
const overflowMenuId = 'navbar-overflow-menu';

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const closeOverflowMenu = () => {
  isOverflowMenuOpen.value = false;
};

const focusFirstOverflowLink = () => {
  const firstOverflowLink = overflowMenuRef.value?.querySelector<HTMLAnchorElement>('a');
  if (firstOverflowLink) {
    firstOverflowLink.focus();
  }
};

const toggleOverflowMenu = () => {
  const shouldOpen = !isOverflowMenuOpen.value;
  isOverflowMenuOpen.value = shouldOpen;

  if (shouldOpen) {
    nextTick(() => {
      focusFirstOverflowLink();
    });
  }
};

const handleOverflowLinkClick = () => {
  closeOverflowMenu();
};

const handleGlobalClick = (event: MouseEvent) => {
  if (!isOverflowMenuOpen.value) {
    return;
  }

  const target = event.target as Node | null;

  if (!target) {
    return;
  }

  if (
    overflowMenuTriggerRef.value?.contains(target) === true ||
    overflowMenuRef.value?.contains(target) === true
  ) {
    return;
  }

  closeOverflowMenu();
};

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!isOverflowMenuOpen.value) {
    return;
  }

  if (event.key === 'Escape') {
    event.stopPropagation();
    closeOverflowMenu();
    overflowMenuTriggerRef.value?.focus();
  }
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
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut);
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('keydown', handleGlobalKeydown);
});

watch(
  () => navigationLinks.value.length,
  () => {
    closeOverflowMenu();
  }
);

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    closeOverflowMenu();
  }
);

</script>

<style scoped>
.layout-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.layout-container :deep(.navbar-brand) {
  white-space: nowrap;
}

.navbar-collapse-balanced {
  flex-grow: 1;
}

@media (min-width: 992px) {
  .navbar-collapse-balanced {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 1.5rem;
  }
}

.navigation-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
}

@media (min-width: 992px) {
  .navigation-list {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
  }
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.navbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 992px) {
  .navbar-actions {
    justify-content: flex-end;
    gap: 1rem;
  }
}

.overflow-menu-wrapper {
  position: relative;
}

.overflow-toggle {
  border: none;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
  border-radius: 999px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.overflow-toggle:hover,
.overflow-toggle:focus {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.overflow-toggle:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.overflow-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 12rem;
  margin: 0;
  padding: 0.75rem;
  list-style: none;
  border-radius: 0.75rem;
  background: rgba(24, 24, 24, 0.95);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.overflow-menu-item {
  width: 100%;
}

.overflow-menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.overflow-menu-link:hover,
.overflow-menu-link:focus {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.12);
}

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

@media (max-width: 991.98px) {
  .overflow-menu-wrapper {
    width: 100%;
  }

  .overflow-toggle {
    justify-content: flex-start;
    width: 100%;
    padding-left: 0;
  }

  .overflow-menu {
    position: static;
    width: 100%;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    gap: 0.5rem;
  }

  .overflow-menu-link {
    padding-left: 0;
    padding-right: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
