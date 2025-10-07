import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

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
    path: '/admin',
    name: 'admin',
    component: () => import('../pages/AdminPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
