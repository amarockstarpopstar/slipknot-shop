<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <header class="page-header">
        <div>
          <span class="chip mb-2">Оплата</span>
          <h1 class="section-title">Оплата заказа</h1>
        </div>
      </header>

      <LoadingSpinner v-if="loading && !hasItems && !paymentSuccess" />

      <div v-else>
        <div v-if="paymentSuccess" class="payment-success">
          <div class="alert alert-success" role="alert">
            Заказ №{{ lastOrder?.orderId }} успешно оплачен. Сумма: {{ formatCurrency(lastOrder?.totalAmount ?? 0) }}
          </div>
          <div class="payment-status">
            <h2 class="payment-status__title">Статус отправки</h2>
            <p class="payment-status__value">{{ lastOrder?.shippingStatus }}</p>
            <p class="payment-status__meta">Обновлено: {{ formatDate(lastOrder?.shippingUpdatedAt ?? '') }}</p>
            <div class="payment-status__actions">
              <RouterLink class="btn btn-outline-light" to="/orders">Перейти к истории заказов</RouterLink>
              <RouterLink class="btn btn-danger" to="/">Продолжить покупки</RouterLink>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="!items.length" class="alert alert-info" role="alert">
            Корзина пуста. Добавьте товары, чтобы оформить заказ.
          </div>
          <div v-else class="checkout-layout">
            <div class="checkout-items">
              <article v-for="item in items" :key="item.id" class="checkout-item">
                <div class="checkout-item__image" v-if="item.product.imageUrl">
                  <img :src="item.product.imageUrl" :alt="item.product.title" loading="lazy" />
                </div>
                <div v-else class="checkout-item__placeholder">Фото</div>
                <div class="checkout-item__content">
                  <h2 class="checkout-item__title">{{ item.product.title }}</h2>
                  <p class="checkout-item__price">
                    Цена: {{ formatCurrency(item.unitPrice) }}
                  </p>
                  <p v-if="item.size" class="checkout-item__meta">
                    Размер: {{ item.size.size }} — {{ formatCurrency(item.size.price) }}
                  </p>
                  <p class="checkout-item__meta">Количество: {{ item.quantity }}</p>
                </div>
              </article>
            </div>
            <aside class="checkout-summary">
              <h2 class="checkout-summary__title">К оплате</h2>
              <p class="checkout-summary__line">Товаров: <span>{{ totalQuantity }}</span></p>
              <p class="checkout-summary__line">Сумма: <span>{{ formatCurrency(totalAmount) }}</span></p>
              <button
                type="button"
                class="btn btn-danger w-100"
                @click="payOrder"
                :disabled="updating || !items.length || addressSaving"
              >
                Оплатить
              </button>
            </aside>
          </div>
        </div>

        <p v-if="localError" class="alert alert-danger mt-4 mb-0">{{ localError }}</p>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="showCountryModal"
      class="modal fade show glass-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-limit-modal"
      @click.self="closeCountryModal"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="country-limit-modal" class="modal-title h5 mb-0">Заказ недоступен</h2>
            <button type="button" class="btn-close" aria-label="Закрыть" @click="closeCountryModal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ countryModalMessage || 'Оформление заказов доступно только пользователям из России.' }}</p>
          </div>
          <div class="modal-footer modal-footer--stacked">
            <button type="button" class="btn btn-outline-secondary" @click="closeCountryModal">Понятно</button>
            <button type="button" class="btn btn-danger" @click="handleCountryModalProfileRedirect">
              Перейти в профиль
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCountryModal" class="modal-backdrop fade show"></div>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="showAddressModal"
      class="modal fade show glass-modal"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-address-modal"
      @click.self="closeAddressModal"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <form @submit.prevent="submitAddress">
            <div class="modal-header">
              <h2 id="checkout-address-modal" class="modal-title h5 mb-0">Укажите адрес доставки</h2>
              <button
                type="button"
                class="btn-close"
                aria-label="Закрыть"
                @click="closeAddressModal"
                :disabled="addressSaving"
              ></button>
            </div>
            <div class="modal-body">
              <p class="modal-subtitle text-muted">Для оформления заказа заполните все поля.</p>
              <div class="modal-form-grid">
                <div class="modal-form-grid__item">
                  <label for="checkoutCountry" class="form-label">Страна</label>
                  <select id="checkoutCountry" v-model="addressForm.country" class="form-select" required>
                    <option value="">Выберите страну</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>
                <div class="modal-form-grid__item">
                  <label :for="addressForm.useCustomCity ? 'checkoutCityCustom' : 'checkoutCity'" class="form-label">
                    Город
                  </label>
                  <div class="modal-inline-field">
                    <select
                      v-if="!addressForm.useCustomCity"
                      id="checkoutCity"
                      v-model="addressForm.city"
                      class="form-select"
                      :disabled="!addressForm.country"
                      required
                    >
                      <option value="">Выберите город</option>
                      <option v-for="cityOption in addressCityOptions" :key="cityOption" :value="cityOption">
                        {{ cityOption }}
                      </option>
                    </select>
                    <input
                      v-else
                      id="checkoutCityCustom"
                      v-model="addressForm.customCity"
                      type="text"
                      class="form-control"
                      placeholder="Введите город"
                      required
                    />
                    <button type="button" class="btn btn-outline-secondary" @click="toggleAddressCityInput">
                      {{ addressForm.useCustomCity ? 'Выбрать из списка' : 'Ввести' }}
                    </button>
                  </div>
                  <small class="text-muted">Выберите город или введите свой</small>
                </div>
                <div class="modal-form-grid__item modal-form-grid__item--full">
                  <label for="checkoutAddress" class="form-label">Адрес</label>
                  <textarea
                    id="checkoutAddress"
                    v-model="addressForm.address"
                    class="form-control"
                    rows="3"
                    placeholder="Улица, дом, квартира"
                    required
                  ></textarea>
                </div>
              </div>
              <p v-if="addressError" class="alert alert-danger mt-3 mb-0">{{ addressError }}</p>
            </div>
            <div class="modal-footer modal-footer--stacked">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="closeAddressModal"
                :disabled="addressSaving"
              >
                Отмена
              </button>
              <button type="submit" class="btn btn-danger" :disabled="addressSaving">
                {{ addressSaving ? 'Сохранение...' : 'Сохранить адрес' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showAddressModal" class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { extractErrorMessage } from '../api/http';
import { SUPPORTED_COUNTRIES, getCitiesByCountry, isRussianCountry } from '../utils/location';
import { useNavigation } from '../composables/useNavigation';
import { useScrollLock } from '../composables/useScrollLock';

const cartStore = useCartStore();
const { items, totalAmount, totalQuantity, loading, updating, error, lastOrder } = storeToRefs(cartStore);

const localError = ref<string | null>(null);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const paymentSuccess = computed(() => Boolean(lastOrder.value && lastOrder.value.paidAt));
const hasItems = computed(() => items.value.length > 0);

const countries = [...SUPPORTED_COUNTRIES];

const addressForm = reactive({
  country: '',
  city: '',
  customCity: '',
  useCustomCity: false,
  address: '',
});

const addressSaving = ref(false);
const addressError = ref<string | null>(null);
const showCountryModal = ref(false);
const countryModalMessage = ref('');
const showAddressModal = ref(false);

useScrollLock(showCountryModal);
useScrollLock(showAddressModal);

const { goToProfile } = useNavigation();

const addressCityOptions = computed(() => getCitiesByCountry(addressForm.country));

const hasRussianCountry = computed(() => isRussianCountry(user.value?.country));
const hasUserCity = computed(() => (user.value?.city ?? '').trim().length > 0);
const hasUserAddress = computed(() => (user.value?.address ?? '').trim().length > 0);

const resolveCountryErrorMessage = () => {
  const selectedCountry = (user.value?.country ?? '').trim();
  if (!selectedCountry) {
    return 'Укажите Россию в профиле, чтобы оформить заказ.';
  }
  return `Оформление доступно только для России. Сейчас выбран адрес: «${selectedCountry}».`;
};

const fillAddressFormFromProfile = () => {
  const profileCountry = (user.value?.country ?? '').trim();
  addressForm.country = profileCountry || SUPPORTED_COUNTRIES[0];

  const profileCity = (user.value?.city ?? '').trim();
  const options = getCitiesByCountry(addressForm.country);
  addressForm.useCustomCity = Boolean(profileCity && !options.includes(profileCity));
  if (addressForm.useCustomCity) {
    addressForm.customCity = profileCity;
    addressForm.city = '';
  } else {
    addressForm.city = profileCity;
    addressForm.customCity = '';
  }

  addressForm.address = (user.value?.address ?? '').trim();
};

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatDate = (value: string) => {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const payOrder = async () => {
  if (!user.value) {
    return;
  }
  if (!hasRussianCountry.value) {
    countryModalMessage.value = resolveCountryErrorMessage();
    showCountryModal.value = true;
    return;
  }
  if (!hasUserCity.value || !hasUserAddress.value) {
    fillAddressFormFromProfile();
    addressError.value = 'Укажите город и полный адрес доставки.';
    showAddressModal.value = true;
    return;
  }

  localError.value = null;
  await cartStore.payOrder();
  if (error.value) {
    localError.value = error.value;
  }
};

const closeCountryModal = () => {
  showCountryModal.value = false;
  countryModalMessage.value = '';
};

const handleCountryModalProfileRedirect = async () => {
  closeCountryModal();
  await goToProfile();
};

const closeAddressModal = () => {
  if (addressSaving.value) {
    return;
  }
  showAddressModal.value = false;
};

const toggleAddressCityInput = () => {
  addressForm.useCustomCity = !addressForm.useCustomCity;
  addressForm.city = '';
  addressForm.customCity = '';
};

const submitAddress = async () => {
  addressSaving.value = true;
  addressError.value = null;
  try {
    const country = addressForm.country.trim();
    const city = (addressForm.useCustomCity ? addressForm.customCity : addressForm.city).trim();
    const addressLine = addressForm.address.trim();

    if (!country) {
      addressError.value = 'Выберите страну доставки.';
      addressSaving.value = false;
      return;
    }

    if (!isRussianCountry(country)) {
      addressSaving.value = false;
      countryModalMessage.value = 'Для оформления заказа выберите страну «Россия».';
      showAddressModal.value = false;
      showCountryModal.value = true;
      return;
    }

    if (!city) {
      addressError.value = 'Укажите город доставки.';
      addressSaving.value = false;
      return;
    }

    if (!addressLine) {
      addressError.value = 'Введите полный адрес доставки.';
      addressSaving.value = false;
      return;
    }

    await authStore.updateProfile({
      country,
      city,
      address: addressLine,
    });
    fillAddressFormFromProfile();
    showAddressModal.value = false;
  } catch (err) {
    addressError.value = extractErrorMessage(err) ?? 'Не удалось сохранить адрес. Попробуйте ещё раз.';
  } finally {
    addressSaving.value = false;
  }
};

watch(error, (value) => {
  if (value) {
    localError.value = value;
  }
});

watch(
  () => user.value,
  () => {
    if (!showAddressModal.value) {
      return;
    }
    fillAddressFormFromProfile();
  },
  { deep: true },
);

watch(showAddressModal, (visible) => {
  if (visible) {
    fillAddressFormFromProfile();
  } else {
    addressError.value = null;
  }
});

onMounted(() => {
  void cartStore.loadCart();
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.payment-success {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.payment-status {
  padding: 1.75rem;
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
}

.payment-status__title {
  margin: 0 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 600;
}

.payment-status__value {
  margin: 0 0 0.3rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.payment-status__meta {
  margin: 0 0 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.payment-status__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.checkout-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.checkout-item {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.checkout-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.checkout-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
}

.checkout-item__placeholder {
  display: grid;
  place-items: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-alt) 80%, transparent);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.checkout-item__title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.checkout-item__price,
.checkout-item__meta {
  margin: 0;
  color: var(--color-text-muted);
}

.checkout-summary {
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 120px;
}

.checkout-summary__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.checkout-summary__line {
  display: flex;
  justify-content: space-between;
  margin: 0;
  color: var(--color-text-muted);
  font-weight: 500;
}

.checkout-summary__line span {
  color: var(--color-text);
}

@media (max-width: 991.98px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .checkout-item {
    grid-template-columns: 1fr;
  }
}
</style>
