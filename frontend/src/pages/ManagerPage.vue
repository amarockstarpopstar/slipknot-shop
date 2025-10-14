<template>
  <section class="section fade-in-up">
    <div class="layout-container manager-page">
      <header class="manager-header">
        <div>
          <span class="chip mb-2">Менеджмент</span>
          <h1 class="section-title mb-1">Панель менеджера</h1>
          <p class="section-subtitle mb-0">Управляйте товарами и заказами магазина.</p>
        </div>
      </header>

      <div v-if="globalError" class="alert alert-danger" role="alert">{{ globalError }}</div>
      <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>

      <LoadingSpinner v-if="initialLoading" />

      <div v-else class="manager-grid">
        <section class="manager-block">
          <div class="manager-block__header">
            <h2 class="manager-block__title">Товары</h2>
            <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="productsLoading">
              Обновить список
            </button>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0 manager-table">
              <colgroup>
                <col style="width: 5rem" />
                <col style="width: 18rem" />
                <col style="width: 12rem" />
                <col style="width: 10rem" />
                <col style="width: 9rem" />
                <col style="width: 12rem" />
                <col style="width: 10rem" />
                <col style="width: 11rem" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Название</th>
                  <th scope="col">Артикул</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Остаток</th>
                  <th scope="col">Категория</th>
                  <th scope="col">Размер</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <th scope="row">{{ product.id }}</th>
                  <td>{{ product.title }}</td>
                  <td>{{ product.sku }}</td>
                  <td>{{ formatCurrency(product.price) }}</td>
                  <td>{{ product.stockCount }}</td>
                  <td>{{ product.category ? product.category.name : '—' }}</td>
                  <td>{{ product.size ? product.size.name : '—' }}</td>
                  <td class="text-end manager-table__actions">
                    <button class="btn btn-sm btn-outline-primary" @click="startEditProduct(product)">
                      Редактировать
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeProduct(product)">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr v-if="!products.length">
                  <td colspan="8" class="text-center text-muted py-4">Товары не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="productForm" class="manager-form">
            <h3 class="manager-form__title">Редактирование товара #{{ productForm.id }}</h3>
            <form @submit.prevent="saveProduct" class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="productTitle">Название</label>
                <input
                  id="productTitle"
                  v-model="productForm.title"
                  type="text"
                  class="form-control"
                  placeholder="Введите название"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="productSku">Артикул</label>
                <input
                  id="productSku"
                  v-model="productForm.sku"
                  type="text"
                  class="form-control"
                  placeholder="Артикул"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="productPrice">Цена (₽)</label>
                <input
                  id="productPrice"
                  v-model="productForm.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="productStock">Остаток</label>
                <input
                  id="productStock"
                  v-model="productForm.stockCount"
                  type="number"
                  min="0"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="productCategory">Категория</label>
                <select id="productCategory" v-model="productForm.categoryId" class="form-select" required>
                  <option value="">Выберите категорию</option>
                  <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="productSize">Размер</label>
                <select id="productSize" v-model="productForm.sizeId" class="form-select">
                  <option value="">Без размера</option>
                  <option v-for="size in sizes" :key="size.id" :value="String(size.id)">
                    {{ size.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label" for="productImage">Ссылка на изображение</label>
                <input
                  id="productImage"
                  v-model="productForm.imageUrl"
                  type="url"
                  class="form-control"
                  placeholder="https://"
                />
              </div>
              <div class="col-12">
                <label class="form-label" for="productDescription">Описание</label>
                <textarea
                  id="productDescription"
                  v-model="productForm.description"
                  class="form-control"
                  rows="3"
                  placeholder="Короткое описание товара"
                ></textarea>
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                <button class="btn btn-primary" type="submit" :disabled="productSaving">
                  Сохранить изменения
                </button>
                <button class="btn btn-outline-secondary" type="button" @click="cancelProductEdit" :disabled="productSaving">
                  Отменить
                </button>
              </div>
            </form>
          </div>
        </section>

        <section class="manager-block">
          <div class="manager-block__header">
            <h2 class="manager-block__title">Заказы</h2>
            <button class="btn btn-outline-secondary" @click="refreshOrders" :disabled="ordersLoading">
              Обновить список
            </button>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0 manager-table">
              <colgroup>
                <col style="width: 5rem" />
                <col style="width: 18rem" />
                <col style="width: 11rem" />
                <col style="width: 14rem" />
                <col style="width: 10rem" />
                <col style="width: 12rem" />
                <col style="width: 8rem" />
                <col style="width: 13rem" />
                <col style="width: 12rem" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Покупатель</th>
                  <th scope="col">Статус</th>
                  <th scope="col">Отправка</th>
                  <th scope="col">Сумма</th>
                  <th scope="col">Способ оплаты</th>
                  <th scope="col">Позиций</th>
                  <th scope="col">Обновлён</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <th scope="row">{{ order.id }}</th>
                  <td>
                    <div class="fw-semibold">{{ order.customer.name }}</div>
                    <div class="text-muted small">{{ order.customer.email }}</div>
                  </td>
                  <td>{{ order.status.name }}</td>
                  <td>
                    <div class="fw-semibold">{{ order.shippingStatus }}</div>
                    <div class="text-muted small">{{ formatDate(order.shippingUpdatedAt) }}</div>
                  </td>
                  <td>{{ formatCurrency(order.totalAmount) }}</td>
                  <td>{{ order.paymentMethod || '—' }}</td>
                  <td>{{ order.items.length }}</td>
                  <td>{{ formatDate(order.updatedAt) }}</td>
                  <td class="text-end manager-table__actions">
                    <button class="btn btn-sm btn-outline-primary" @click="startEditOrder(order)">
                      Редактировать
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeOrder(order)">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr v-if="!orders.length">
                  <td colspan="9" class="text-center text-muted py-4">Заказы не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="orderForm" class="manager-form">
            <h3 class="manager-form__title">Редактирование заказа #{{ orderForm.id }}</h3>
            <form @submit.prevent="saveOrder" class="row g-3">
              <div class="col-md-3">
                <label class="form-label" for="orderStatus">Статус</label>
                <select id="orderStatus" v-model="orderForm.statusId" class="form-select" required>
                  <option value="">Выберите статус</option>
                  <option v-for="status in orderStatuses" :key="status.id" :value="String(status.id)">
                    {{ status.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="orderShippingStatus">Статус отправки</label>
                <select id="orderShippingStatus" v-model="orderForm.shippingStatus" class="form-select" required>
                  <option v-for="option in shippingStatusOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label" for="orderTotal">Сумма (₽)</label>
                <input
                  id="orderTotal"
                  v-model="orderForm.totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label" for="orderPayment">Способ оплаты</label>
                <input
                  id="orderPayment"
                  v-model="orderForm.paymentMethod"
                  type="text"
                  class="form-control"
                  placeholder="Например, Банковская карта"
                />
              </div>
              <div class="col-12">
                <label class="form-label" for="orderComment">Комментарий</label>
                <textarea
                  id="orderComment"
                  v-model="orderForm.comment"
                  class="form-control"
                  rows="3"
                  placeholder="Комментарий к заказу"
                ></textarea>
              </div>
              <div class="col-12 d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                <button class="btn btn-primary" type="submit" :disabled="orderSaving">
                  Сохранить изменения
                </button>
                <button class="btn btn-outline-secondary" type="button" @click="cancelOrderEdit" :disabled="orderSaving">
                  Отменить
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
  type ProductDto,
  type UpdateProductPayload,
} from '../api/products';
import { fetchCategories, type CategoryDto } from '../api/categories';
import { fetchSizes, type SizeDto } from '../api/sizes';
import {
  fetchOrders,
  fetchOrderStatuses,
  updateOrder,
  deleteOrder,
  type OrderDto,
  type OrderStatusDto,
  type UpdateOrderPayload,
} from '../api/orders';
import { extractErrorMessage } from '../api/http';

interface ProductFormState {
  id: number;
  title: string;
  description: string;
  price: string;
  sku: string;
  stockCount: string;
  imageUrl: string;
  categoryId: string;
  sizeId: string;
}

interface OrderFormState {
  id: number;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
}

const products = ref<ProductDto[]>([]);
const orders = ref<OrderDto[]>([]);
const categories = ref<CategoryDto[]>([]);
const sizes = ref<SizeDto[]>([]);
const orderStatuses = ref<OrderStatusDto[]>([]);
const shippingStatusOptions = ref<string[]>(['Готовится к отправке', 'В пути', 'Доставлен']);

const initialLoading = ref(false);
const productsLoading = ref(false);
const ordersLoading = ref(false);
const productSaving = ref(false);
const orderSaving = ref(false);

const globalError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const productForm = ref<ProductFormState | null>(null);
const orderForm = ref<OrderFormState | null>(null);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return parsed.toLocaleString('ru-RU');
};

const ensureShippingStatusOption = (status: string | null | undefined) => {
  if (!status) {
    return;
  }
  if (!shippingStatusOptions.value.includes(status)) {
    shippingStatusOptions.value.push(status);
  }
};

const showError = (error: unknown) => {
  globalError.value = typeof error === 'string' ? error : extractErrorMessage(error);
  successMessage.value = null;
};

const showSuccess = (message: string) => {
  successMessage.value = message;
  globalError.value = null;
};

const loadInitialData = async () => {
  try {
    initialLoading.value = true;
    globalError.value = null;
    const [productsData, ordersData, categoriesData, sizesData, statusesData] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchSizes(),
      fetchOrderStatuses(),
    ]);
    products.value = productsData;
    orders.value = ordersData;
    categories.value = categoriesData;
    sizes.value = sizesData;
    orderStatuses.value = statusesData;
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
  } catch (error) {
    showError(error);
  } finally {
    initialLoading.value = false;
  }
};

const refreshProducts = async () => {
  try {
    productsLoading.value = true;
    products.value = await fetchProducts();
    showSuccess('Список товаров обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    productsLoading.value = false;
  }
};

const refreshOrders = async () => {
  try {
    ordersLoading.value = true;
    orders.value = await fetchOrders();
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    showSuccess('Список заказов обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    ordersLoading.value = false;
  }
};

const startEditProduct = (product: ProductDto) => {
  productForm.value = {
    id: product.id,
    title: product.title,
    description: product.description ?? '',
    price: product.price.toString(),
    sku: product.sku,
    stockCount: product.stockCount.toString(),
    imageUrl: product.imageUrl ?? '',
    categoryId: product.category ? String(product.category.id) : '',
    sizeId: product.size ? String(product.size.id) : '',
  };
};

const cancelProductEdit = () => {
  productForm.value = null;
};

const saveProduct = async () => {
  if (!productForm.value) {
    return;
  }
  try {
    productSaving.value = true;
    const payload: UpdateProductPayload = {
      title: productForm.value.title,
      description: productForm.value.description || undefined,
      price: Number(productForm.value.price),
      sku: productForm.value.sku,
      stockCount: Number(productForm.value.stockCount),
      imageUrl: productForm.value.imageUrl || undefined,
      categoryId: Number(productForm.value.categoryId),
      sizeId: productForm.value.sizeId ? Number(productForm.value.sizeId) : undefined,
    };
    await updateProduct(productForm.value.id, payload);
    await refreshProducts();
    productForm.value = null;
    showSuccess('Товар обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    productSaving.value = false;
  }
};

const removeProduct = async (product: ProductDto) => {
  try {
    await deleteProduct(product.id);
    await refreshProducts();
    showSuccess('Товар удалён.');
  } catch (error) {
    showError(error);
  }
};

const startEditOrder = (order: OrderDto) => {
  orderForm.value = {
    id: order.id,
    statusId: order.status ? String(order.status.id) : '',
    shippingStatus: order.shippingStatus ?? shippingStatusOptions.value[0],
    totalAmount: order.totalAmount.toString(),
    paymentMethod: order.paymentMethod ?? '',
    comment: order.comment ?? '',
  };
};

const cancelOrderEdit = () => {
  orderForm.value = null;
};

const saveOrder = async () => {
  if (!orderForm.value) {
    return;
  }
  try {
    orderSaving.value = true;
    const payload: UpdateOrderPayload = {
      statusId: Number(orderForm.value.statusId),
      shippingStatus: orderForm.value.shippingStatus,
      totalAmount: Number(orderForm.value.totalAmount),
      paymentMethod: orderForm.value.paymentMethod || undefined,
      comment: orderForm.value.comment || undefined,
    };
    await updateOrder(orderForm.value.id, payload);
    await refreshOrders();
    orderForm.value = null;
    showSuccess('Заказ обновлён.');
  } catch (error) {
    showError(error);
  } finally {
    orderSaving.value = false;
  }
};

const removeOrder = async (order: OrderDto) => {
  try {
    await deleteOrder(order.id);
    await refreshOrders();
    showSuccess('Заказ удалён.');
  } catch (error) {
    showError(error);
  }
};

onMounted(() => {
  void loadInitialData();
});
</script>

<style scoped>
.manager-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.manager-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 3vw, 3rem);
}

.manager-block {
  padding: clamp(1.75rem, 3vw, 2.5rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.manager-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.manager-block__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.manager-table {
  table-layout: fixed;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.manager-table th,
.manager-table td {
  vertical-align: middle;
  border-color: var(--color-surface-border);
  font-variant-numeric: tabular-nums;
}

.manager-table th {
  font-weight: 600;
  color: var(--color-text-muted);
}

.manager-table td:not(:nth-child(2)) {
  white-space: nowrap;
}

.manager-table td:nth-child(2) {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-table__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.manager-table__actions :deep(.btn) {
  margin: 0;
}

.manager-form {
  padding: clamp(1.5rem, 2.5vw, 2rem);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.manager-form__title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

@media (max-width: 575.98px) {
  .manager-block__header :deep(.btn) {
    width: 100%;
  }
}
</style>
