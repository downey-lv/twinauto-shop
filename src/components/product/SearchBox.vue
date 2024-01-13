<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="row g-5 g-xl-8">
        <div class="col-md-2">
          <div class="input-group">
            <div class="form-floating">
              <Field
                type="text"
                class="form-control form-control-solid"
                name="id"
                v-model="searchData.id"
                @keyup.enter="search('id')"
                placeholder="ID"
                autocomplete="off"
              />
              <label>ID</label>
            </div>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="search('id')"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div class="col-md-3">
          <div class="input-group">
            <div class="form-floating">
              <Field
                type="text"
                class="form-control form-control-solid"
                name="code"
                v-model="searchData.code"
                @keyup.enter="search('code')"
                placeholder="Kods"
                autocomplete="off"
              />
              <label>Kods</label>
            </div>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="search('code')"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div class="col-md-1 d-flex align-items-center justify-content-center">
          <div
            class="form-check form-switch form-check-custom form-check-solid"
          >
            <input
              class="form-check-input h-20px w-30px"
              type="checkbox"
              v-model="searchData.oe"
              @change="search('code')"
            />
            <label class="form-check-label"> OE analogi </label>
          </div>
        </div>

        <div class="col-md-3">
          <div class="row">
            <div class="col-9">
              <div class="input-group">
                <div class="form-floating">
                  <Field
                    type="text"
                    class="form-control form-control-solid"
                    name="code"
                    v-model="searchData.text"
                    @keyup.enter="search('text')"
                    placeholder="Teksts"
                    autocomplete="off"
                  />
                  <label>Teksts</label>
                </div>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="search('text')"
                >
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
            <div class="col-3 d-flex align-items-center justify-content-center">
              <div
                class="form-check form-switch form-check-custom form-check-solid"
              >
                <input
                  class="form-check-input h-20px w-30px"
                  type="checkbox"
                  v-model="searchData.partialText"
                  @change="search('text')"
                />
                <label class="form-check-label"> Daļējs teksts </label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3" v-loading="loading" v-if="groups">
          <treeselect
            v-model="searchData.groups"
            :multiple="true"
            :options="groups"
            placeholder="Grupa"
            :key="componentKey"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { Field } from "vee-validate";
import { useRoute, useRouter } from "vue-router";
import Treeselect from "@reside-ic/vue3-treeselect";
import "/src/assets/vue3-treeselect.css";
import ApiService from "@/core/services/ApiService";
import type { WatchStopHandle } from "vue";

export default defineComponent({
  name: "search-box",
  components: {
    Field,
    Treeselect,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const componentKey = ref(0);
    const groups = ref();
    const loading = ref(false);
    const watcherHandles: WatchStopHandle[] = [];

    const searchData = reactive({
      id: "",
      code: "",
      text: "",
      analogues: false,
      oe: false,
      groups: null,
      partialText: false,
    });

    const setParams = () => {
      const query = route.query;
      const params = route.params;

      for (const key in searchData) {
        if (["id", "code", "text"].includes(key)) {
          searchData[key] =
            params.type && params.type.toString() === key
              ? params.query?.toString() || ""
              : "";
        } else if (["analogues", "oe", "partialText"].includes(key)) {
          searchData[key] = Boolean(query[key]);
        } else if (["groups"].includes(key)) {
          const groupsFromQuery = query[key];
          if (groupsFromQuery) {
            // Transform the query parameter into an array of numbers (IDs)
            searchData[key] = groupsFromQuery.toString().split(",");
          } else {
            searchData[key] = [];
          }
          componentKey.value++;
        }
      }
    };

    onMounted(() => setParams());
    const rWatcher = watch(route, () => setParams(), { deep: true });
    watcherHandles.push(rWatcher);

    const openGroup = (newValue, oldValue) => {
      if (newValue === oldValue) return;

      let updatedQuery = { ...route.query };
      if (newValue && newValue.length > 0) {
        updatedQuery.groups = Object.values(newValue)
          .filter((n) => n)
          .join(",");
      } else {
        delete updatedQuery.groups;
      }

      let updatedParams = { ...route.params };
      if (!updatedParams.type) {
        updatedParams.type = "all";
      }

      if (route.name) {
        router.push({
          name: route.name,
          params: updatedParams,
          query: updatedQuery,
        });
      }
    };

    const gWatcher = watch(() => searchData.groups, openGroup);
    watcherHandles.push(gWatcher);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      searchData,
      groups,
      loading,
      componentKey,
    };
  },
  mounted() {
    this.loadGroups();
  },
  methods: {
    search(field: string) {
      if (this.searchData[field]) {
        let route = {
          name: "search-parts",
          params: {
            type: field,
            query: this.searchData[field],
          },
        };

        let query = {};
        if (field === "code") {
          if (this.searchData.analogues) query["analogues"] = 1;
          if (this.searchData.oe) query["oe"] = 1;
        } else if (field === "text") {
          if (this.searchData.partialText) query["partialText"] = 1;
        }

        if (
          this.searchData.groups &&
          Object.keys(this.searchData.groups).length > 0
        )
          query["groups"] = Object.values(this.searchData.groups)
            .filter((n) => n)
            .join(",");

        route["query"] = query;

        this.$router.push(route);
      }
    },
    loadGroups() {
      this.loading = true;
      ApiService.get(`group/tree`)
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
</script>
