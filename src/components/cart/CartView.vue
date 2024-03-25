<template>
  <div v-loading="loading">
    <div class="row">
      <div class="col-5 fw-bold">Nosaukums</div>
      <div class="col">
        {{ cartData.title }}
      </div>
    </div>
    <div class="row">
      <div class="col-5 fw-bold">Lietotājs</div>
      <div class="col">
        {{ cartData.owner_name }}
      </div>
    </div>
    <div class="row">
      <div class="col-5 fw-bold">Izveidots</div>
      <div class="col">
        {{ cartData.created_timestamp }}
      </div>
    </div>
    <div class="separator separator-dashed my-6"></div>
    <CartProducts
      :cart-data="cartData"
      @refresh="loadData"
      :enable-controls="enableControls"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import type { Cart } from "@/types/Cart";
import CartProducts from "@/components/cart/CartProducts.vue";

export default defineComponent({
  name: "cart-view",
  components: { CartProducts },
  props: {
    cartId: {
      type: Number,
      required: true,
    },
    enableControls: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const formRef = ref<null | HTMLFormElement>(null);
    const cartViewModalRef = ref();
    const loading = ref<boolean>(false);

    const blankCart: Cart = {
      cart_id: "",
      title: "",
      owner_name: "",
      products: [],
    };
    const cartData = ref({ ...blankCart });

    const cartAdd = ref([]);
    function loadData() {
      cartData.value = { ...blankCart };

      if (!props.cartId) return;

      // Load cart data
      loading.value = true;
      ApiService.get(`cart/${props.cartId}`)
        .then((response) => {
          cartData.value = response.data;
        })
        .catch(() => {
          push.error("Neizdevās ielādēt grozu");
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Setup data load
    const idWatcher = watch(
      () => props.cartId,
      (newVal) => {
        if (newVal) loadData();
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      idWatcher();
    });

    return {
      cartAdd,
      formRef,
      loading,
      cartViewModalRef,
      loadData,
      cartData,
    };
  },
});
</script>
