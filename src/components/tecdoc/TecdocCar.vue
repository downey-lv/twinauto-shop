<template>
  <!--begin::List Widget 4-->
  <div class="card" :class="widgetClasses">
    <!--begin::Header-->
    <div class="card-header border-0 pt-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label fw-bold text-dark">Automašīna</span>
      </h3>
    </div>
    <!--end::Header-->

    <!--begin::Body-->
    <div class="card-body pt-5" v-loading="loading">
      <div class="image-wrapper" v-if="image != ''">
        <div class="text-center">
          <img :src="image" alt="Car image" />
        </div>
        <div class="separator separator-dashed my-3"></div>
      </div>

      <template v-for="(item, index) in list" :key="index">
        <div class="d-flex flex-stack">
          <div class="text-gray-700 fw-semibold fs-6 me-2">{{ index }}</div>
          <div class="d-flex align-items-center">{{ item }}</div>
        </div>
      </template>
      <csddDetails :altDetails="details" />
    </div>
    <!--end::Body-->
  </div>
  <!--end::List Widget 4-->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "@/stores/breadcrumb";
import ApiService from "@/core/services/ApiService";
import csddDetails from "@/components/tecdoc/CsddDetails.vue";

export default defineComponent({
  name: "tecdoc-car",
  props: {
    widgetClasses: String,
  },
  components: {
    csddDetails,
  },
  setup() {
    const loading = ref<boolean>(false);
    const list = ref();
    const image = "";
    const details = ref();

    const route = useRoute();
    let newDetails = {};
    if (route.query.registration)
      newDetails["Reģ. nr."] = route.query.registration;
    if (route.query.vin) newDetails["VIN"] = route.query.vin;
    details.value = newDetails;

    return {
      list,
      image,
      loading,
      details,
    };
  },
  mounted() {
    this.loading = true;
    ApiService.get(`tecdoc/car`, `${this.$route.params.carId}`)
      .then((response) => {
        const data = response.data;
        const d = data.details;
        this.image = data["image"];
        this.list = d;

        const breadcrumbStore = useBreadcrumbStore();
        breadcrumbStore.setBreadcrumbs(
          "tecdoc-car",
          {
            makeId: d["Marka"],
            modelId: d["Modelis"],
            carId: d["Modifikācija"],
          },
          ["tecdoc-car", "tecdoc-groups", "tecdoc-parts"]
        );

        // Function to check if the object exists in the array
        function objectExistsInArray(array, dictionary) {
          // Check if 'array' is actually an array first
          if (Array.isArray(array)) {
            return array.some(
              (item) =>
                item.label === dictionary.label &&
                item.params.makeId === dictionary.params.makeId &&
                item.params.modelId === dictionary.params.modelId &&
                item.params.carId === dictionary.params.carId
            );
          } else {
            return false;
          }
        }

        const savedHistory = localStorage.getItem("searchHistory");
        let searchHistory = [] as any[];
        if (savedHistory) searchHistory = JSON.parse(savedHistory);
        const searchQuery = {
          label: `${d["Marka"]} ${d["Modelis"]} ${d["Modifikācija"]}`,
          params: {
            makeId: this.$route.params.makeId,
            modelId: this.$route.params.modelId,
            carId: this.$route.params.carId,
          },
          query: {
            vin: this.$route.query.vin || "",
            registration: this.$route.query.registration || "",
          },
        };

        if (!objectExistsInArray(searchHistory, searchQuery)) {
          searchHistory.push(searchQuery);

          // Limit to 25 items
          searchHistory = searchHistory.slice(-25);

          // Save the search history to localStorage
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
});
</script>
