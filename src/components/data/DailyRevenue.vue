<template>
  <div class="card card-flush mb-5 mb-xl-10" v-loading="loading">
    <!--begin::Header-->
    <div class="card-header pt-5">
      <!--begin::Title-->
      <div class="card-title d-flex flex-column">
        <!--begin::Info-->
        <div class="d-flex align-items-center">
          <!--begin::Currency-->
          <span class="fs-4 fw-semibold text-gray-400 me-1 align-self-start"
            >€</span
          >
          <!--end::Currency-->

          <!--begin::Amount-->
          <span class="fs-2hx fw-bold text-dark me-2 lh-1 ls-n2" v-if="data">{{
            data.total || 0
          }}</span>
          <!--end::Amount-->
        </div>
        <!--end::Info-->

        <!--begin::Subtitle-->
        <span class="text-gray-400 pt-1 fw-semibold fs-6">{{
          workstation
        }}</span>
        <!--end::Subtitle-->
      </div>
      <!--end::Title-->

      <div class="card-toolbar">
        <button
          class="btn btn-icon btn-color-gray-400 btn-active-color-primary justify-content-end"
          @click="printLabel($event)"
        >
          <i class="fa-solid fa-note-sticky"></i>
        </button>
      </div>
    </div>
    <!--end::Header-->

    <!--begin::Card body-->
    <div class="card-body pt-2 pb-4 d-flex flex-wrap align-items-center">
      <!--begin::Labels-->
      <div class="d-flex flex-column content-justify-center flex-row-fluid">
        <div
          class="d-flex fw-semibold align-items-center"
          v-for="(item, index) in amounts"
          :key="index"
        >
          <div
            v-if="item.separator"
            class="separator separator-dashed my-3"
          ></div>
          <template v-else>
            <div
              class="bullet w-8px h-3px rounded-2 me-3"
              :class="`bg-` + item.color"
            ></div>
            <div class="text-gray-500 flex-grow-1 me-4">{{ item.title }}</div>
            <div class="fw-bolder text-gray-700 text-xxl-end">
              € {{ item.amount }}
            </div>
          </template>
        </div>
      </div>
      <!--end::Labels-->
    </div>
    <!--end::Card body-->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { labelService } from "@/core/services/LabelService";

export default defineComponent({
  props: {
    widgetClasses: String,
    type: String,
  },
  setup(props) {
    const loading = ref<boolean>(false);
    const data = ref();
    const amounts = ref();

    return {
      data,
      amounts,
      loading,
      workstation: props.type,
    };
  },
  mounted() {
    this.loading = true;
    ApiService.get(`data/daily/revenue`, this.workstation)
      .then((response) => {
        this.data = response.data;

        this.amounts = [
          {
            title: "Skaidra nauda",
            amount: this.data.kase,
            color: "success",
          },
          {
            title: "Veikals",
            amount: this.data.veikals_kase,
            color: "secondary",
          },
          {
            title: "Internets",
            amount: this.data.online_kase,
            color: "secondary",
          },
          { separator: 1 },
          {
            title: "Karte",
            amount: this.data.karte,
            color: "info",
          },
          {
            title: "Veikals",
            amount: this.data.veikals_karte,
            color: "secondary",
          },
          {
            title: " Internets",
            amount: this.data.online_karte,
            color: "secondary",
          },
          { separator: 1 },
          {
            title: "Atlikums",
            amount: this.data.cash,
            color: "warning",
          },
        ];
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    async printLabel(event) {
      // Format button
      const el = event.target;
      const value = el.innerHTML;
      el.innerHTML = `<i class="fa-solid fa-spinner-third fa-spin"></i>`;

      try {
        await labelService.print("revenue", this.data);
      } finally {
        el.innerHTML = value;
      }
    },
  },
});
</script>
