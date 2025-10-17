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
            <div class="manager-block__actions">
              <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="productsLoading">
                Обновить список
              </button>
              <button class="btn btn-primary" type="button" @click="openAddProductModal">
                Добавить товар
              </button>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0 manager-table">
              <colgroup>
                <col style="width: 5rem" />
                <col style="width: 18rem" />
                <col style="width: 12rem" />
                <col style="width: 10rem" />
                <col style="width: 9rem" />
                <col style="width: 18rem" />
                <col style="width: 12rem" />
                <col style="width: 11rem" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Название</th>
                  <th scope="col">Артикул</th>
                  <th scope="col">Цена</th>
                  <th scope="col">Остаток</th>
                  <th scope="col">Размеры</th>
                  <th scope="col">Категория</th>
                  <th scope="col" class="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <th scope="row">{{ product.id }}</th>
                  <td>{{ product.title }}</td>
                  <td>{{ product.sku }}</td>
                  <td>{{ formatCurrency(product.price) }}</td>
                  <td>{{ getTotalStock(product) }}</td>
                  <td>{{ summarizeSizes(product) }}</td>
                  <td>{{ product.category ? product.category.name : '—' }}</td>
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
                <label class="form-label" for="productCategory">Категория</label>
                <select id="productCategory" v-model="productForm.categoryId" class="form-select" required>
                  <option value="">Выберите категорию</option>
                  <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <div class="manager-sizes">
                  <div class="manager-sizes__header">
                    <label class="form-label mb-0">Размеры и остатки</label>
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      @click="addSizeRow(productForm.sizes)"
                      :disabled="productSaving"
                    >
                      Добавить размер
                    </button>
                  </div>
                  <div class="manager-sizes__list">
                    <div
                      v-for="(sizeRow, index) in productForm.sizes"
                      :key="sizeRow.id ?? `product-size-${index}`"
                      class="manager-sizes__row row g-3 align-items-end"
                    >
                      <div class="col-md-4 col-sm-6">
                        <label
                          class="form-label"
                          :for="`productSizeName-${productForm.id}-${index}`"
                        >
                          Размер
                        </label>
                        <input
                          :id="`productSizeName-${productForm.id}-${index}`"
                          v-model="sizeRow.size"
                          type="text"
                          class="form-control"
                          placeholder="Например, M"
                          maxlength="20"
                          :disabled="productSaving"
                        />
                      </div>
                      <div class="col-md-3 col-sm-6">
                        <label
                          class="form-label"
                          :for="`productSizeStock-${productForm.id}-${index}`"
                        >
                          Остаток
                        </label>
                        <input
                          :id="`productSizeStock-${productForm.id}-${index}`"
                          v-model="sizeRow.stock"
                          type="number"
                          min="0"
                          class="form-control"
                          :disabled="productSaving"
                        />
                      </div>
                      <div class="col-md-2 col-sm-4">
                        <button
                          type="button"
                          class="btn btn-outline-danger mt-4 w-100"
                          @click="removeSizeRow(productForm.sizes, index)"
                          :disabled="productSaving"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
            <div class="manager-block__actions">
              <button class="btn btn-outline-secondary" @click="refreshOrders" :disabled="ordersLoading">
                Обновить список
              </button>
              <button class="btn btn-primary" type="button" @click="openAddOrderModal">
                Добавить заказ
              </button>
            </div>
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

        <section class="manager-block manager-block--analytics">
          <div class="manager-block__header">
            <h2 class="manager-block__title">Аналитика продаж</h2>
            <div class="manager-block__actions">
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="refreshDailySales"
                :disabled="reportsLoading"
              >
                Обновить данные
              </button>
              <button
                class="btn btn-primary"
                type="button"
                @click="downloadSalesExcel"
                :disabled="reportsExportLoading || !reportsHasData"
              >
                Скачать Excel
              </button>
            </div>
          </div>

          <p class="manager-block__subtitle">
            Анализируйте динамику заказов по дням и формируйте отчёт для коллег в один клик.
          </p>

          <div v-if="reportsError" class="alert alert-warning" role="alert">
            {{ reportsError }}
          </div>

          <LoadingSpinner v-if="reportsLoading" />

          <div v-else-if="reportsHasData" class="manager-analytics">
            <SalesChart
              :labels="chartLabels"
              :revenue="chartRevenue"
              :items="chartItems"
              :orders="chartOrders"
            />

            <div class="manager-analytics__summary">
              <div class="summary-card">
                <span class="summary-card__label">Выручка за период</span>
                <span class="summary-card__value">{{ formattedTotalRevenue }}</span>
              </div>
              <div class="summary-card">
                <span class="summary-card__label">Заказов</span>
                <span class="summary-card__value">{{ reportsTotalOrders }}</span>
              </div>
              <div class="summary-card">
                <span class="summary-card__label">Продано единиц</span>
                <span class="summary-card__value">{{ reportsTotalItems }}</span>
              </div>
              <div class="summary-card">
                <span class="summary-card__label">Последняя продажа</span>
                <span class="summary-card__value">{{ formattedLastSaleDate ?? '—' }}</span>
              </div>
            </div>
          </div>

          <div v-else class="manager-empty">
            <p class="manager-empty__title">Продажи ещё не зарегистрированы</p>
            <p class="manager-empty__subtitle">
              Как только появятся первые заказы, здесь появится интерактивный график с динамикой и
              итогами продаж.
            </p>
            <button class="btn btn-outline-light" type="button" @click="refreshDailySales">
              Проверить ещё раз
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>

  <div v-if="addProductModalVisible" class="modal fade show d-block glass-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5 mb-0">Новый товар</h2>
          <button type="button" class="btn-close" aria-label="Закрыть" @click="closeAddProductModal"></button>
        </div>
        <form @submit.prevent="saveNewProduct">
          <div class="modal-body">
            <p class="modal-subtitle text-muted">
              Заполните карточку товара. Все поля можно отредактировать в любой момент.
            </p>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="newProductTitle" class="form-label">Название</label>
                <input
                  id="newProductTitle"
                  v-model="addProductForm.title"
                  type="text"
                  class="form-control"
                  placeholder="Например, Толстовка Slipknot"
                  required
                  :disabled="creatingProduct"
                />
              </div>
              <div class="col-md-6">
                <label for="newProductSku" class="form-label">Артикул</label>
                <input
                  id="newProductSku"
                  v-model="addProductForm.sku"
                  type="text"
                  class="form-control"
                  placeholder="SKU-001"
                  required
                  :disabled="creatingProduct"
                />
              </div>
              <div class="col-md-4">
                <label for="newProductPrice" class="form-label">Цена (₽)</label>
                <input
                  id="newProductPrice"
                  v-model="addProductForm.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  required
                  :disabled="creatingProduct"
                />
              </div>
              <div class="col-md-4">
                <label for="newProductCategory" class="form-label">Категория</label>
                <select
                  id="newProductCategory"
                  v-model="addProductForm.categoryId"
                  class="form-select"
                  required
                  :disabled="creatingProduct"
                >
                  <option value="">Выберите категорию</option>
                  <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <div class="manager-sizes">
                  <div class="manager-sizes__header">
                    <label class="form-label mb-0">Размеры и остатки</label>
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      @click="addSizeRow(addProductForm.sizes)"
                      :disabled="creatingProduct"
                    >
                      Добавить размер
                    </button>
                  </div>
                  <div class="manager-sizes__list">
                    <div
                      v-for="(sizeRow, index) in addProductForm.sizes"
                      :key="sizeRow.id ?? `new-product-size-${index}`"
                      class="manager-sizes__row row g-3 align-items-end"
                    >
                      <div class="col-md-4 col-sm-6">
                        <label
                          class="form-label"
                          :for="`newProductSizeName-${index}`"
                        >
                          Размер
                        </label>
                        <input
                          :id="`newProductSizeName-${index}`"
                          v-model="sizeRow.size"
                          type="text"
                          class="form-control"
                          placeholder="Например, M"
                          maxlength="20"
                          :disabled="creatingProduct"
                        />
                      </div>
                      <div class="col-md-3 col-sm-6">
                        <label
                          class="form-label"
                          :for="`newProductSizeStock-${index}`"
                        >
                          Остаток
                        </label>
                        <input
                          :id="`newProductSizeStock-${index}`"
                          v-model="sizeRow.stock"
                          type="number"
                          min="0"
                          class="form-control"
                          :disabled="creatingProduct"
                        />
                      </div>
                      <div class="col-md-2 col-sm-4">
                        <button
                          type="button"
                          class="btn btn-outline-danger mt-4 w-100"
                          @click="removeSizeRow(addProductForm.sizes, index)"
                          :disabled="creatingProduct"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <label for="newProductImage" class="form-label">Ссылка на изображение</label>
                <input
                  id="newProductImage"
                  v-model="addProductForm.imageUrl"
                  type="url"
                  class="form-control"
                  placeholder="https://"
                  :disabled="creatingProduct"
                />
              </div>
              <div class="col-12">
                <label for="newProductDescription" class="form-label">Описание</label>
                <textarea
                  id="newProductDescription"
                  v-model="addProductForm.description"
                  class="form-control"
                  rows="3"
                  placeholder="Коротко опишите товар"
                  :disabled="creatingProduct"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer modal-footer--stacked">
            <button type="button" class="btn btn-outline-secondary" @click="closeAddProductModal" :disabled="creatingProduct">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creatingProduct">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="addProductModalVisible" class="modal-backdrop fade show"></div>

  <div v-if="addOrderModalVisible" class="modal fade show d-block glass-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5 mb-0">Новый заказ</h2>
          <button type="button" class="btn-close" aria-label="Закрыть" @click="closeAddOrderModal"></button>
        </div>
        <form @submit.prevent="saveNewOrder">
          <div class="modal-body">
            <p class="modal-subtitle text-muted">
              Создайте новый заказ и зафиксируйте ключевые данные клиента и доставки.
            </p>
            <div class="row g-3">
              <div class="col-md-6">
                <label for="newOrderUser" class="form-label">Покупатель</label>
                <select
                  id="newOrderUser"
                  v-model="addOrderForm.userId"
                  class="form-select"
                  required
                  :disabled="creatingOrder || !orderCustomers.length"
                >
                  <option value="">Выберите покупателя</option>
                  <option v-for="customer in orderCustomers" :key="customer.id" :value="String(customer.id)">
                    {{ customer.name }} • {{ customer.email }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="newOrderStatus" class="form-label">Статус</label>
                <select
                  id="newOrderStatus"
                  v-model="addOrderForm.statusId"
                  class="form-select"
                  required
                  :disabled="creatingOrder"
                >
                  <option value="">Выберите статус</option>
                  <option v-for="status in orderStatuses" :key="status.id" :value="String(status.id)">
                    {{ status.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="newOrderShipping" class="form-label">Статус отправки</label>
                <select
                  id="newOrderShipping"
                  v-model="addOrderForm.shippingStatus"
                  class="form-select"
                  required
                  :disabled="creatingOrder"
                >
                  <option v-for="option in shippingStatusOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="newOrderTotal" class="form-label">Сумма (₽)</label>
                <input
                  id="newOrderTotal"
                  v-model="addOrderForm.totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  required
                  :disabled="creatingOrder"
                />
              </div>
              <div class="col-md-6">
                <label for="newOrderPayment" class="form-label">Способ оплаты</label>
                <input
                  id="newOrderPayment"
                  v-model="addOrderForm.paymentMethod"
                  type="text"
                  class="form-control"
                  placeholder="Например, Банковская карта"
                  :disabled="creatingOrder"
                />
              </div>
              <div class="col-md-6">
                <label for="newOrderAddress" class="form-label">ID адреса (опционально)</label>
                <input
                  id="newOrderAddress"
                  v-model="addOrderForm.addressId"
                  type="number"
                  min="1"
                  class="form-control"
                  placeholder="Укажите при необходимости"
                  :disabled="creatingOrder"
                />
              </div>
              <div class="col-12">
                <label for="newOrderComment" class="form-label">Комментарий</label>
                <textarea
                  id="newOrderComment"
                  v-model="addOrderForm.comment"
                  class="form-control"
                  rows="3"
                  placeholder="Дополнительная информация для сборки или доставки"
                  :disabled="creatingOrder"
                ></textarea>
              </div>
              <div v-if="!orderCustomers.length" class="col-12">
                <div class="manager-modal__empty">
                  Нет доступных покупателей. Добавьте пользователя в разделе администрирования.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer modal-footer--stacked">
            <button type="button" class="btn btn-outline-secondary" @click="closeAddOrderModal" :disabled="creatingOrder">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creatingOrder || !orderCustomers.length">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="addOrderModalVisible" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import SalesChart from '../components/SalesChart.vue';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductDto,
  type ProductSizePayload,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '../api/products';
import { fetchCategories, type CategoryDto } from '../api/categories';
import {
  fetchOrders,
  fetchOrderStatuses,
  fetchOrderCustomers,
  createOrder,
  updateOrder,
  deleteOrder,
  type OrderDto,
  type OrderStatusDto,
  type OrderCustomerDto,
  type CreateOrderPayload,
  type UpdateOrderPayload,
} from '../api/orders';
import { extractErrorMessage } from '../api/http';
import { useReportsStore } from '../store/reportsStore';

interface EditableProductSize {
  id: number | null;
  size: string;
  stock: string;
}

interface ProductFormState {
  id: number;
  title: string;
  description: string;
  price: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
  sizes: EditableProductSize[];
}

interface NewProductFormState {
  title: string;
  description: string;
  price: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
  sizes: EditableProductSize[];
}

interface OrderFormState {
  id: number;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
}

interface NewOrderFormState {
  userId: string;
  statusId: string;
  shippingStatus: string;
  totalAmount: string;
  paymentMethod: string;
  comment: string;
  addressId: string;
}

const products = ref<ProductDto[]>([]);
const orders = ref<OrderDto[]>([]);
const categories = ref<CategoryDto[]>([]);
const orderStatuses = ref<OrderStatusDto[]>([]);
const orderCustomers = ref<OrderCustomerDto[]>([]);
const shippingStatusOptions = ref<string[]>(['Готовится к отправке', 'В пути', 'Доставлен']);

const initialLoading = ref(false);
const productsLoading = ref(false);
const ordersLoading = ref(false);
const productSaving = ref(false);
const orderSaving = ref(false);
const creatingProduct = ref(false);
const creatingOrder = ref(false);

const globalError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const productForm = ref<ProductFormState | null>(null);
const orderForm = ref<OrderFormState | null>(null);
const addProductModalVisible = ref(false);
const addOrderModalVisible = ref(false);
const addProductForm = reactive<NewProductFormState>({
  title: '',
  description: '',
  price: '',
  sku: '',
  imageUrl: '',
  categoryId: '',
  sizes: [],
});
const addOrderForm = reactive<NewOrderFormState>({
  userId: '',
  statusId: '',
  shippingStatus: shippingStatusOptions.value[0] ?? 'Готовится к отправке',
  totalAmount: '',
  paymentMethod: '',
  comment: '',
  addressId: '',
});

const reportsStore = useReportsStore();
const {
  dailySales: reportDailySales,
  loading: reportsLoading,
  exportLoading: reportsExportLoading,
  error: reportsError,
  hasData: reportsHasData,
  totalRevenue: reportTotalRevenue,
  lastSaleDate: reportLastSaleDate,
} = storeToRefs(reportsStore);

const chartLabels = computed(() =>
  reportDailySales.value.map((point) =>
    new Date(point.saleDate).toLocaleDateString('ru-RU'),
  ),
);
const chartRevenue = computed(() =>
  reportDailySales.value.map((point) => Number(point.totalAmount.toFixed(2))),
);
const chartItems = computed(() =>
  reportDailySales.value.map((point) => point.totalItems),
);
const chartOrders = computed(() =>
  reportDailySales.value.map((point) => point.totalOrders),
);
const formattedTotalRevenue = computed(() =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(reportTotalRevenue.value),
);
const formattedLastSaleDate = computed(() =>
  reportLastSaleDate.value
    ? new Date(reportLastSaleDate.value).toLocaleDateString('ru-RU')
    : null,
);
const reportsTotalOrders = computed(() =>
  reportDailySales.value.reduce((sum, item) => sum + item.totalOrders, 0),
);
const reportsTotalItems = computed(() =>
  reportDailySales.value.reduce((sum, item) => sum + item.totalItems, 0),
);

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

const toEditableSizes = (sizes: ProductDto['sizes']): EditableProductSize[] => {
  if (!sizes.length) {
    return [{ id: null, size: '', stock: '' }];
  }

  return sizes.map((size) => ({
    id: size.id,
    size: size.size,
    stock: size.stock.toString(),
  }));
};

const buildSizePayload = (sizes: EditableProductSize[]): ProductSizePayload[] => {
  const payload: ProductSizePayload[] = [];
  const seen = new Set<string>();

  for (const size of sizes) {
    const trimmed = size.size.trim();
    if (!trimmed) {
      continue;
    }

    const normalizedName = trimmed.toLowerCase();
    if (seen.has(normalizedName)) {
      throw new Error(`Размер "${trimmed}" указан несколько раз.`);
    }

    const stockValue = Number(size.stock);
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      throw new Error(`Некорректное значение остатка для размера "${trimmed}".`);
    }

    seen.add(normalizedName);
    payload.push({ size: trimmed, stock: Math.floor(stockValue) });
  }

  return payload;
};

const addSizeRow = (rows: EditableProductSize[]) => {
  rows.push({ id: null, size: '', stock: '' });
};

const removeSizeRow = (rows: EditableProductSize[], index: number) => {
  if (rows.length <= 1) {
    rows.splice(0, rows.length, { id: null, size: '', stock: '' });
    return;
  }

  rows.splice(index, 1);
};

const getTotalStock = (product: ProductDto): number =>
  product.sizes.reduce((sum, size) => sum + size.stock, 0);

const summarizeSizes = (product: ProductDto): string => {
  if (!product.sizes.length) {
    return '—';
  }

  return product.sizes
    .map((size) => `${size.size} — ${size.stock}`)
    .join(', ');
};

const getDefaultShippingStatus = () => shippingStatusOptions.value[0] ?? 'Готовится к отправке';
const getDefaultStatusId = () => (orderStatuses.value.length ? String(orderStatuses.value[0].id) : '');

const resetAddProductForm = () => {
  Object.assign(addProductForm, {
    title: '',
    description: '',
    price: '',
    sku: '',
    imageUrl: '',
    categoryId: '',
    sizes: [{ id: null, size: '', stock: '' }],
  });
};

const resetAddOrderForm = () => {
  Object.assign(addOrderForm, {
    userId: '',
    statusId: getDefaultStatusId(),
    shippingStatus: getDefaultShippingStatus(),
    totalAmount: '',
    paymentMethod: '',
    comment: '',
    addressId: '',
  });
};

const toggleAddProductModal = (visible: boolean) => {
  if (visible) {
    resetAddProductForm();
  }
  addProductModalVisible.value = visible;
};

const toggleAddOrderModal = (visible: boolean) => {
  if (visible) {
    resetAddOrderForm();
  }
  addOrderModalVisible.value = visible;
};

const refreshOrderCustomers = async (silent = false) => {
  try {
    orderCustomers.value = await fetchOrderCustomers();
  } catch (error) {
    if (!silent) {
      showError(error);
    }
  }
};

const openAddProductModal = () => {
  toggleAddProductModal(true);
};

const closeAddProductModal = () => {
  toggleAddProductModal(false);
};

const openAddOrderModal = () => {
  toggleAddOrderModal(true);
  void refreshOrderCustomers(true);
};

const closeAddOrderModal = () => {
  toggleAddOrderModal(false);
};

const loadInitialData = async () => {
  try {
    initialLoading.value = true;
    globalError.value = null;
    const [
      productsData,
      ordersData,
      categoriesData,
      statusesData,
      customersData,
    ] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchCategories(),
      fetchOrderStatuses(),
      fetchOrderCustomers(),
    ]);
    products.value = productsData;
    orders.value = ordersData;
    categories.value = categoriesData;
    orderStatuses.value = statusesData;
    orderCustomers.value = customersData;
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    resetAddOrderForm();
    await reportsStore.loadDailySales();
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
    await refreshOrderCustomers(true);
    await reportsStore.loadDailySales();
  } catch (error) {
    showError(error);
  } finally {
    ordersLoading.value = false;
  }
};

const refreshDailySales = async () => {
  const result = await reportsStore.loadDailySales();
  if (result && result.length) {
    showSuccess('Данные продаж обновлены.');
  } else if (reportsError.value) {
    showError(reportsError.value);
  }
};

const downloadSalesExcel = async () => {
  try {
    const blob = await reportsStore.downloadDailySalesReport();
    const url = URL.createObjectURL(blob);
    const filename = `sales-report-${
      reportLastSaleDate.value ?? new Date().toISOString().split('T')[0]
    }.xlsx`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Excel-отчёт сформирован.');
  } catch (error) {
    showError(error);
  }
};

const startEditProduct = (product: ProductDto) => {
  productForm.value = {
    id: product.id,
    title: product.title,
    description: product.description ?? '',
    price: product.price.toString(),
    sku: product.sku,
    imageUrl: product.imageUrl ?? '',
    categoryId: product.category ? String(product.category.id) : '',
    sizes: toEditableSizes(product.sizes),
  };
};

const cancelProductEdit = () => {
  productForm.value = null;
};

const saveNewProduct = async () => {
  if (
    !addProductForm.title ||
    !addProductForm.sku ||
    !addProductForm.price ||
    !addProductForm.categoryId
  ) {
    return;
  }

  let sizePayload: ProductSizePayload[] = [];
  try {
    sizePayload = buildSizePayload(addProductForm.sizes);
  } catch (error) {
    showError(error);
    return;
  }

  try {
    creatingProduct.value = true;
    const payload: CreateProductPayload = {
      title: addProductForm.title,
      description: addProductForm.description ? addProductForm.description : undefined,
      price: Number(addProductForm.price),
      sku: addProductForm.sku,
      imageUrl: addProductForm.imageUrl ? addProductForm.imageUrl : undefined,
      categoryId: Number(addProductForm.categoryId),
      sizes: sizePayload.length ? sizePayload : undefined,
    };
    await createProduct(payload);
    products.value = await fetchProducts();
    showSuccess('Новый товар добавлен.');
    toggleAddProductModal(false);
  } catch (error) {
    showError(error);
  } finally {
    creatingProduct.value = false;
  }
};

const saveProduct = async () => {
  if (!productForm.value) {
    return;
  }
  let sizePayload: ProductSizePayload[] = [];
  try {
    sizePayload = buildSizePayload(productForm.value.sizes);
  } catch (error) {
    showError(error);
    return;
  }
  try {
    productSaving.value = true;
    const payload: UpdateProductPayload = {
      title: productForm.value.title,
      description: productForm.value.description || undefined,
      price: Number(productForm.value.price),
      sku: productForm.value.sku,
      imageUrl: productForm.value.imageUrl || undefined,
      categoryId: productForm.value.categoryId
        ? Number(productForm.value.categoryId)
        : undefined,
      sizes: sizePayload,
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

const saveNewOrder = async () => {
  if (!addOrderForm.userId || !addOrderForm.statusId || addOrderForm.totalAmount === '') {
    return;
  }

  try {
    creatingOrder.value = true;
    const payload: CreateOrderPayload = {
      userId: Number(addOrderForm.userId),
      statusId: Number(addOrderForm.statusId),
      totalAmount: Number(addOrderForm.totalAmount),
      paymentMethod: addOrderForm.paymentMethod ? addOrderForm.paymentMethod : undefined,
      comment: addOrderForm.comment ? addOrderForm.comment : undefined,
      shippingStatus: addOrderForm.shippingStatus ? addOrderForm.shippingStatus : undefined,
      addressId: addOrderForm.addressId ? Number(addOrderForm.addressId) : undefined,
    };
    const createdOrder = await createOrder(payload);
    ensureShippingStatusOption(createdOrder.shippingStatus);
    orders.value = await fetchOrders();
    orders.value.forEach((order) => ensureShippingStatusOption(order.shippingStatus));
    showSuccess('Заказ создан.');
    toggleAddOrderModal(false);
    await reportsStore.loadDailySales();
  } catch (error) {
    showError(error);
  } finally {
    creatingOrder.value = false;
  }
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

.manager-block__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.manager-block__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.manager-block__subtitle {
  margin: -0.25rem 0 0;
  color: var(--color-text-muted);
  max-width: 58rem;
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

.manager-analytics {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.manager-analytics__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
  background: color-mix(in srgb, var(--color-surface-alt) 88%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: var(--shadow-soft);
}

.summary-card__label {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.summary-card__value {
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 600;
}

.manager-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 40%, transparent);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
}

.manager-empty__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.manager-empty__subtitle {
  margin: 0;
  max-width: 30rem;
  color: var(--color-text-muted);
}

.manager-sizes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 35%, transparent);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
}

.manager-sizes__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.manager-sizes__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.manager-sizes__row {
  margin: 0;
}

.manager-modal__empty {
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--color-accent) 45%, transparent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 575.98px) {
  .manager-block__header :deep(.btn) {
    width: 100%;
  }
}
</style>
