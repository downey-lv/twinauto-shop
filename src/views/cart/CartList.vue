<template>
  <div class="card mb-2" v-loading="loading">
    <div class="card-body">
      <el-table :data="carts" style="width: 100%">
        <el-table-column
          property="owner_name"
          label="Lietotājs"
          sortable
          :filters="cartUsers"
          :filter-method="filterUsers"
        />
        <el-table-column property="title" label="Nosaukums" sortable />
        <el-table-column
          property="created_timestamp"
          label="Izveidots"
          sortable
        />
        <el-table-column label="">
          <template #default="scope">
            <el-button
              type="info"
              size="small"
              @click="viewCart(scope.row.cart_id, scope.row.recipient_id)"
              >Atvērt</el-button
            >
            <el-button
              type="success"
              size="small"
              @click="sellCart(scope.row.cart_id, scope.row.recipient_id)"
              >Pārdot</el-button
            >
            <el-popconfirm
              confirm-button-text="Dzēst"
              cancel-button-text="Atcelt"
              confirm-button-type="danger"
              :title="`Izdzēst grozu?`"
              :width="300"
              @confirm="removeCart(scope.row.cart_id)"
            >
              <template #reference>
                <el-button type="danger" size="small">Dzēst</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <CartViewModal
    ref="cartViewModalRef"
    :cart-id="cartId"
    @delete="removeCart(cartId)"
    @sell="sellCart(cartId, recipientId)"
  />
  <CartSellModal
    ref="cartSellModalRef"
    :cart-id="cartId"
    :recipient-id="recipientId"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import type { Cart } from "@/types/Cart";
import { push } from "@/main";
import { DateTime } from "luxon";
import CartViewModal from "@/components/cart/CartViewModal.vue";
import CartSellModal from "@/components/cart/CartSellModal.vue";

export default defineComponent({
  components: { CartSellModal, CartViewModal },
  computed: {
    DateTime() {
      return DateTime;
    },
  },
  setup() {
    const loading = ref<boolean>(false);
    const cartId = ref<number>(0);
    const recipientId = ref<string>("");
    const carts = ref<Cart[]>([]);
    const cartUsers = ref<any>([]);
    function loadCarts() {
      loading.value = true;
      ApiService.get("cart", "list")
        .then((response) => {
          carts.value = response.data.cartObj;

          // Get unique users
          cartUsers.value = Array.from(
            new Set(carts.value.map((cart) => cart.owner_name))
          ).map((user) => {
            return { text: user, value: user };
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    return {
      loading,
      carts,
      loadCarts,
      cartUsers,
      cartId,
      recipientId,
    };
  },
  async mounted() {
    this.loadCarts();
  },
  methods: {
    removeCart(cartId) {
      ApiService.delete(`cart/${cartId}`)
        .then(() => {
          this.loadCarts();
          push.success("Grozs izdzēsts");
        })
        .catch(() => {
          push.error("Neizdevās izdzēst");
        });
    },
    viewCart(cartId, recipientId) {
      this.cartId = cartId;
      this.recipientId = recipientId;
      (this.$refs.cartViewModalRef as any).show();
    },
    sellCart(cartId, recipientId) {
      this.cartId = cartId;
      this.recipientId = recipientId;
      (this.$refs.cartSellModalRef as any).show();
    },
    filterUsers(value: string, row) {
      return row.owner_name === value;
    },
  },
});
</script>
