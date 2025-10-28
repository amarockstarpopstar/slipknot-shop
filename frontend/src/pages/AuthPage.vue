<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <div class="auth-card">
        <div class="auth-card__tabs" role="tablist" aria-label="Переключение между входом и регистрацией">
          <button
            class="auth-card__tab"
            :class="{ 'auth-card__tab--active': mode === 'login' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            @click="mode = 'login'"
          >
            Вход
          </button>
          <button
            class="auth-card__tab"
            :class="{ 'auth-card__tab--active': mode === 'register' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            @click="mode = 'register'"
          >
            Регистрация
          </button>
        </div>

        <div v-if="infoMessage" class="alert alert-warning" role="alert">{{ infoMessage }}</div>

        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="auth-form__field" v-if="mode === 'register'">
            <label for="name" class="form-label">Имя</label>
            <input v-model="form.name" type="text" class="form-control" id="name" required />
          </div>
          <div class="auth-form__field">
            <label for="email" class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-control" id="email" required />
          </div>
          <div class="auth-form__field">
            <label for="password" class="form-label">Пароль</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              id="password"
              minlength="6"
              required
            />
          </div>
          <div class="auth-form__field" v-if="mode === 'register'">
            <label for="phone" class="form-label">Телефон</label>
            <input v-model="form.phone" type="tel" class="form-control" id="phone" placeholder="+7..." />
          </div>
          <button class="btn btn-danger w-100" type="submit" :disabled="loading">
            {{ mode === 'login' ? 'Войти' : 'Создать аккаунт' }}
          </button>
        </form>

        <div v-if="error" class="alert alert-danger mt-3" role="alert">{{ error }}</div>
        <div v-if="success" class="alert alert-success mt-3" role="alert">{{ success }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/authStore';
import { useRoute } from 'vue-router';
import { useNavigation } from '../composables/useNavigation';

const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const route = useRoute();
const { safeReplace } = useNavigation();
const mode = ref<'login' | 'register'>('login');
const success = ref('');
const infoMessage = computed(() => {
  const message = route.query.message;
  return typeof message === 'string' ? message : '';
});

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
});

const resolveRedirect = () => {
  const redirectTarget = route.query.redirect;
  if (typeof redirectTarget === 'string' && redirectTarget.startsWith('/')) {
    return redirectTarget;
  }
  return '/';
};

const handleSubmit = async () => {
  try {
    if (mode.value === 'login') {
      await authStore.loginUser({ email: form.email, password: form.password });
      success.value = 'Вход выполнен успешно!';
      await safeReplace(resolveRedirect());
    } else {
      await authStore.registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      success.value = 'Аккаунт создан! Добро пожаловать.';
      await safeReplace(resolveRedirect());
    }
  } catch (err) {
    console.error('Auth request failed', err);
    success.value = '';
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    void safeReplace(resolveRedirect());
  }
});

watch(
  () => authStore.isAuthenticated,
  (loggedIn) => {
    if (!loggedIn) {
      return;
    }
    const target = resolveRedirect();
    if (route.fullPath !== target) {
      void safeReplace(target);
    }
  }
);
</script>

<style scoped>
.auth-card {
  width: min(520px, 100%);
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 3rem);
  border-radius: calc(var(--radius-lg) * 1.2);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(var(--blur-radius));
}

.auth-card__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.auth-card__tab {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline);
  background: color-mix(in srgb, var(--color-surface-alt) 90%, transparent);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: background var(--transition-base), color var(--transition-base),
    box-shadow var(--transition-base), border-color var(--transition-base);
}

.auth-card__tab:hover {
  box-shadow: var(--shadow-hover);
}

.auth-card__tab--active {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
  box-shadow: var(--shadow-soft);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
</style>
