<template>
  <SearchBox />
  <div class="row g-5 g-xl-8">
    <div class="col-12" v-if="dataUrl">
      <PartsTable resource="product/find" :slug="dataUrl" :query="dataQuery">
        <template v-slot:header>
          <h3 class="card-title"></h3>
          <div class="card-toolbar">
            <router-link
              :to="{ name: 'product-edit', params: { id: 'new' } }"
              class="btn btn-sm btn-info me-3"
            >
              Jauns
            </router-link>
          </div>
        </template>
      </PartsTable>
    </div>
    <div class="col-12" v-else>
      <div class="separator separator-content my-15">vai</div>
      <div class="text-center">
        <button type="button" class="btn btn-light me-3" @click="loadAll = true">
          Parādīt jaunākos produktus
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue";
import PartsTable from "@/components/parts/PartsTable.vue";
import { useRoute } from "vue-router";
import SearchBox from "@/components/parts/SearchBox.vue";

export default defineComponent({
  components: {
    SearchBox,
    PartsTable,
  },
  setup() {
    const route = useRoute();
    const loadAll = ref(false);

    const dataUrl = computed(() => {
      let url;
      if (route.params.type && route.params.query) {
        const search = encodeURIComponent(String(route.params.query));
        url = `${route.params.type}/${search}`;
      } else if (route.params.type === "all") {
        if (loadAll.value) {
          url = "all/";
        } else {
          url = null;
        }
      }
      return url;
    });

    const dataQuery = computed(() => {
      return route.query;
    });

    return { dataUrl, dataQuery, loadAll };
  },
});
</script>
