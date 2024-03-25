<template>
  <el-table :data="cartData.products" style="width: 100%">
    <el-table-column property="productidstr" label="ID" sortable />
    <el-table-column property="productcode" label="Kods" sortable />
    <el-table-column property="producer" label="Ražotājs" sortable />
    <el-table-column property="quantity" label="Daudzums" sortable />
    <el-table-column property="price" label="Cena" sortable />
    <el-table-column v-if="enableControls">
      <template #default="scope">
        <el-popconfirm
          confirm-button-text="Dzēst"
          cancel-button-text="Atcelt"
          confirm-button-type="danger"
          :title="`Izdzēst preci no groza?`"
          :width="300"
          @confirm="removeProduct(scope.row.entry_id)"
        >
          <template #reference>
            <el-button type="danger" size="small">Dzēst</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import "@/assets/uploader.css";
import type { PropType } from "vue";
import type { Cart } from "@/types/Cart";

export default defineComponent({
  name: "cart-view-modal",
  props: {
    cartData: {
      type: Object as PropType<Cart>,
      required: true,
    },
    enableControls: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["refresh"],
  setup() {},
  methods: {
    removeProduct(entryId: number) {
      ApiService.delete(`cart/${this.cartData.cart_id}/${entryId}`)
        .then(() => {
          push.success("Prece izdzēsta no groza");
          this.$emit("refresh");
        })
        .catch((error) => {
          push.error("Neizdevās izdzēst preci no groza");
          console.error(error);
        });
    },
  },
});
</script>
