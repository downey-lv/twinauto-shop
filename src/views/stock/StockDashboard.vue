<template>
  <div class="row g-5 g-xl-8" v-loading="loading">
    <div class="col-xl-4" v-for="(item, index) in menu" :key="index">
      <component
        :is="item.route ? 'router-link' : 'a'"
        v-bind="item.route ? { to: item.route } : { href: 'javascript:;' }"
        @click="!item.route && handleClick(item)"
        class="card hoverable card-xl-stretch mb-xl-8 bg-primary-light"
      >
        <!--begin::Body-->
        <div class="card-body">
          <i
            class="fa-sharp-duotone fa-solid fs-3x mx-n1"
            :class="`fa-${item.icon}`"
          ></i>

          <div class="fw-bold fs-2 mb-2 mt-5 text-inverse-primary">
            {{ item.title }}
          </div>

          <div class="fw-semobold fs-7 text-inverse-primary">
            {{ item.subtitle }}
          </div>
        </div>
        <!--end::Body-->
      </component>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";

export default defineComponent({
  name: "stock-dashboard",
  components: {},
  setup() {
    const loading = ref(false);
    const menu = ref<any>([]);

    const setActive = (activeStocktake) => {
      if (activeStocktake) {
        menu.value = [
          {
            title: "Preču skaitīšana",
            subtitle: "",
            icon: "tally",
            route: {
              name: "stock-scan",
            },
          },
          {
            title: "Saskaitītās novietnes",
            subtitle: "",
            icon: "shelves",
            route: {
              name: "stock-locations",
            },
          },
        ];
      } else {
        menu.value = [
          {
            title: "Jauna inventarizācija",
            subtitle: "",
            icon: "list",
            action: "new_stocktake",
          },
        ];
      }
    };

    const getActive = () => {
      loading.value = true;
      // Get active stocktake
      ApiService.get(`/stocktake/active`)
        .then((response) => {
          const activeStocktake = response.data.stocktakeId || null;
          setActive(activeStocktake);
        })
        .catch((error) => {
          console.error(`Error fetching active stocktake:`, error);
          push.error(`Neizdevās ielādēt aktīvo inventerizāciju`);
        })
        .finally(() => {
          loading.value = false;
        });
    };

    getActive();

    return {
      menu,
      loading,
      setActive,
    };
  },
  methods: {
    handleClick(item) {
      if (item.action === "new_stocktake") {
        this.loading = true;
        // Create active stocktake
        ApiService.post(`/stocktake/create`, {})
          .then((response) => {
            const activeStocktake = response.data.stocktakeId || null;
            this.setActive(activeStocktake);
          })
          .catch((error) => {
            console.error(`Error creating new stocktake:`, error);
            const message =
              error.response?.data?.message ||
              "Neizdevās izveidot inventarizāciju";
            push.error(message);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
});
</script>
