<template>
  <section class="py-5 bg-dark text-white">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card shadow-lg">
            <div class="card-body p-4">
              <div v-if="infoMessage" class="alert alert-warning" role="alert">
                {{ infoMessage }}
              </div>
              <ul class="nav nav-pills mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    :class="{ active: mode === 'login' }"
                    type="button"
                    role="tab"
                    @click="mode = 'login'"
                  >
                    Вход
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    :class="{ active: mode === 'register' }"
                    type="button"
                    role="tab"
                    @click="mode = 'register'"
                  >
                    Регистрация
                  </button>
                </li>
              </ul>
              <form @submit.prevent="handleSubmit">
                <div class="mb-3" v-if="mode === 'register'">
                  <label for="name" class="form-label">Имя</label>
                  <input v-model="form.name" type="text" class="form-control" id="name" required />
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input v-model="form.email" type="email" class="form-control" id="email" required />
                </div>
                <div class="mb-3">
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
                <div class="mb-3" v-if="mode === 'register'">
                  <label for="phone" class="form-label">Телефон</label>
                  <input v-model="form.phone" type="tel" class="form-control" id="phone" placeholder="+7..." />
                </div>
                <button class="btn btn-danger w-100" type="submit" :disabled="loading">
                  {{ mode === 'login' ? 'Войти' : 'Создать аккаунт' }}
                </button>
              </form>
              <div v-if="error" class="alert alert-danger mt-3" role="alert">
                {{ error }}
              </div>
              <div v-if="success" class="alert alert-success mt-3" role="alert">
                {{ success }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/authStore';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const route = useRoute();
const router = useRouter();
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

const handleSubmit = async () => {
  try {
    if (mode.value === 'login') {
      await authStore.loginUser({ email: form.email, password: form.password });
      success.value = 'Вход выполнен успешно!';
      const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
      await router.push(redirectTarget);
    } else {
      await authStore.registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      success.value = 'Аккаунт создан! Добро пожаловать.';
    }
  } catch (err) {
    console.error('Auth request failed', err);
    success.value = '';
  }
};
</script>
