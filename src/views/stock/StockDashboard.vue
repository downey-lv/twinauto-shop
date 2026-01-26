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
            class="fa-duotone fa-solid fs-3x mx-n1"
            :class="`fa-${item.icon}`"
          ></i>

          <div class="fw-bold fs-2 mb-2 mt-5">
            {{ item.title }}
          </div>

          <div class="fw-semobold fs-7">
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
import Swal from "sweetalert2/dist/sweetalert2.js";

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
            title: "Drukāt lapu",
            subtitle: "",
            icon: "file-lines",
            action: "print_stocktake",
          },
          {
            title: "Saskaitītās novietnes",
            subtitle: "",
            icon: "shelves",
            route: {
              name: "stock-locations",
            },
          },
          {
            title: "Atlikumu pārbaude",
            subtitle: "",
            icon: "rectangles-mixed",
            route: {
              name: "stock-control",
            },
          },
          {
            title: "Mainīt produktu novietnes",
            subtitle: "",
            icon: "location-crosshairs",
            action: "update_locations",
          },
          {
            title: "Saglabāt atlikumus",
            subtitle: "",
            icon: "retweet",
            action: "update_rest",
          },
          {
            title: "Inventarizācijas rezultāts",
            subtitle: "",
            icon: "square-poll-horizontal",
            route: {
              name: "stock-result",
              params: {
                stocktakeId: activeStocktake,
              },
            },
          },
          {
            title: "Pārtraukt inventarizāciju",
            subtitle: "",
            icon: "hand",
            action: "deactivate_stocktake",
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
          {
            title: "Inventarizāciju rezultāti",
            subtitle: "",
            icon: "square-poll-horizontal",
            route: {
              name: "stock-result-list",
            },
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
    updateLocations() {
      this.loading = true;
      // Update stocktake locations
      ApiService.post(`/stocktake/update-locations`, {})
        .then(() => {
          push.success("Produktu novietnes veiksmīgi atjaunotas");
        })
        .catch((error) => {
          console.error(`Error updating stocktake locations:`, error);
          const message =
            error.response?.data?.message ||
            "Neizdevās atjaunot produktu novietnes";
          push.error(message);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateRest() {
      this.loading = true;
      // Update stocktake locations
      ApiService.post(`/stocktake/order`, {})
        .then(() => {
          push.success("Produktu atlikumi saglabāti");
        })
        .catch((error) => {
          console.error(`Error updating stocktake locations:`, error);
          const message =
            error.response?.data?.message ||
            "Neizdevās saglabāt produktu atlikumus";
          push.error(message);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    deactivateStocktake() {
      this.loading = true;
      // Deactivate active stocktake
      ApiService.post(`/stocktake/deactivate`, {})
        .then(() => {
          this.setActive(null);
        })
        .catch((error) => {
          console.error(`Error deactivating stocktake:`, error);
          const message =
            error.response?.data?.message ||
            "Neizdevās pārtraukt inventarizāciju";
          push.error(message);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    newStocktake() {
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
    },
    async printStocktake() {
      await ApiService.pdf("stocktake/print");
    },
    async handleClick(item) {
      if (item.action === "new_stocktake") {
        this.newStocktake();
      } else if (item.action === "update_locations") {
        const result = await Swal.fire({
          title: "Vai esi pārliecināts?",
          text: `Tiks mainītas visu saskaitīto produktu novietnes`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Jā, mainīt",
          cancelButtonText: "Atcelt",
        });

        if (result.isConfirmed) {
          this.updateLocations();
        }
      } else if (item.action === "deactivate_stocktake") {
        const result = await Swal.fire({
          title: "Vai esi pārliecināts?",
          text: `Preču skaitīšana un atlikumu labošana vairs nebūs iespējama`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Jā, slēgt inventarizāciju",
          cancelButtonText: "Atcelt",
        });

        if (result.isConfirmed) {
          this.deactivateStocktake();
        }
      } else if (item.action === "print_stocktake") {
        await this.printStocktake();
      } else if (item.action === "update_rest") {
        const result = await Swal.fire({
          title: "Vai esi pārliecināts?",
          text: `Preču atlikumi tiks mainīti uz pārbaudītajiem`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Jā, saglabāt",
          cancelButtonText: "Atcelt",
        });

        if (result.isConfirmed) {
          this.updateRest();
        }
      }
    },
  },
});
</script>
