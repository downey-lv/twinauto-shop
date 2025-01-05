<template>
  <div class="row mb-3 fw-bold">
    <label class="col-lg-2">Piegādātājs</label>
    <label class="col-lg-4">Kods</label>
    <label class="col-lg-3"
      >Piegāde
      <i
        class="fa-solid fa-circle-info text-info ms-1"
        title="<span class='text-success'>Piegāde šodien</span><br/><span class='text-warning'>Piegāde rīt</span>"
        v-tooltip-html
      ></i
    ></label>
    <label class="col-lg-1">Atl.</label>
    <label class="col-lg-2">Cena</label>
  </div>
  <div class="row mb-3" v-for="(item, index) in suppliers" :key="index">
    <label class="col-lg-2">
      <a href="#" @click.prevent="selectSupplier(item)" v-if="enableSelect">
        {{ item.supplier_name }}
      </a>
      <span v-else>{{ item.supplier_name }}</span>
    </label>
    <label class="col-lg-4">
      {{ item.code_supplier }}
      <a :href="item.search_url" target="_blank" v-if="item.search_url">
        <KTIcon icon-name="magnifier" icon-class="fs-5 text-info" />
      </a>
      <Copy
        :value="item.code_supplier"
        font-size="6"
        trim-spaces
        button-class="ms-1"
      />
    </label>
    <label
      class="col-lg-3"
      :class="
        item.delivery_days === 0
          ? `text-success`
          : item.delivery_days === 1
          ? `text-warning`
          : ``
      "
      :title="item.delivery_warehouse"
      v-tooltip
    >
      {{ item.delivery_info ?? "" }}
    </label>
    <label
      class="col-lg-1"
      :class="item.supplier_rest == 0 ? `text-danger` : ``"
      ><template v-if="item.rest_overflow">> </template
      >{{ item.supplier_rest }}</label
    >
    <label
      class="col-lg-2"
      :title="item.volume_pricing_string || item.order_date || ''"
      v-tooltip-html
    >
      {{ item.supplier_price }} €
      <i
        v-if="item.volume_pricing_string"
        class="fa-solid fa-badge-percent text-warning"
      ></i>
      <span
        v-if="item.deposit_price > 0"
        :title="item.deposit_details"
        v-tooltip
      >
        <br /><i class="fa-solid fa-money-bill-transfer text-info"></i>
        {{ item.deposit_price }} €
      </span>
      <span v-if="item.min_order"><br />Min. {{ item.min_order }} gab.</span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Supplier } from "@/types/Product";
import Copy from "@/components/core/buttons/Copy.vue";

export default defineComponent({
  name: "product-suppliers",
  components: { Copy },
  props: {
    suppliers: {
      type: Object as PropType<Supplier[]>,
      required: true,
    },
    enableSelect: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["select-supplier"],
  setup(props) {
    return {};
  },
  methods: {
    selectSupplier(supplier: Supplier) {
      this.$emit("select-supplier", supplier.supplier_autoshop_id);
    },
  },
});
</script>
