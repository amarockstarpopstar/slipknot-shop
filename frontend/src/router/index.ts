import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router';
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
    component: () => import('../pages/CartView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout/payment',
    name: 'checkout-payment',
    component: () => import('../pages/CheckoutPaymentPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders-history',
    component: () => import('../pages/OrdersHistoryPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/AuthPage.vue'),
    alias: ['/auth'],
    meta: { requiresGuest: true },
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
  {
    path: '/admin/audit',
    name: 'admin-audit',
    component: () => import('../pages/AdminAuditPage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['Администратор'] },
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
  console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`);

  const authStore = useAuthStore();

  if (to.matched.some((route) => route.meta?.requiresGuest) && authStore.isAuthenticated) {
    const redirectTarget = typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/') ? to.query.redirect : '/';
    return { path: redirectTarget };
  }

  const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth);
  if (!requiresAuth) {
    return true;
  }

  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (!authStore.user) {
    try {
      await authStore.loadProfile();
    } catch (error) {
      authStore.logout();
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  }

  const allowedRoles = to.matched
    .map((route) => (Array.isArray(route.meta?.allowedRoles) ? (route.meta?.allowedRoles as string[]) : []))
    .flat();

  if (allowedRoles.length > 0) {
    const roleName = authStore.user?.role?.name ?? null;
    if (!roleName || !allowedRoles.includes(roleName)) {
      return { name: 'home' };
    }
  }

  return true;
});

router.afterEach((to) => {
  console.log('Navigated to:', to.fullPath);
});

router.onError((error) => {
  console.error('Router error:', error);
});
