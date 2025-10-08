import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import App from './App.vue';
import { router } from './router';
import { useAuthStore } from './store/authStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore(pinia);

authStore
  .initialize()
  .catch(() => {
    // Session restore errors are handled inside the store.
  })
  .finally(() => {
    app.mount('#app');
  });
