import { createRouter, createWebHistory } from 'vue-router';
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/authStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('../pages/ProductPage.vue'),
    props: true,
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/CartPage.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/ProfilePage.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../pages/AuthPage.vue'),
  },
  {
    path: '/manager',
    name: 'manager',
    component: () => import('../pages/ManagerPage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['Менеджер'] },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../pages/AdminUsersPage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['Администратор'] },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth);
  if (!requiresAuth) {
    return next();
  }

  const authStore = useAuthStore();
  const { isAuthenticated, user } = storeToRefs(authStore);

  if (!isAuthenticated.value) {
    return next({ name: 'auth', query: { redirect: to.fullPath } });
  }

  if (!user.value) {
    try {
      await authStore.loadProfile();
    } catch (error) {
      authStore.logout();
      return next({ name: 'auth', query: { redirect: to.fullPath } });
    }
  }

  const allowedRoles = to.matched
    .map((route) => (Array.isArray(route.meta?.allowedRoles) ? (route.meta?.allowedRoles as string[]) : []))
    .flat();

  if (allowedRoles.length > 0) {
    const roleName = user.value?.role?.name ?? null;
    if (!roleName || !allowedRoles.includes(roleName)) {
      return next({ name: 'home' });
    }
  }

  return next();
});
